package learn.data;

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

    public static User userToCreate() {
        return new User(0, "c@c.com", "pass", "c", testTime);
    }

    public static User userAfterCreate() {
        User user = userToCreate();
        user.setId(3);
        return user;
    }

    private final static LocalDateTime testTime = LocalDateTime.of(2020,1,1,1,1);

}