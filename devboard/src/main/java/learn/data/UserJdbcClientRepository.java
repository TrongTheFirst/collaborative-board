package learn.data;

import learn.data.mapper.UserMapper;
import learn.data.repository_interface.UserRepository;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.simple.JdbcClient;

@Repository
@AllArgsConstructor
public class UserJdbcClientRepository implements UserRepository{
    private final JdbcClient jdbcClient;

    @Override
    public User findByEmail(String email) throws DataAccessException {
        final String sql = "select * from user where email = ?;";
        return jdbcClient.sql(sql)
                .param(email)
                .query(new UserMapper())
                .optional()
                .orElse(null);
    }

    @Override
    public User findById(long id) throws DataAccessException{
        final String sql = "select * from user where user_id = ?;";
        return jdbcClient.sql(sql)
                .param(id)
                .query(new UserMapper())
                .optional()
                .orElse(null);
    }

    @Override
    public User create(User user) throws DataAccessException {
        final String sql = """
                insert into user(email, password, display_name, created_at) values
                (:email, :password, :displayName, :createdAt);
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();

        int rowsAffected = jdbcClient.sql(sql)
                .param("email",user.getEmail())
                .param("password", user.getPassword())
                .param("displayName",user.getDisplayName())
                .param("createdAt",user.getCreatedAt())
                .update(keyHolder,"user_id");

        if (rowsAffected == 0) {
            return null;
        }
        user.setId(keyHolder.getKey().longValue());
        return user;
    }
}
