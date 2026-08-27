package learn.data;

import learn.models.Board;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)

class BoardJdbcClientRepositoryTest {
    @Autowired
    private BoardJdbcClientRepository repository;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {jdbcClient.sql("call set_known_good_state();").update();}

    @Test
    void findByIdHappyPath() throws DataAccessException{
        Board existing = TestDataHelper.existingBoard();
        Board actual = repository.findById(existing.getBoardId());
        assertEquals(existing,actual);
    }

    @Test
    void findByIdFailsToFind() throws DataAccessException{
        Board actual = repository.findById(100);
        assertNull(actual);
    }

    @Test
    void shouldCreate() throws DataAccessException{
        Board toCreate = TestDataHelper.boardToCreate();
        Board expected = TestDataHelper.boardAfterCreate();

        assertNull(repository.findById(toCreate.getBoardId()));

        Board actual = repository.create(toCreate);

        assertEquals(expected,actual);
        assertNotNull(repository.findById(toCreate.getBoardId()));
    }
}