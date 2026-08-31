package learn.data.repository_interface;

import learn.data.DataAccessException;
import learn.models.Board;

import java.util.List;

public interface BoardRepository {
    Board findById(long id) throws DataAccessException;

    boolean userHasBoard(long userId, long boardId) throws DataAccessException;

    List<Board> findByUserId(long userId) throws DataAccessException;

    Board create(Board board) throws DataAccessException;

    boolean update(Board board) throws DataAccessException;

    boolean delete(long id) throws DataAccessException;

}
