package learn.data;

import learn.data.mapper.BoardMapper;
import learn.data.repository_interface.BoardRepository;
import learn.models.Board;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
@AllArgsConstructor
public class BoardJdbcClientRepository implements BoardRepository {

    private final JdbcClient jdbcClient;

    @Override
    public Board findById(long id) throws DataAccessException{
        final String sql = """
                select board_id, owner_id, name, created_at, updated_at
                from board where board_id = ?;
                """;
        return jdbcClient.sql(sql)
                .param(id)
                .query(new BoardMapper())
                .optional()
                .orElse(null);
    }

    @Override
    public boolean userHasBoard(long userId, long boardId) throws DataAccessException{
        final String sql = "select exists(select 1 from board where board_id = ? and owner_id = ?);";
        return jdbcClient.sql(sql)
                .param(boardId)
                .param(userId)
                .query(Boolean.class)
                .single();
    }

    @Override
    public Board create(Board board) throws DataAccessException{
        final String sql = """
                insert into board (owner_id, name, created_at, updated_at) values
                (:owner_id, :name, :created_at, :updated_at);
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("owner_id",board.getOwnerId() == 0 ? null : board.getOwnerId())
                .param("name",board.getBoardName())
                .param("created_at",board.getCreatedAt())
                .param("updated_at",board.getUpdatedAt())
                .update(keyHolder,"board_id");

        if (rowsAffected == 0) {
            return null;
        }
        board.setBoardId(keyHolder.getKey().longValue());
        return board;
    }

    @Override
    public boolean update(Board board) throws DataAccessException{
        final String sql = """
                update board set
                owner_id = :owner_id,
                name = :name,
                created_at = :created_at,
                updated_at = :updated_at
                where board_id = :board_id;
        """;

        return jdbcClient.sql(sql)
                .param("owner_id",board.getOwnerId() == 0 ? null : board.getOwnerId())
                .param("name",board.getBoardName())
                .param("created_at",board.getCreatedAt())
                .param("updated_at",board.getUpdatedAt())
                .param("board_id",board.getBoardId())
                .update() > 0;
    }

    @Override
    public boolean delete(long id) throws DataAccessException{
        final String sql = """
                delete from board where board_id = ?;
        """;
        return jdbcClient.sql(sql)
                .param(id)
                .update() == 1;
    }

}
