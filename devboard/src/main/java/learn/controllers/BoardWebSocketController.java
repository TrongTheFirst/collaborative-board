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
    @MessageMapping("/room/create")
    public void createRoom(@Payload CreateRoomRequest request) throws DataAccessException {
        Result<Room> result = roomService.createForBoard(request.boardId(),request.clientId());
        String replyTopic = "/topic/reply/" + request.clientId();

        if (!result.isSuccess()) {
            String error = String.join("; ", result.getErrorMessages());
            messagingTemplate.convertAndSend(replyTopic, new CreateRoomResponse(false, error, null));
            return;
        }

        messagingTemplate.convertAndSend(replyTopic,
                new CreateRoomResponse(true, null, result.getPayload().getRoomCode()));
    }

    @MessageMapping("/room/join")
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

    @MessageMapping("/room/end")
    public void endRoom(@Payload JoinRoomRequest request) throws DataAccessException {
        Room room = roomService.findByRoomCode(request.roomCode());

        if (room == null) {
            messagingTemplate.convertAndSend("/topic/room/" + request.roomCode() + "/ended",
                    new SuccessResponse(false, "No room found"));
            return;
        }
        if(!room.getHostClientId().equals(request.clientId())){
            return;// not the host
        }

        roomService.delete(request.roomCode());

        messagingTemplate.convertAndSend("/topic/room/" + request.roomCode() + "/ended",
                new SuccessResponse(true, null));
    }

    @MessageMapping("/room/{roomCode}")
    public void addBoardElement(@Payload BoardElement element, @DestinationVariable String roomCode) throws DataAccessException {
        Result<BoardElement> result = elementService.add(element);

        if (!result.isSuccess()) {
            messagingTemplate.convertAndSend("/topic/room/" + roomCode,
                    new BoardElementResponse(false, "add","Failed to save element",null));
            return;
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomCode,
                new BoardElementResponse(true, "add",null, result.getPayload()));
    }

    @MessageMapping("/room/{roomCode}/delete")
    public void eraseBoardElement(@Payload RoomEraseRequest req, @DestinationVariable String roomCode) throws DataAccessException {
        Result<BoardElement> result = elementService.deleteByClientId(req.boardId(),req.elementClientId());
        if (!result.isSuccess()) {
            messagingTemplate.convertAndSend("/topic/room/" + roomCode,
                    new RoomEraseResponse(false, "erase","Failed to erase element",null));
            return;
        }
        messagingTemplate.convertAndSend("/topic/room/" + roomCode,
                new RoomEraseResponse(true, "erase",null, req.elementClientId()));
    }

}