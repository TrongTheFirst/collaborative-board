package learn.dtos;

import java.time.LocalDateTime;

public record JoinRoomRequest(String clientId, String roomCode, String displayName, int roleId, LocalDateTime joinedAt) {
}
