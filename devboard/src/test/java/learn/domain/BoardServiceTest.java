package learn.domain;

import learn.data.DataAccessException;
import learn.data.TestDataHelper;
import learn.data.repository_interface.BoardRepository;
import learn.models.Board;
import learn.models.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)

class BoardServiceTest {

    @Autowired
    private BoardService service;

    @MockitoBean
    private BoardRepository repository;

    @Nested
    class CreateTests {
        @Test
        void shouldFailWhenIdSet() throws DataAccessException {
            Board toCreate = TestDataHelper.boardToCreate();
            toCreate.setBoardId(22);

            Result<Board> actual = service.create(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board Id has to be 0"));

            verify(repository, never()).create(any());
        }

        @Test
        void createFailsWhenCreatedAtIsNull() throws DataAccessException {
            Board toCreate = TestDataHelper.boardToCreate();
            toCreate.setCreatedAt(null);

            Result<Board> actual = service.create(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Created at cannot be null"));

            verify(repository, never()).create(any());
        }

        @Test
        void createFailsWhenUpdatedAtIsNull() throws DataAccessException {
            Board toCreate = TestDataHelper.boardToCreate();
            toCreate.setUpdatedAt(null);

            Result<Board> actual = service.create(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Updated at cannot be null"));

            verify(repository, never()).create(any());
        }

        @Test
        void createHappyPath() throws DataAccessException {
            Board toCreate = TestDataHelper.boardToCreate();
            Board created = TestDataHelper.boardAfterCreate();

            when(repository.create(toCreate)).thenReturn(created);

            Result<Board> actual = service.create(toCreate);

            assertEquals(created, actual.getPayload());
        }

        @Test
        void shouldCreateWhenNameBlank() throws DataAccessException {
            Board toCreate = TestDataHelper.boardToCreate();
            toCreate.setBoardName("");
            Board created = TestDataHelper.boardAfterCreate();
            created.setBoardName("Board");

            when(repository.create(toCreate)).thenReturn(created);

            Result<Board> actual = service.create(toCreate);

            assertEquals(created, actual.getPayload());
        }
    }
}