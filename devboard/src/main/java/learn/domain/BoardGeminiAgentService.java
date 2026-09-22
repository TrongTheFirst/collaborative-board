package learn.domain;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.genai.Client;
import com.google.genai.types.*;
import learn.data.DataAccessException;
import learn.models.BoardElement;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import tools.jackson.databind.node.ArrayNode;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class BoardGeminiAgentService {

    private final BoardElementService elementService;
    private final Client client = new Client();
    private final ObjectMapper mapper = new ObjectMapper();
    private static final String MODEL = "gemini-3.5-flash";

    public BoardGeminiAgentService(BoardElementService elementService) {
        this.elementService = elementService;
    }

    public String runAgent(long boardId, String prompt, double centerX, double centerY) {
        //define what points look like
        Schema pointSchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(ImmutableMap.of(
                        "x", Schema.builder().type(Type.Known.NUMBER).build(),
                        "y", Schema.builder().type(Type.Known.NUMBER).build()))
                .build();
        //define what element_data looks like
        Schema elementSchema = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(ImmutableMap.<String, Schema>builder()
                        .put("shapeType", Schema.builder()
                                .type(Type.Known.STRING)
                                .enum_(ImmutableList.of("rectangle", "ellipse", "line", "text", "freeform"))
                                .build())
                        .put("x", Schema.builder().type(Type.Known.NUMBER).description("Top-left x of the bounding box - same convention for every shape type.").build())
                        .put("y", Schema.builder().type(Type.Known.NUMBER).description("Top-left y of the bounding box - same convention for every shape type.").build())
                        .put("width", Schema.builder().type(Type.Known.NUMBER).description("Width - rectangle/ellipse only.").build())
                        .put("height", Schema.builder().type(Type.Known.NUMBER).description("Height - rectangle/ellipse only.").build())
                        .put("x2", Schema.builder().type(Type.Known.NUMBER).description("End x - line only.").build())
                        .put("y2", Schema.builder().type(Type.Known.NUMBER).description("End y - line only.").build())
                        .put("text", Schema.builder().type(Type.Known.STRING).description("Label text - text only.").build())
                        .put("color", Schema.builder().type(Type.Known.STRING).description("Hex color, e.g. #E24B4A.").build())
                        .put("strokeWidth", Schema.builder().type(Type.Known.NUMBER).description("Outline thickness - shapes only.").build())
                        .put("strokeStyle", Schema.builder().type(Type.Known.STRING)
                                .enum_(ImmutableList.of("solid", "dashed", "dotted")).build())
                        .put("points", Schema.builder().type(Type.Known.ARRAY).items(pointSchema)
                                .description("Freeform only - offsets relative to (x, y).").build())
                        .build())
                .required(ImmutableList.of("shapeType", "x", "y"))
                .build();

        Schema drawElementsParams = Schema.builder()
                .type(Type.Known.OBJECT)
                .properties(ImmutableMap.of(
                        "elements", Schema.builder().type(Type.Known.ARRAY).items(elementSchema).build()))
                .required(ImmutableList.of("elements"))
                .build();

        FunctionDeclaration drawElements = FunctionDeclaration.builder()
                .name("draw_elements")
                .description("Draw one or more elements on the whiteboard in a single call. " +
                        "Plan the full composition first, then provide every element in one array.")
                .parameters(drawElementsParams)
                .build();

        Tool tool = Tool.builder().functionDeclarations(ImmutableList.of(drawElements)).build();

        Content systemInstruction = Content.fromParts(Part.fromText("""
                You are drawing on a 2D whiteboard. The user's current view is centered
                around (%.0f, %.0f) in board coordinates. Place elements near this point
                unless the user asks for a specific different location.

                You have one tool, draw_elements, which takes an array. Plan the whole
                composition first, then include every shape it needs in a single call.
                Use shapeType "freeform" with a points array for anything curved or
                irregular - its points are relative offsets from its own (x, y).
                Use the color field to make drawings visually distinct - don't default
                everything to black. Shapes only support outline color, not fill.
                """.formatted(centerX, centerY)));

        GenerateContentConfig config = GenerateContentConfig.builder()
                .tools(tool)
                .systemInstruction(systemInstruction)
                .build();
        //call Gemini
        GenerateContentResponse response = client.models.generateContent(MODEL, prompt, config);

        int added = 0;
        int failed = 0;
        String text = response.text();

        //turn the agent response to actual objects
        List<FunctionCall> calls = response.functionCalls();
        if (calls != null) {
            for (FunctionCall call : calls) {
                if (!"draw_elements".equals(call.name().orElse(""))) continue;
                Map<String, Object> args = call.args().orElse(Map.of());
                Object elementsRaw = args.get("elements");
                if (!(elementsRaw instanceof List<?> elements)) continue;

                for (Object elem : elements) {
                    if (elem instanceof Map<?, ?> spec) {
                        if (addOneElement(boardId, spec)) added++;
                        else failed++;
                    }
                }
            }
        }

        if (added == 0 && failed == 0) {
            return text != null ? text : "";
        }
        return "Added " + added + " element(s)" + (failed > 0 ? ", " + failed + " failed." : ".");
    }

    @SuppressWarnings("unchecked")
    private boolean addOneElement(long boardId, Map<?, ?> spec) {
        try {
            Map<String, Object> s = (Map<String, Object>) spec;
            String shapeType = (String) s.get("shapeType");

            ObjectNode elementData = mapper.createObjectNode();
            elementData.put("clientId", UUID.randomUUID().toString());
            String type;

            switch (shapeType) {
                case "rectangle" -> {
                    type = "rectangle";
                    elementData.put("x", asDouble(s.get("x")));
                    elementData.put("y", asDouble(s.get("y")));
                    elementData.put("width", asDouble(s.get("width")));
                    elementData.put("height", asDouble(s.get("height")));
                    elementData.put("strokeColor", s.getOrDefault("color", "#000000").toString());
                    elementData.put("strokeWidth", asDouble(s.getOrDefault("strokeWidth", 2)));
                    elementData.put("strokeStyle", s.getOrDefault("strokeStyle", "solid").toString());
                }
                case "ellipse" -> {
                    type = "ellipse";
                    double width = asDouble(s.get("width"));
                    double height = asDouble(s.get("height"));
                    elementData.put("x", asDouble(s.get("x")) + width / 2);
                    elementData.put("y", asDouble(s.get("y")) + height / 2);
                    elementData.put("width", width);
                    elementData.put("height", height);
                    elementData.put("strokeColor", s.getOrDefault("color", "#000000").toString());
                    elementData.put("strokeWidth", asDouble(s.getOrDefault("strokeWidth", 2)));
                    elementData.put("strokeStyle", s.getOrDefault("strokeStyle", "solid").toString());
                }
                case "line" -> {
                    type = "line";
                    elementData.put("x", asDouble(s.get("x")));
                    elementData.put("y", asDouble(s.get("y")));
                    elementData.put("x2", asDouble(s.get("x2")));
                    elementData.put("y2", asDouble(s.get("y2")));
                    elementData.put("strokeColor", s.getOrDefault("color", "#000000").toString());
                    elementData.put("strokeWidth", asDouble(s.getOrDefault("strokeWidth", 2)));
                    elementData.put("strokeStyle", s.getOrDefault("strokeStyle", "solid").toString());
                }
                case "text" -> {
                    type = "text";
                    elementData.put("x", asDouble(s.get("x")));
                    elementData.put("y", asDouble(s.get("y")));
                    elementData.put("width", 200);
                    elementData.put("height", 38);
                    elementData.put("text", String.valueOf(s.get("text")));
                    elementData.put("fillStyle", s.getOrDefault("color", "#000000").toString());
                }
                case "freeform" -> {
                    type = "freedraw";
                    elementData.put("x", asDouble(s.get("x")));
                    elementData.put("y", asDouble(s.get("y")));
                    elementData.put("roughness", 0);
                    elementData.put("strokeColor", s.getOrDefault("color", "#000000").toString());
                    elementData.put("strokeWidth", asDouble(s.getOrDefault("strokeWidth", 2)));
                    elementData.put("seed", (int) (Math.random() * Integer.MAX_VALUE));

                    ArrayNode points = mapper.createArrayNode();
                    Object rawPoints = s.get("points");
                    if (rawPoints instanceof List<?> pointList) {
                        for (Object p : pointList) {
                            if (p instanceof Map<?, ?> pm) {
                                ObjectNode point = mapper.createObjectNode();
                                point.put("x", asDouble(pm.get("x")));
                                point.put("y", asDouble(pm.get("y")));
                                points.add(point);
                            }
                        }
                    }
                    elementData.set("points", points);
                }
                default -> {
                    return false;
                }
            }

            BoardElement element = new BoardElement(0, boardId, type, elementData);
            Result<BoardElement> result = elementService.add(element);
            return result.isSuccess();
        } catch (DataAccessException | RuntimeException e) {
            return false;
        }
    }

    private double asDouble(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(o)); } catch (Exception e) { return 0.0; }
    }
}
