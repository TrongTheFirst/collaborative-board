package learn.domain;

import learn.data.DataAccessException;
import learn.TestDataHelper;
import learn.data.repository_interface.BoardElementRepository;
import learn.data.repository_interface.BoardRepository;
import learn.models.BoardElement;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import tools.jackson.databind.ObjectMapper;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)

class BoardElementServiceTest {

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private BoardElementService service;

    @MockitoBean
    private BoardElementRepository repository;

    @MockitoBean
    private BoardRepository boardRepository;


    @Nested
    class AddTests{
        @Test
        void failsWhenBoardElementNull() throws DataAccessException {

            Result<BoardElement> actual = service.add(null);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board element cannot be null"));

            verify(repository, never()).add(any());
        }

        @Test
        void failsWhenElementIdIsSet() throws DataAccessException {
            BoardElement toAdd = TestDataHelper.elementToCreate();
            toAdd.setElementId(1);

            Result<BoardElement> actual = service.add(toAdd);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board element id has to be 0"));

            verify(repository, never()).add(any());
        }

        @Test
        void failsWhenTypeIsBlank() throws DataAccessException {
            BoardElement toAdd = TestDataHelper.elementToCreate();
            toAdd.setType(null);

            Result<BoardElement> actual = service.add(toAdd);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board element type cannot be blank"));

            verify(repository, never()).add(any());
        }

        @Test
        void failsWhenElementDataIsNull() throws DataAccessException {
            BoardElement toAdd = TestDataHelper.elementToCreate();
            toAdd.setElementData(null);

            Result<BoardElement> actual = service.add(toAdd);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board element data cannot be null"));

            verify(repository, never()).add(any());
        }

        @Test
        void failsWhenElementDataDoesNotHavePosition() throws DataAccessException {
            BoardElement toAdd = TestDataHelper.elementToCreate();
            toAdd.setElementData(mapper.createObjectNode().put("fake",1));

            Result<BoardElement> actual = service.add(toAdd);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Element data does not have a position"));

            verify(repository, never()).add(any());
        }

        @Test
        void failsWhenBoardNotFound() throws DataAccessException {
            BoardElement toAdd = TestDataHelper.elementToCreate();
            toAdd.setBoardId(999);

            Result<BoardElement> actual = service.add(toAdd);
            when(boardRepository.findById(toAdd.getBoardId())).thenReturn(null);

            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board 999 was not found"));

            verify(repository, never()).add(any());
        }

        @Test
        void addHappyPath() throws DataAccessException {
            BoardElement toAdd = TestDataHelper.elementToCreate();

            when(boardRepository.findById(toAdd.getBoardId())).thenReturn(TestDataHelper.existingBoard());
            when(repository.add(toAdd)).thenReturn(TestDataHelper.elementAfterCreate());


            Result<BoardElement> actual = service.add(toAdd);

            assertEquals(TestDataHelper.elementAfterCreate(), actual.getPayload());
        }
    }

    @Nested
    class DeleteTests{
        @Test
        void deleteFailsWhenBoardElementNotFound() throws DataAccessException {
            when(repository.delete(999)).thenReturn(false);
            Result<BoardElement> actual = service.delete(999);
            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board element 999 was not found"));
        }

        @Test
        void deleteHappyPath() throws DataAccessException {
            when(repository.delete(1)).thenReturn(true);
            Result<BoardElement> actual = service.delete(1);
            assertTrue(actual.isSuccess());
        }

        @Test
        void deleteAllFailsWhenNoBoardElements() throws DataAccessException {
            when(repository.deleteAll(999)).thenReturn(false);
            Result<BoardElement> actual = service.deleteAll(999);
            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Nothing to delete"));
        }

        @Test
        void deleteAllHappyPath() throws DataAccessException {
            when(repository.deleteAll(1)).thenReturn(true);
            Result<BoardElement> actual = service.deleteAll(1);
            assertTrue(actual.isSuccess());
        }
    }
}