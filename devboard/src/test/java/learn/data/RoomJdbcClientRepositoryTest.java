package learn.data;

import learn.TestDataHelper;
import learn.models.Room;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class RoomJdbcClientRepositoryTest {

    @Autowired
    private RoomJdbcClientRepository repository;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {
        jdbcClient.sql("call set_known_good_state();").update();
    }

    @Test
    void shouldFindByRoomCode() throws DataAccessException {
        Room expected = TestDataHelper.existingRoom();

        Room actual = repository.findByRoomCode(expected.getRoomCode());

        assertEquals(expected, actual);
    }

    @Test
    void shouldReturnNullWhenRoomCodeNotFound() throws DataAccessException {
        Room actual = repository.findByRoomCode("NOTFOUND");

        assertNull(actual);
    }

    @Test
    void shouldCreate() throws DataAccessException {
        Room toCreate = TestDataHelper.roomToCreate();

        assertNull(repository.findByRoomCode(toCreate.getRoomCode()));

        Room actual = repository.create(toCreate);

        assertEquals(TestDataHelper.roomToCreate(), actual);
        assertEquals(TestDataHelper.roomToCreate(), repository.findByRoomCode(toCreate.getRoomCode()));
    }

    @Test
    void shouldDelete() throws DataAccessException {
        Room toDelete = TestDataHelper.existingRoom();

        assertTrue(repository.delete(toDelete.getRoomCode()));
        assertNull(repository.findByRoomCode(toDelete.getRoomCode()));
    }

    @Test
    void shouldNotDeleteWhenRoomCodeNotFound() throws DataAccessException {
        assertFalse(repository.delete("NOTFOUND"));
    }
}