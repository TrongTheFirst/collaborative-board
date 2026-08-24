package learn.dtos;

import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
}
