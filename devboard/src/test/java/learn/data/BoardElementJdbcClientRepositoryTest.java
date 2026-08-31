package learn.data;

import learn.TestDataHelper;
import learn.models.BoardElement;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.simple.JdbcClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)

class BoardElementJdbcClientRepositoryTest {
    @Autowired
    private BoardElementJdbcClientRepository repository;

    @Autowired
    private JdbcClient jdbcClient;

    @BeforeEach
    void setUp() {jdbcClient.sql("call set_known_good_state();").update();}

    @Test
    void shouldFindAllByBoardId() throws DataAccessException {
        List<BoardElement> expected = List.of(TestDataHelper.existingElement());

        List<BoardElement> actual = repository.findAllFromBoardId(1);
        assertEquals(expected,actual);
    }

    @Test
    void shouldAdd() throws DataAccessException{
        BoardElement toAdd = TestDataHelper.elementToCreate();
        BoardElement expected = TestDataHelper.elementAfterCreate();

        assertEquals(List.of(TestDataHelper.existingElement()),repository.findAllFromBoardId(toAdd.getBoardId()));

        BoardElement actual = repository.add(toAdd);

        assertEquals(expected,actual);
        assertEquals(2, repository.findAllFromBoardId(toAdd.getBoardId()).size());
    }

    @Test
    void shouldDelete() throws DataAccessException {
        BoardElement toDelete = TestDataHelper.existingElement();
        assertTrue(repository.delete(toDelete.getElementId()));
        assertEquals(List.of(),repository.findAllFromBoardId(toDelete.getBoardId()));
    }

    @Test
    void shouldDeleteAll() throws DataAccessException {
        assertTrue(repository.deleteAll(1));
        assertEquals(List.of(),repository.findAllFromBoardId(1));
    }
}