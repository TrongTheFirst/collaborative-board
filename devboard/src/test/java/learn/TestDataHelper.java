package learn;

import learn.models.Board;
import learn.models.BoardElement;
import learn.models.Room;
import learn.models.User;
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
        return new Room("ABC123", 1, testTime);
    }

    public static Room roomToCreate() {
        return new Room("XYZ789", 1, testTime);
    }
    

    private final static LocalDateTime testTime = LocalDateTime.of(2020,1,1,1,1);
    private final static JsonNode elementData = mapper.createObjectNode().put("x",1).put("y",1);
}