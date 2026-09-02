package learn.domain;

import learn.data.DataAccessException;
import learn.data.repository_interface.BoardMemberRepository;
import learn.data.repository_interface.RoomRepository;
import learn.models.BoardMember;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class BoardMemberService {

    private final BoardMemberRepository repository;
    private final RoomRepository roomRepository;

    public List<BoardMember> findByRoomCode(String roomCode) throws DataAccessException {
        return repository.findByRoomCode(roomCode);
    }

    public BoardMember findById(long id) throws DataAccessException {
        return repository.findById(id);
    }

    public Result<BoardMember> add(BoardMember boardMember) throws DataAccessException {
        Result<BoardMember> result = new Result<>();

        if (boardMember == null) {
            result.addErrorMessage("Board member cannot be null", ResultType.INVALID);
            return result;
        }

        if (boardMember.getRoomCode() == null || boardMember.getRoomCode().isBlank()) {
            result.addErrorMessage("Room code cannot be blank", ResultType.INVALID);
        }

        if (boardMember.getClientId() == null || boardMember.getClientId().isBlank()) {
            result.addErrorMessage("Client id cannot be blank", ResultType.INVALID);
        }

        if (!result.isSuccess()) {
            return result;
        }

        if (roomRepository.findByRoomCode(boardMember.getRoomCode()) == null) {
            result.addErrorMessage("Room %s was not found", ResultType.NOT_FOUND, boardMember.getRoomCode());
            return result;
        }

        BoardMember existing = repository.findByRoomCodeAndClientId(boardMember.getRoomCode(), boardMember.getClientId());
        if (existing != null) {
            result.setPayload(existing);
            return result;
        }

        if (boardMember.getJoinedAt() == null) {
            boardMember.setJoinedAt(LocalDateTime.now());
        }
        if(boardMember.getDisplayName() == null || boardMember.getDisplayName().isBlank()) {
            boardMember.setDisplayName(BoardMember.generateDisplayName());
        }

        try {
            BoardMember created = repository.create(boardMember);
            if (created == null) {
                result.addErrorMessage("Board member could not be created", ResultType.INVALID);
                return result;
            }
            result.setPayload(created);
        } catch (DataIntegrityViolationException ex) {
            BoardMember winner = repository.findByRoomCodeAndClientId(boardMember.getRoomCode(), boardMember.getClientId());
            if (winner == null) {
                throw ex;
            }
            result.setPayload(winner);
        }
        return result;
    }

    public Result<BoardMember> delete(long id) throws DataAccessException {
        Result<BoardMember> result = new Result<>();
        if (!repository.delete(id)) {
            result.addErrorMessage("Board member %s was not found", ResultType.NOT_FOUND, id);
        }
        return result;
    }
}