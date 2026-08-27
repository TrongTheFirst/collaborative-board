package learn.models;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class Board {
    private long boardId;
    private long ownerId;
    private String boardName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
