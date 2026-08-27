package learn.domain;

import learn.data.DataAccessException;
import learn.data.repository_interface.BoardRepository;
import learn.models.Board;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class BoardService {
    private final BoardRepository repository;

    public Board findById(int id) throws DataAccessException {
        return repository.findById(id);
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
}
