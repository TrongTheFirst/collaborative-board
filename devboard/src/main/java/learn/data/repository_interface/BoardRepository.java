package learn.data.repository_interface;

import learn.data.DataAccessException;
import learn.models.Board;

public interface BoardRepository {
    Board findById(long id) throws DataAccessException;

    Board create(Board board) throws DataAccessException;
}
