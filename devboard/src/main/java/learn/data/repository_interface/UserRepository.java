package learn.data.repository_interface;

import learn.models.User;

public interface UserRepository {
    User findByEmail(String email);
}
