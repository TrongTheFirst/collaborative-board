package learn.data;

import learn.data.mapper.BoardElementMapper;
import learn.data.repository_interface.BoardElementRepository;
import learn.models.BoardElement;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

@Repository
@AllArgsConstructor
public class BoardElementJdbcClientRepository implements BoardElementRepository {

    private final JdbcClient jdbcClient;
    private final ObjectMapper objectMapper;

    @Override
    public List<BoardElement> findAllFromBoardId(long boardId) throws DataAccessException{
        final String sql = """
                select element_id, board_id, type, element_data
                from board_element
                where board_id = ?
                """;
        return jdbcClient.sql(sql)
                .param(boardId)
                .query(new BoardElementMapper())
                .list();
    }

    @Override
    public BoardElement add(BoardElement boardElement) throws DataAccessException{
        final String sql = """
                insert into board_element(board_id, `type`, element_data) values
                (:board_id, :type, :element_data);
        """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("board_id", boardElement.getBoardId())
                .param("type", boardElement.getType())
                .param("element_data", boardElement.getElementData().toString())
                .update(keyHolder,"element_data");

        if (rowsAffected == 0) {
            return null;
        }

        boardElement.setElementId(keyHolder.getKey().longValue());

        return boardElement;
    }

    @Override
    public boolean delete(long id) throws DataAccessException{
        final String sql = """
                delete from board_element
                where element_id = ?
        """;
        return  jdbcClient.sql(sql)
                .param(id)
                .update() == 1;
    }

    @Override
    public boolean deleteAll(long boardId) throws DataAccessException{
        final String sql = """
                delete from board_element
                where board_id = ?
        """;
        return  jdbcClient.sql(sql)
                .param(boardId)
                .update() == 1;
    }
}
