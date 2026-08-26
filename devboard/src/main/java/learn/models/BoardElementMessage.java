package learn.models;

import lombok.*;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class BoardElementMessage {
    private String sender;
    private BoardElement boardElement;
//    private String message;
}
