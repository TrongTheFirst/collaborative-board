package learn.data.repository;

import learn.data.mapper.UserMapper;
import learn.data.repository_interface.UserRepository;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.jdbc.core.simple.JdbcClient;

@Repository
@AllArgsConstructor
public class UserJdbcClientRepository implements UserRepository {
    private final JdbcClient jdbcClient;

    @Override
    public User findByEmail(String email){
        final String sql = "select * from user where email = ?";
        return jdbcClient.sql(sql)
                .param(email)
                .query(new UserMapper())
                .optional()
                .orElse(null);
    }
}
