package learn.domain;

import learn.data.DataAccessException;
import learn.data.repository_interface.BoardRepository;
import learn.data.repository_interface.UserRepository;
import learn.models.Board;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class BoardService {
    private final BoardRepository repository;
    private final UserRepository userRepository;

    public Board findById(long id) throws DataAccessException {
        return repository.findById(id);
    }

    public boolean userHasBoard(long userId, long boardId) throws DataAccessException {
        return repository.userHasBoard(userId, boardId);
    }
    public List<Board> findByUserId(long userId) throws DataAccessException {
        return repository.findByUserId(userId);
    }

    public Result<Board> create(Board board) throws DataAccessException {
        Result<Board> result = new Result<>();

        if(board.getBoardId() > 0){
            result.addErrorMessage("Board Id has to be 0", ResultType.INVALID);
        }

        if(board.getBoardName() == null || board.getBoardName().isEmpty()){
            board.setBoardName("Board");
        }

        if(board.getCreatedAt() == null){
            result.addErrorMessage("Created at cannot be null", ResultType.INVALID);
        }

        if(board.getUpdatedAt() == null){
            result.addErrorMessage("Updated at cannot be null", ResultType.INVALID);
        }

        if(result.isSuccess()){
            Board created = repository.create(board);
            result.setPayload(created);
        }

        return result;
    }

    public Result<Board> delete(long id) throws DataAccessException {
        Result<Board> result = new Result<>();
        if(!repository.delete(id)){
            result.addErrorMessage("Board %s was not found", ResultType.NOT_FOUND, id);
        }
        return result;
    }

    public Result<Board> update(Board board) throws DataAccessException {
        Result<Board> result = new Result<>();

        Board existingBoard = repository.findById(board.getBoardId());
        if(existingBoard == null){
            result.addErrorMessage("Board %s was not found", ResultType.NOT_FOUND, board.getBoardId());
            return result;
        }
        if(userRepository.findById(board.getOwnerId())==null){
            result.addErrorMessage("Owner does not exist", ResultType.NOT_FOUND);
            return result;
        }
        if(existingBoard.getOwnerId() != 0 && existingBoard.getOwnerId() != board.getOwnerId()){
            result.addErrorMessage("Cannot change ownership of board", ResultType.INVALID);
        }
        if(board.getBoardName() == null || board.getBoardName().isEmpty()){
            board.setBoardName("Board");
        }
        if(!existingBoard.getCreatedAt().equals(board.getCreatedAt())){
            result.addErrorMessage("Cannot change created at", ResultType.INVALID);
        }
        if(board.getUpdatedAt() == null){
            result.addErrorMessage("Updated at cannot be null", ResultType.INVALID);
        }

        if(result.isSuccess()){
            repository.update(board);
        }
        return result;
    }

}
