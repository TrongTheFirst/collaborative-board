package learn.domain;

import learn.data.DataAccessException;
import learn.data.repository_interface.BoardElementRepository;
import learn.data.repository_interface.BoardRepository;
import learn.models.BoardElement;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.util.List;

@Service
@AllArgsConstructor
public class BoardElementService {
    private BoardElementRepository repository;
    private BoardRepository boardRepository;

    public List<BoardElement> findAllFromBoardId(long boardId) throws DataAccessException {
        return repository.findAllFromBoardId(boardId);
    }

    public Result<BoardElement> add(BoardElement boardElement) throws DataAccessException {
        Result<BoardElement> result = new Result<>();

        if(boardElement == null){
            result.addErrorMessage("Board element cannot be null", ResultType.INVALID);
            return result;
        }

        if(boardElement.getElementId() > 0){
            result.addErrorMessage("Board element id has to be 0", ResultType.INVALID);
        }

        if(boardElement.getType() == null || boardElement.getType().isBlank()){
            result.addErrorMessage("Board element type cannot be blank", ResultType.INVALID);
        }

        validateElementData(boardElement.getElementData(), result);

        if(!result.isSuccess()){
            return result;
        }

        if(boardRepository.findById(boardElement.getBoardId()) == null){
            result.addErrorMessage("Board %s was not found", ResultType.NOT_FOUND, boardElement.getBoardId());
        }

        if(result.isSuccess()){
            BoardElement created = repository.add(boardElement);
            result.setPayload(created);
        }
        return result;
    }

    private void validateElementData(JsonNode elementData, Result<BoardElement> result) throws DataAccessException {
        if(elementData == null){
            result.addErrorMessage("Board element data cannot be null", ResultType.INVALID);
            return;
        }
        if(!elementData.has("x") || !elementData.has("y")){
            result.addErrorMessage("Element data does not have a position", ResultType.INVALID);
        }
    }
}
