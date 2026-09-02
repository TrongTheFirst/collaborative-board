package learn.data;

import learn.TestDataHelper;
import learn.models.BoardMember;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class BoardMemberJdbcClientRepositoryTest {

    @Autowired
    private BoardMemberJdbcClientRepository repository;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("call set_known_good_state();").update();
    }

    @Test
    void shouldFindById() throws DataAccessException {
        BoardMember expected = TestDataHelper.existingBoardMember();

        BoardMember actual = repository.findById(expected.getId());

        assertEquals(expected, actual);
    }

    @Test
    void shouldReturnNullWhenIdNotFound() throws DataAccessException {
        BoardMember actual = repository.findById(999);

        assertNull(actual);
    }

    @Test
    void shouldFindByRoomCode() throws DataAccessException {
        List<BoardMember> actual = repository.findByRoomCode("ABC123");

        assertEquals(1, actual.size());
        assertEquals(TestDataHelper.existingBoardMember(), actual.get(0));
    }

    @Test
    void shouldReturnEmptyListWhenRoomCodeNotFound() throws DataAccessException {
        List<BoardMember> actual = repository.findByRoomCode("NOTFOUND");

        assertTrue(actual.isEmpty());
    }

    @Test
    void shouldCreate() throws DataAccessException {
        BoardMember toCreate = TestDataHelper.boardMemberToCreate();

        BoardMember actual = repository.create(toCreate);

        assertEquals(TestDataHelper.boardMemberAfterCreate(), actual);
        assertEquals(TestDataHelper.boardMemberAfterCreate(), repository.findById(actual.getId()));
    }

    @Test
    void shouldDelete() throws DataAccessException {
        BoardMember toDelete = TestDataHelper.existingBoardMember();

        assertTrue(repository.delete(toDelete.getId()));
        assertNull(repository.findById(toDelete.getId()));
    }

    @Test
    void shouldNotDeleteWhenIdNotFound() throws DataAccessException {
        assertFalse(repository.delete(999));
    }
}