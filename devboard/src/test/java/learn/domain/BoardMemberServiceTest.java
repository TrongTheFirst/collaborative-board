package learn.domain;

import learn.TestDataHelper;
import learn.data.DataAccessException;
import learn.data.repository_interface.BoardMemberRepository;
import learn.data.repository_interface.RoomRepository;
import learn.models.BoardMember;
import learn.models.Room;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class BoardMemberServiceTest {

    @Autowired
    private BoardMemberService service;

    @MockitoBean
    private BoardMemberRepository repository;

    @MockitoBean
    private RoomRepository roomRepository;

    @Nested
    class AddTests {

        @Test
        void shouldFailWhenNull() throws DataAccessException {
            Result<BoardMember> actual = service.add(null);

            assertEquals(ResultType.INVALID, actual.getResultType());
            verify(repository, never()).create(any());
        }

        @Test
        void shouldFailWhenIdIsNotZero() throws DataAccessException {
            BoardMember invalid = TestDataHelper.existingBoardMember();

            Result<BoardMember> actual = service.add(invalid);

            assertEquals(ResultType.INVALID, actual.getResultType());
            verify(repository, never()).create(any());
        }

        @Test
        void shouldFailWhenRoomCodeBlank() throws DataAccessException {
            BoardMember invalid = TestDataHelper.boardMemberToCreate();
            invalid.setRoomCode(" ");

            Result<BoardMember> actual = service.add(invalid);

            assertEquals(ResultType.INVALID, actual.getResultType());
            verify(repository, never()).create(any());
        }

        @Test
        void shouldFailWhenRoomNotFound() throws DataAccessException {
            BoardMember toCreate = TestDataHelper.boardMemberToCreate();

            when(roomRepository.findByRoomCode(toCreate.getRoomCode())).thenReturn(null);

            Result<BoardMember> actual = service.add(toCreate);

            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
            verify(repository, never()).create(any());
        }

        @Test
        void addHappyPath() throws DataAccessException {
            BoardMember toCreate = TestDataHelper.boardMemberToCreate();
            BoardMember afterCreate = TestDataHelper.boardMemberAfterCreate();
            Room existingRoom = TestDataHelper.existingRoom();

            when(roomRepository.findByRoomCode(toCreate.getRoomCode())).thenReturn(existingRoom);
            when(repository.create(any())).thenReturn(afterCreate);

            Result<BoardMember> actual = service.add(toCreate);

            assertEquals(ResultType.SUCCESS, actual.getResultType());
            assertEquals(afterCreate, actual.getPayload());
            verify(repository).create(any());
        }

        @Test
        void shouldFailWhenRepositoryCreateReturnsNull() throws DataAccessException {
            BoardMember toCreate = TestDataHelper.boardMemberToCreate();
            Room existingRoom = TestDataHelper.existingRoom();

            when(roomRepository.findByRoomCode(toCreate.getRoomCode())).thenReturn(existingRoom);
            when(repository.create(any())).thenReturn(null);

            Result<BoardMember> actual = service.add(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Board member could not be created"));
        }
    }

    @Nested
    class FindByRoomCodeTests {

        @Test
        void shouldReturnMembersWhenFound() throws DataAccessException {
            BoardMember existing = TestDataHelper.existingBoardMember();

            when(repository.findByRoomCode(existing.getRoomCode())).thenReturn(List.of(existing));

            List<BoardMember> actual = service.findByRoomCode(existing.getRoomCode());

            assertEquals(1, actual.size());
            assertEquals(existing, actual.get(0));
        }

        @Test
        void shouldReturnEmptyListWhenNoneFound() throws DataAccessException {
            when(repository.findByRoomCode("NOPE99")).thenReturn(List.of());

            List<BoardMember> actual = service.findByRoomCode("NOPE99");

            assertTrue(actual.isEmpty());
        }
    }

    @Nested
    class FindByIdTests {

        @Test
        void shouldReturnMemberWhenFound() throws DataAccessException {
            BoardMember existing = TestDataHelper.existingBoardMember();

            when(repository.findById(existing.getId())).thenReturn(existing);

            BoardMember actual = service.findById(existing.getId());

            assertEquals(existing, actual);
        }

        @Test
        void shouldReturnNullWhenNotFound() throws DataAccessException {
            when(repository.findById(999)).thenReturn(null);

            assertNull(service.findById(999));
        }
    }

    @Nested
    class DeleteTests {

        @Test
        void shouldReturnSuccessWhenDeleted() throws DataAccessException {
            when(repository.delete(1)).thenReturn(true);

            Result<BoardMember> actual = service.delete(1);

            assertEquals(ResultType.SUCCESS, actual.getResultType());
        }

        @Test
        void shouldFailWhenNotFound() throws DataAccessException {
            when(repository.delete(999)).thenReturn(false);

            Result<BoardMember> actual = service.delete(999);

            assertEquals(ResultType.NOT_FOUND, actual.getResultType());
        }
    }
}