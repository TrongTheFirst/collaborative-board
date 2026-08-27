package learn.data;

import learn.models.Board;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;


public class TestDataHelper {


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
        board.setBoardId(2);
        return board;
    }

    private final static LocalDateTime testTime = LocalDateTime.of(2020,1,1,1,1);

}