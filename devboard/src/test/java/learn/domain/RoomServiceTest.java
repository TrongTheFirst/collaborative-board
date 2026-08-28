package learn.domain;

import learn.TestDataHelper;
import learn.data.DataAccessException;
import learn.data.repository_interface.BoardRepository;
import learn.data.repository_interface.RoomRepository;
import learn.models.Board;
import learn.models.Room;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class RoomServiceTest {

    @Autowired
    private RoomService service;

    @MockitoBean
    private RoomRepository repository;

    @MockitoBean
    private BoardRepository boardRepository;

    @Nested
    class CreateForBoardTests {

        @Test
        void shouldFailWhenBoardNotFound() throws DataAccessException {
            when(boardRepository.findById(999)).thenReturn(null);

            Result<Room> actual = service.createForBoard(999);

            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board 999 was not found"));

            verify(repository, never()).create(any());
        }

        @Test
        void createHappyPath() throws DataAccessException {
            Board existingBoard = TestDataHelper.existingBoard();

            when(boardRepository.findById(existingBoard.getBoardId())).thenReturn(existingBoard);
            when(repository.findByRoomCode(anyString())).thenReturn(null);
            when(repository.create(any())).thenAnswer(invocation -> invocation.getArgument(0));

            Result<Room> actual = service.createForBoard(existingBoard.getBoardId());

            assertEquals(ResultType.SUCCESS, actual.getResultType());
            assertEquals(existingBoard.getBoardId(), actual.getPayload().getBoardId());
            assertNotNull(actual.getPayload().getRoomCode());
            assertNotNull(actual.getPayload().getCreatedAt());

            verify(repository).create(any());
        }

        @Test
        void shouldRetryOnCodeCollision() throws DataAccessException {
            Board existingBoard = TestDataHelper.existingBoard();
            Room collidingRoom = TestDataHelper.existingRoom();

            when(boardRepository.findById(existingBoard.getBoardId())).thenReturn(existingBoard);
            // first generated code collides, second is available
            when(repository.findByRoomCode(anyString()))
                    .thenReturn(collidingRoom)
                    .thenReturn(null);
            when(repository.create(any())).thenAnswer(invocation -> invocation.getArgument(0));

            Result<Room> actual = service.createForBoard(existingBoard.getBoardId());

            assertEquals(ResultType.SUCCESS, actual.getResultType());
            verify(repository, times(2)).findByRoomCode(anyString());
            verify(repository).create(any());
        }

        @Test
        void shouldFailWhenUnableToGenerateUniqueCode() throws DataAccessException {
            Board existingBoard = TestDataHelper.existingBoard();
            Room collidingRoom = TestDataHelper.existingRoom();

            when(boardRepository.findById(existingBoard.getBoardId())).thenReturn(existingBoard);
            // every generated code collides
            when(repository.findByRoomCode(anyString())).thenReturn(collidingRoom);

            Result<Room> actual = service.createForBoard(existingBoard.getBoardId());

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains(
                    "Could not generate a unique room code, please try again"));

            verify(repository, times(10)).findByRoomCode(anyString());
            verify(repository, never()).create(any());
        }

        @Test
        void shouldFailWhenRepositoryCreateReturnsNull() throws DataAccessException {
            Board existingBoard = TestDataHelper.existingBoard();

            when(boardRepository.findById(existingBoard.getBoardId())).thenReturn(existingBoard);
            when(repository.findByRoomCode(anyString())).thenReturn(null);
            when(repository.create(any())).thenReturn(null);

            Result<Room> actual = service.createForBoard(existingBoard.getBoardId());

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Room could not be created"));
        }
    }

    @Nested
    class FindByRoomCodeTests {

        @Test
        void shouldReturnRoomWhenFound() throws DataAccessException {
            Room existing = TestDataHelper.existingRoom();

            when(repository.findByRoomCode(existing.getRoomCode())).thenReturn(existing);

            Room actual = service.findByRoomCode(existing.getRoomCode());

            assertEquals(existing, actual);
        }

        @Test
        void shouldReturnNullWhenNotFound() throws DataAccessException {
            when(repository.findByRoomCode("NOPE99")).thenReturn(null);

            Room actual = service.findByRoomCode("NOPE99");

            assertNull(actual);
        }
    }

    @Nested
    class DeleteTests {

        @Test
        void shouldReturnTrueWhenDeleted() throws DataAccessException {
            Room existing = TestDataHelper.existingRoom();

            when(repository.delete(existing.getRoomCode())).thenReturn(true);

            assertTrue(service.delete(existing.getRoomCode()));
        }

        @Test
        void shouldReturnFalseWhenNotFound() throws DataAccessException {
            when(repository.delete("NOPE99")).thenReturn(false);

            assertFalse(service.delete("NOPE99"));
        }
    }
}