package learn.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class Users {
    private long id;
    private String email;
    private String password;
    private String displayName;
    private LocalDateTime createdAt;
}
