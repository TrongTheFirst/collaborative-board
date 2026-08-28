package learn.models;

import lombok.*;
import tools.jackson.databind.JsonNode;

import java.math.BigInteger;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class BoardElement {
    private long elementId;
    private long boardId;
    private String type;
    private JsonNode elementData;
}
