package learn.data.mapper;

import learn.models.Board;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

public class BoardMapper implements RowMapper<Board> {


    @Override
    public Board mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new Board(
                rs.getLong("board_id"),
                rs.getLong("owner_id"),
                rs.getString("name"),
                rs.getObject("created_at", LocalDateTime.class),
                rs.getObject("updated_at", LocalDateTime.class)
        );
    }
}
