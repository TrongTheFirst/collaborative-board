package learn.dtos;

import learn.models.User;

import java.time.LocalDateTime;

public record CreateRoomRequest(String clientId, long boardId, String displayName, LocalDateTime joinedAt, Long userId) {
}
