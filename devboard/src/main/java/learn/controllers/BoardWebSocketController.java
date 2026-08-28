package learn.controllers;

import learn.domain.BoardElementService;
import learn.dtos.RoomRequest;
import learn.models.BoardElement;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import tools.jackson.databind.JsonNode;

import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.UUID;

@Controller
@AllArgsConstructor
public class BoardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final BoardElementService elementService;

    //TODO make more secure
    @MessageMapping("/create")
    public void createRoom(@Payload RoomRequest request) throws NoSuchAlgorithmException {
        String roomCode = generateRoomCode();
        messagingTemplate.convertAndSend("/topic/reply/" + request.clientId(),
                                                    roomCode);
    }

    @MessageMapping("/join/{boardId}")
    @SendTo("/topic/room/{room_string}")
    public String clientJoinsAndGetsBoardState(@DestinationVariable long boardId) {
        return "Welcome to the room";
    }

    @MessageMapping("/room/{roomCode}")
    @SendTo("/topic/room/{boardId}")
    public JsonNode updateBoard(JsonNode message) {
        System.out.println(message);
        return message;
    }

    //TODO some way to ensure unique room code
    private String generateRoomCode() throws NoSuchAlgorithmException {
        return UUID.randomUUID()
                .toString()
                .replace("-", "");
    }
}