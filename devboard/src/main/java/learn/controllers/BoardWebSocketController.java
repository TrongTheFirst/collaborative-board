package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.BoardElementService;
import learn.domain.Result;
import learn.domain.RoomService;
import learn.dtos.*;
import learn.models.BoardElement;
import learn.models.Room;
import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@AllArgsConstructor
public class BoardWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final BoardElementService elementService;
    private final RoomService roomService;

    //TODO make more secure
    @MessageMapping("/create")
    public void createRoom(@Payload CreateRoomRequest request) throws DataAccessException {
        Result<Room> result = roomService.createForBoard(request.boardId());
        String replyTopic = "/topic/reply/" + request.clientId();

        if (!result.isSuccess()) {
            String error = String.join("; ", result.getErrorMessages());
            messagingTemplate.convertAndSend(replyTopic, new CreateRoomResponse(false, error, null));
            return;
        }
        messagingTemplate.convertAndSend(replyTopic,
                new CreateRoomResponse(true, null, result.getPayload().getRoomCode()));
    }

    @MessageMapping("/join")
    public void clientJoinsAndGetsBoardState(@Payload JoinRoomRequest request) throws DataAccessException {
        Room room = roomService.findByRoomCode(request.roomCode());
        String replyTopic = "/topic/reply/" + request.clientId();

        if (room == null) {
            messagingTemplate.convertAndSend(replyTopic, new JoinRoomResponse(false, "No room found", null,null ));
            return;
        }

        List<BoardElement> boardElements = elementService.findAllFromBoardId(room.getBoardId());
        messagingTemplate.convertAndSend(replyTopic, new JoinRoomResponse(true, null, room.getBoardId(), boardElements));
    }

    @MessageMapping("/room/{roomCode}")
    public void addBoardElement(@Payload BoardElement element, @DestinationVariable String roomCode) throws DataAccessException {
        Result<BoardElement> result = elementService.add(element);

        if (!result.isSuccess()) {
            messagingTemplate.convertAndSend("/topic/room/" + roomCode,
                    new BoardElementResponse(false, "Failed to save element",null));
            return;
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomCode,
                new BoardElementResponse(true, null, result.getPayload()));
    }

}