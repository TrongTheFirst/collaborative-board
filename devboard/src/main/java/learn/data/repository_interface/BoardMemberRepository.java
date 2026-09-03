package learn.data.repository_interface;

import learn.data.DataAccessException;
import learn.models.BoardMember;

import java.util.List;

public interface BoardMemberRepository {
    List<BoardMember> findByRoomCode(String roomCode) throws DataAccessException;

    BoardMember findById(long id) throws DataAccessException;

    BoardMember findByRoomCodeAndClientId(String roomCode, String clientId) throws DataAccessException;

    BoardMember create(BoardMember boardMember) throws DataAccessException;

    boolean delete(String roomCode, String clientId) throws DataAccessException;
}
