package learn.data.mapper;

import learn.models.Room;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class RoomMapper implements RowMapper<Room> {

    @Override
    public Room mapRow(ResultSet rs, int rowNum) throws SQLException {
        Room room = new Room();
        room.setRoomCode(rs.getString("room_code"));
        room.setBoardId(rs.getLong("board_id"));
        room.setHostClientId(rs.getString("host_client_id"));
        room.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        room.setViewMode(rs.getBoolean("view_mode"));

        return room;
    }
}