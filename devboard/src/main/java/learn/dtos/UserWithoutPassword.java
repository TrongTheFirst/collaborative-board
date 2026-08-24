package learn.dtos;

import learn.models.User;
import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class UserWithoutPassword {
    private long id;
    private String email;
    private String displayName;

    public static UserWithoutPassword fromUser(User user) {
        return new UserWithoutPassword(user.getId(), user.getEmail(), user.getDisplayName());
    }

}