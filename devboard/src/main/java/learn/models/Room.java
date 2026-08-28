package learn.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private String roomCode;
    private long boardId;
    private LocalDateTime createdAt;
}