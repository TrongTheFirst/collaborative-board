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
    private String hostClientId;
    private LocalDateTime createdAt;
    private boolean viewMode;
}