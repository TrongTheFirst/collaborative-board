package learn.controllers;

import learn.models.BoardElement;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import tools.jackson.databind.JsonNode;

@Controller
public class BoardWebSocketController {

    @MessageMapping("/board/{boardId}")
    @SendTo("/topic/board/{boardId}")
    public JsonNode updateBoard(JsonNode message) {
        System.out.println(message);
        return message;
    }
}