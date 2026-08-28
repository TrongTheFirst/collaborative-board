package learn.data.mapper;

import learn.models.BoardElement;
import org.jspecify.annotations.NonNull;
import org.springframework.jdbc.core.RowMapper;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class BoardElementMapper implements RowMapper<BoardElement> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public BoardElement mapRow(@NonNull ResultSet rs, int rowNum) throws SQLException {
        try{
            JsonNode elementData = objectMapper.readTree(rs.getString("element_data"));
            return new BoardElement(
                    rs.getLong("element_id"),
                    rs.getLong("board_id"),
                    rs.getString("type"),
                    elementData
            );
        }catch(Exception e){
            throw new SQLException("Failed to parse element_data JSON", e);
        }
    }
}
