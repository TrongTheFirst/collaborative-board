package learn.data;

import learn.data.mapper.RoomMapper;
import learn.data.repository_interface.RoomRepository;
import learn.models.Room;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
@AllArgsConstructor
public class RoomJdbcClientRepository implements RoomRepository {

    private final JdbcClient jdbcClient;

    @Override
    public Room findByRoomCode(String roomCode) throws DataAccessException {
        final String sql = """
                select room_code, board_id, host_client_id, created_at, view_mode
                from room
                where room_code = ?;
                """;
        return jdbcClient.sql(sql)
                .param(roomCode)
                .query(new RoomMapper())
                .optional()
                .orElse(null);
    }

    @Override
    public Room create(Room room) throws DataAccessException {
        final String sql = """
                insert into room (room_code, board_id, host_client_id, created_at, view_mode) values
                (:room_code, :board_id, :host_client_id, :created_at, :view_mode);
                """;

        int rowsAffected = jdbcClient.sql(sql)
                .param("room_code", room.getRoomCode())
                .param("board_id", room.getBoardId())
                .param("host_client_id", room.getHostClientId())
                .param("created_at", room.getCreatedAt())
                .param("view_mode", room.isViewMode())
                .update();

        if (rowsAffected == 0) {
            return null;
        }
        return room;
    }

    @Override
    public boolean update(Room room) throws DataAccessException{
        final String sql = """
                update room
                set view_mode = :view_mode
                where room_code = :room_code;
        """;

        return jdbcClient.sql(sql)
                .param("room_code", room.getRoomCode())
                .param("board_id", room.getBoardId())
                .param("host_client_id", room.getHostClientId())
                .param("created_at", room.getCreatedAt())
                .param("view_mode", room.isViewMode())
                .update() > 0;
    }

    @Override
    public boolean delete(String roomCode) throws DataAccessException {
        final String sql = """
                delete from room where room_code = ?;
                """;
        return jdbcClient.sql(sql)
                .param(roomCode)
                .update() == 1;
    }
}