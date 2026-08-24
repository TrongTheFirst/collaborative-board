package learn.domain;

import learn.data.DataAccessException;
import learn.data.repository_interface.UserRepository;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class UserService implements UserDetailsService {
    private final UserRepository repository;
    private final PasswordEncoder encoder;

    public User findByEmail(String email) throws DataAccessException {
        return repository.findByEmail(email);
    }


    public Result<User> create(User user) throws DataAccessException {
        Result<User> result = new Result<>();

        if (user.getEmail().isBlank()) {
            result.addErrorMessage("Email cannot be blank", ResultType.INVALID);
        }

        if (user.getPassword().isBlank()) {
            result.addErrorMessage("Password cannot be blank", ResultType.INVALID);
        }

        if(user.getDisplayName().isBlank()) {
            result.addErrorMessage("Display name cannot be blank", ResultType.INVALID);
        }

        if(user.getCreatedAt() == null) {
            result.addErrorMessage("Created at cannot be null", ResultType.INVALID);
        }

        if (repository.findByEmail(user.getEmail()) != null) {
            result.addErrorMessage("Email is already taken", ResultType.INVALID);
        }

        if (result.isSuccess()) {
            user.setPassword(encoder.encode(user.getPassword()));
            User created = repository.create(user);
            result.setPayload(created);
        }

        return result;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = null;
        try {
            user = repository.findByEmail(email);
        } catch (DataAccessException e) {
            throw new RuntimeException(e);
        }

        if (user == null) {
            throw new UsernameNotFoundException("No user found with email: " + email);
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .build();
    }
}
