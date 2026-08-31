package learn.data;

import learn.TestDataHelper;
import learn.models.Board;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.List;

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
    void userHasBoard() throws DataAccessException{
        assertTrue(repository.userHasBoard(1,1));
    }

    @Test
    void userDoesNotHaveBoard() throws DataAccessException{
        assertFalse(repository.userHasBoard(1,20));
    }

    @Test
    void findByUserIdHappyPath() throws DataAccessException{
        Board b1 = TestDataHelper.existingBoard();
        Board b2 = TestDataHelper.existingBoard();
        b2.setBoardId(2);
        b2.setBoardName("B2");
        List<Board> expected = List.of(b1,b2);

        List<Board> actual = repository.findByUserId(1);
        assertEquals(expected,actual);
    }

    @Test
    void findByUserNotFound() throws DataAccessException{
        assertEquals(List.of(),repository.findByUserId(100));
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

    @Test
    void shouldUpdate() throws DataAccessException{
        assertTrue(repository.update(TestDataHelper.boardToUpdate()));
        assertEquals(TestDataHelper.boardToUpdate(), repository.findById(TestDataHelper.boardToUpdate().getBoardId()));
    }

    @Test
    void shouldDelete() throws DataAccessException {
        assertTrue(repository.delete(2));
        assertNull(repository.findById(2));
    }
}