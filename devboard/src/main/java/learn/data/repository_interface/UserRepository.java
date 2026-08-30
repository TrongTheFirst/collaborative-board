package learn.data.repository_interface;

import learn.data.DataAccessException;
import learn.models.User;

public interface UserRepository {
    User findByEmail(String email) throws DataAccessException;

    User findById(long id) throws DataAccessException;

    User create(User user) throws DataAccessException;
}
