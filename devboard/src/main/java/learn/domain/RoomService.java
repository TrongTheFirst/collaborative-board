package learn.domain;

import learn.data.DataAccessException;
import learn.data.repository_interface.BoardRepository;
import learn.data.repository_interface.RoomRepository;
import learn.models.Room;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class RoomService {

    private final int MAX_GENERATION_ATTEMPTS = 10;

    private final RoomRepository repository;
    private final BoardRepository boardRepository;

    public Room findByRoomCode(String roomCode) throws DataAccessException {
        return repository.findByRoomCode(roomCode);
    }

    public Result<Room> createForBoard(long boardId) throws DataAccessException {
        Result<Room> result = new Result<>();

        if (boardRepository.findById(boardId) == null) {
            result.addErrorMessage("Board %s was not found", ResultType.NOT_FOUND, boardId);
            return result;
        }

        String roomCode = generateUniqueRoomCode();
        if (roomCode == null) {
            result.addErrorMessage("Could not generate a unique room code, please try again", ResultType.INVALID);
            return result;
        }

        Room room = new Room(roomCode, boardId, LocalDateTime.now());
        Room created = repository.create(room);

        if (created == null) {
            result.addErrorMessage("Room could not be created", ResultType.INVALID);
            return result;
        }

        result.setPayload(created);
        return result;
    }

    public boolean delete(String roomCode) throws DataAccessException {
        return repository.delete(roomCode);
    }

    private String generateUniqueRoomCode() throws DataAccessException {
        for (int attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            String candidate = generateRoomCode();
            if (repository.findByRoomCode(candidate) == null) {
                return candidate;
            }
        }
        return null;
    }

    private String generateRoomCode() {
        return UUID.randomUUID()
                .toString()
                .replace("-", "");
    }
}