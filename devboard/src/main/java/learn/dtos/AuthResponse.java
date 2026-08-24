package learn.dtos;

import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
public class AuthResponse {
    private String token;
}
