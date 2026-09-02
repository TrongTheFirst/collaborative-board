package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.BoardElementService;
import learn.domain.BoardMemberService;
import learn.domain.Result;
import learn.domain.RoomService;
import learn.dtos.*;
import learn.models.Board;
import learn.models.BoardElement;
import learn.models.BoardMember;
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
    private final BoardMemberService memberService;

    //TODO make more secure
    @MessageMapping("/room/create")
    public void createRoom(@Payload CreateRoomRequest request) throws DataAccessException {
        Result<Room> result = roomService.createForBoard(request.boardId(),request.clientId());
        String replyTopic = "/topic/reply/" + request.clientId();

        if (!result.isSuccess()) {
            messagingTemplate.convertAndSend(replyTopic, new CreateRoomResponse(false, result.getErrorMessages(), null));
            return;
        }
        BoardMember member = new BoardMember(
                0,
                request.clientId(),
                request.displayName(),
                result.getPayload().getRoomCode(),
                2,
                request.joinedAt()
        );
        Result<BoardMember> memberResult = memberService.add(member);
        if(!memberResult.isSuccess()){
            messagingTemplate.convertAndSend(replyTopic, new CreateRoomResponse(false, memberResult.getErrorMessages(), null));
            return;
        }

        messagingTemplate.convertAndSend(replyTopic,
                new CreateRoomResponse(true, null, memberResult.getPayload()));
    }

    @MessageMapping("/room/join")
    public void clientJoinsAndGetsBoardState(@Payload JoinRoomRequest request) throws DataAccessException {
        BoardMember member = new  BoardMember(
                0,
                request.clientId(),
                request.displayName(),
                request.roomCode(),
                request.roleId(),
                request.joinedAt()
        );

        Result<BoardMember> result = memberService.add(member);

        String replyTopic = "/topic/reply/" + request.clientId();

        if (!result.isSuccess()) {
            messagingTemplate.convertAndSend(replyTopic, new JoinRoomResponse(false, result.getErrorMessages(), null,null,null, null));
            return;
        }
        BoardMember savedMember = result.getPayload();

        Room room = roomService.findByRoomCode(request.roomCode());

        List<BoardElement> boardElements = elementService.findAllFromBoardId(room.getBoardId());
        List<BoardMember> members = memberService.findByRoomCode(request.roomCode());
        messagingTemplate.convertAndSend(replyTopic, new JoinRoomResponse(true, null, room.getBoardId(), boardElements, savedMember, members));
        messagingTemplate.convertAndSend("/topic/room/" + request.roomCode() + "/joined",savedMember);
    }

    @MessageMapping("/room/end")
    public void endRoom(@Payload RoomRequest request) throws DataAccessException {
        Room room = roomService.findByRoomCode(request.roomCode());
        String replyTopic = "/topic/room/" + request.roomCode() + "/ended";

        if (room == null) {
            messagingTemplate.convertAndSend(replyTopic,
                    new SuccessResponse(false, "No room found"));
            return;
        }
        if(!room.getHostClientId().equals(request.clientId())){//not host
            messagingTemplate.convertAndSend(replyTopic,
                    new SuccessResponse(false, "Not host"));
            return;
        }

        roomService.delete(request.roomCode());

        messagingTemplate.convertAndSend("/topic/room/" + request.roomCode() + "/ended",
                new SuccessResponse(true, null));
    }

    @MessageMapping("/room/leave")
    public void leaveRoom(@Payload JoinRoomRequest request) throws DataAccessException {

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