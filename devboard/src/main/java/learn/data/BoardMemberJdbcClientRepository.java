package learn.data;

import learn.data.mapper.BoardMemberMapper;
import learn.data.repository_interface.BoardMemberRepository;
import learn.models.BoardMember;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@AllArgsConstructor
public class BoardMemberJdbcClientRepository implements BoardMemberRepository {

    private final JdbcClient jdbcClient;

    @Override
    public List<BoardMember> findByRoomCode(String roomCode) throws DataAccessException {
        final String sql = """
                select id, client_id, display_name, room_code, role_id, joined_at
                from board_member
                where room_code = ?;
                """;
        return jdbcClient.sql(sql)
                .param(roomCode)
                .query(new BoardMemberMapper())
                .list();
    }

    @Override
    public BoardMember findById(long id) throws DataAccessException {
        final String sql = """
                select id, client_id, display_name, room_code, role_id, joined_at
                from board_member
                where id = ?;
                """;
        return jdbcClient.sql(sql)
                .param(id)
                .query(new BoardMemberMapper())
                .optional()
                .orElse(null);
    }

    @Override
    public BoardMember findByRoomCodeAndClientId(String roomCode, String clientId) throws DataAccessException {
        final String sql = """
            select id, display_name, room_code, client_id, role_id, joined_at
            from board_member
            where room_code = ? and client_id = ?;
            """;
        return jdbcClient.sql(sql)
                .param(roomCode)
                .param(clientId)
                .query(new BoardMemberMapper())
                .optional()
                .orElse(null);
    }

    @Override
    public BoardMember create(BoardMember boardMember) throws DataAccessException {
        final String sql = """
                insert into board_member(client_id, display_name, room_code, role_id, joined_at) values
                (:client_id, :display_name, :room_code, :role_id, :joined_at);
                """;

        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("client_id", boardMember.getClientId())
                .param("display_name", boardMember.getDisplayName())
                .param("room_code", boardMember.getRoomCode())
                .param("role_id", boardMember.getRoleId())
                .param("joined_at", boardMember.getJoinedAt())
                .update(keyHolder, "id");

        if (rowsAffected == 0) {
            return null;
        }
        boardMember.setId(keyHolder.getKey().longValue());
        return boardMember;
    }

    @Override
    public boolean delete(String roomCode, String clientId) throws DataAccessException {
        final String sql = """
                delete from board_member where room_code = ? and client_id = ?;
                """;
        return jdbcClient.sql(sql)
                .param(roomCode)
                .param(clientId)
                .update() == 1;
    }
}