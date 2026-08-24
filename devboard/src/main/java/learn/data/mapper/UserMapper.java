package learn.data.mapper;

import learn.models.User;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

public class UserMapper implements RowMapper<User> {

    private final String idPrefix;

    public UserMapper(String idPrefix) {
        this.idPrefix = idPrefix;
    }

    public UserMapper() {
        this.idPrefix = "";
    }

    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        return new User(
                rs.getInt(getIdColumnName()),
                rs.getString("email"),
                rs.getString("password"),
                rs.getString("display_name"),
                rs.getObject("created_at", LocalDateTime.class)
        );
    }

    private String getIdColumnName() {
        return this.idPrefix + "user_id";
    }
}
