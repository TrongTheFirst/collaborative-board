package learn.data.repository;

import learn.data.DataAccessException;
import learn.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)

class UserJdbcClientRepositoryTest {

    @Autowired
    private UserJdbcClientRepository repository;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {jdbcClient.sql("call set_known_good_state();").update();}

    @Test
    void findByEmailHappyPath() throws DataAccessException {
        User actual = repository.findByEmail("a@a.com");

        assertEquals(TestDataHelper.existingUser(), actual);
    }

    @Test
    void findByEmailFailsToFind() throws DataAccessException {
        User actual = repository.findByEmail("does@not.exist");

        assertNull(actual);
    }
}