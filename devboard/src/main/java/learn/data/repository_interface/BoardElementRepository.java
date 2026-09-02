package learn.data.repository_interface;

import learn.data.DataAccessException;
import learn.models.BoardElement;

import java.util.List;

public interface BoardElementRepository {
    List<BoardElement> findAllFromBoardId(long boardId) throws DataAccessException;

    BoardElement add(BoardElement boardElement) throws DataAccessException;

    boolean delete(long id) throws DataAccessException;

    boolean deleteAll(long boardId) throws DataAccessException;

    boolean deleteByClientId(long boardId, String clientId) throws DataAccessException;
}
