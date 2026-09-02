package learn.dtos;

import java.time.LocalDateTime;

public record CreateRoomRequest(String clientId, long boardId, String displayName, LocalDateTime joinedAt) {
}
