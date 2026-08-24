package learn.domain;

import learn.data.repository_interface.UserRepository;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService {
    private final UserRepository repository;

    public User findByEmail(String email) {
        return repository.findByEmail(email);
    }
}
