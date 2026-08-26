package learn.controllers;

import learn.models.BoardElement;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class BoardWebSocketController {

    @MessageMapping("/board/{boardId}")
    @SendTo("/topic/board/{boardId}")
    public BoardElement updateBoard(BoardElement message) {
        return message;
    }
}