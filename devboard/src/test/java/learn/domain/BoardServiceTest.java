package learn.domain;

import learn.data.DataAccessException;
import learn.TestDataHelper;
import learn.data.repository_interface.BoardRepository;
import learn.data.repository_interface.UserRepository;
import learn.models.Board;
import learn.models.User;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.LocalDateTime;

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

    @MockitoBean
    private UserRepository userRepository;

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

    @Nested
    class DeleteTests {
        @Test
        void shouldFailWhenNonExistentBoard() throws DataAccessException {
            when(repository.delete(999)).thenReturn(false);

            Result<Board> actual = service.delete(999);

            assertFalse(actual.isSuccess());
            assertEquals(1, actual.getErrorMessages().size());
            assertTrue(actual.getErrorMessages().contains("Board 999 was not found"));
        }

        @Test
        void shouldDeleteBoard() throws DataAccessException {
            when(repository.delete(1)).thenReturn(true);

            Result<Board> actual = service.delete(1);

            assertTrue(actual.isSuccess());
        }
    }

    @Nested
    class UpdateTests {
        @Test
        void updateFailsWhenNonExistentBoard() throws DataAccessException {
            Board toUpdate = TestDataHelper.boardToCreate();
            toUpdate.setBoardId(999);

            when(repository.findById(toUpdate.getBoardId())).thenReturn(null);

            Result<Board> actual = service.update(toUpdate);

            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board 999 was not found"));
            verify(repository, never()).update(any());
        }

        @Test
        void updateFailsWhenOwnerDoesNotExist() throws DataAccessException {
            Board toUpdate = TestDataHelper.existingBoard();
            toUpdate.setOwnerId(999);

            when(repository.findById(toUpdate.getBoardId())).thenReturn(toUpdate);
            when(userRepository.findById(toUpdate.getOwnerId())).thenReturn(null);

            Result<Board> actual = service.update(toUpdate);

            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Owner does not exist"));
            verify(repository, never()).update(any());
        }

        @Test
        void updateFailsWhenChangingOwnerToOwner() throws DataAccessException {
            Board toUpdate = TestDataHelper.boardToCreate();
            toUpdate.setOwnerId(2);

            when(repository.findById(toUpdate.getBoardId())).thenReturn(TestDataHelper.existingBoard());
            when(userRepository.findById(toUpdate.getOwnerId())).thenReturn(TestDataHelper.existingUser());

            Result<Board> actual = service.update(toUpdate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Cannot change ownership of board"));
            verify(repository, never()).update(any());
        }

        @Test
        void updateFailsWhenUpdatingCreatedAt() throws DataAccessException {
            Board toUpdate = TestDataHelper.boardToCreate();
            toUpdate.setCreatedAt(LocalDateTime.now().minusYears(1));

            when(repository.findById(toUpdate.getBoardId())).thenReturn(TestDataHelper.existingBoard());
            when(userRepository.findById(toUpdate.getOwnerId())).thenReturn(TestDataHelper.existingUser());

            Result<Board> actual = service.update(toUpdate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Cannot change created at"));
            verify(repository, never()).update(any());
        }

        @Test
        void updateFailsWhenUpdatedAtNull()  throws DataAccessException {
            Board toUpdate = TestDataHelper.existingBoard();
            toUpdate.setUpdatedAt(null);

            when(repository.findById(toUpdate.getBoardId())).thenReturn(TestDataHelper.existingBoard());
            when(userRepository.findById(toUpdate.getOwnerId())).thenReturn(TestDataHelper.existingUser());

            Result<Board> actual = service.update(toUpdate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Updated at cannot be null"));
            verify(repository, never()).update(any());
        }

        @Test
        void updateSucceedsWhenAdoptingBoard() throws DataAccessException {
            Board toUpdate = TestDataHelper.existingBoard();

            Board existing = TestDataHelper.existingBoard();
            existing.setOwnerId(0);

            when(repository.findById(toUpdate.getBoardId())).thenReturn(existing);
            when(userRepository.findById(toUpdate.getOwnerId())).thenReturn(TestDataHelper.existingUser());

            Result<Board> actual = service.update(toUpdate);

            assertEquals(ResultType.SUCCESS, actual.getResultType());
            verify(repository).update(toUpdate);
        }
    }
}