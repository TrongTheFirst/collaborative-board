package learn.data.mapper;

import learn.models.BoardMember;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class BoardMemberMapper implements RowMapper<BoardMember> {
    @Override
    public BoardMember mapRow(ResultSet rs, int rowNum) throws SQLException {
        BoardMember member = new BoardMember();
        member.setId(rs.getLong("id"));
        member.setClientId(rs.getString("client_id"));
        member.setDisplayName(rs.getString("display_name"));
        member.setRoomCode(rs.getString("room_code"));
        member.setRoleId(rs.getInt("role_id"));
        member.setJoinedAt(rs.getTimestamp("joined_at").toLocalDateTime());
        return member;
    }
}