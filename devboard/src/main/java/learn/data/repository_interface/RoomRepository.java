package learn.data.repository_interface;

import learn.data.DataAccessException;
import learn.models.Room;

public interface RoomRepository {
    Room findByRoomCode(String roomCode) throws DataAccessException;
    Room create(Room room) throws DataAccessException;
    boolean delete(String roomCode) throws DataAccessException;
}