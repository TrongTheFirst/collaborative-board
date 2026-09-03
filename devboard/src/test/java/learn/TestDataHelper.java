package learn;

import learn.models.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;


public class TestDataHelper {
    private final static ObjectMapper mapper = new ObjectMapper();

    public static User existingUser() {
        return new User(1, "a@email.com", "encoded-password", "a", testTime);
    }

    public static Board existingBoard() {
        return new Board(1,1,"B1",testTime, testTime);
    }

    public static User userToCreate() {
        return new User(0, "c@c.com", "pass", "c", testTime);
    }

    public static User userAfterCreate() {
        User user = userToCreate();
        user.setId(3);
        return user;
    }

    public static Board boardToCreate() {
        return new Board(0,1,"B2",testTime, testTime);
    }

    public static Board boardAfterCreate() {
        Board board = boardToCreate();
        board.setBoardId(3);
        return board;
    }

    public static Board boardToUpdate() {
        Board toUpdate = existingBoard();
        toUpdate.setBoardName("Updated Name");
        return toUpdate;
    }

    public static BoardElement existingElement() {
        return new BoardElement(1,1,"freedraw",elementData);
    }

    public static BoardElement elementToCreate() {
        return new BoardElement(0,1,"freedraw",elementData);
    }
    public static BoardElement elementAfterCreate() {
        return new BoardElement(2,1,"freedraw",elementData);
    }

    public static Room existingRoom() {
        return new Room("ABC123", 1, "test-host-client-id", testTime);
    }

    public static Room roomToCreate() {
        return new Room("XYZ789", 1, "test-host-client-id", testTime);
    }

    public static BoardMember existingBoardMember() {
        return new BoardMember(1, 1, "a", "ABC123", 1, testTime);
    }

    public static BoardMember boardMemberToCreate() {
        return new BoardMember(0, 2, "b", "ABC123", 1, testTime);
    }

    public static BoardMember boardMemberAfterCreate() {
        BoardMember member = boardMemberToCreate();
        member.setId(2);
        return member;
    }
    

    private final static LocalDateTime testTime = LocalDateTime.of(2020,1,1,1,1);
    private final static JsonNode elementData = mapper.createObjectNode().put("x",1).put("y",1);
}