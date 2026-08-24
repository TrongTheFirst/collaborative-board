package learn.domain;

import learn.data.DataAccessException;
import learn.data.TestDataHelper;
import learn.data.repository_interface.UserRepository;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserServiceTest {

    @Autowired
    private UserService service;

    @MockitoBean
    private PasswordEncoder encoder;

    @MockitoBean
    private UserRepository repository;


    @Nested
    class CreateTests{
        @Test
        void createFailsWhenEmailIsBlank() throws DataAccessException {
            User toCreate = TestDataHelper.userToCreate();
            toCreate.setEmail("");

            Result<User> actual = service.create(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Email cannot be blank"));

            verify(repository, never()).create(any());
            verify(encoder, never()).encode(any());
        }

        @Test
        void createFailsWhenPasswordIsBlank() throws DataAccessException {
            User toCreate = TestDataHelper.userToCreate();
            toCreate.setPassword("");

            Result<User> actual = service.create(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Password cannot be blank"));

            verify(repository, never()).create(any());
            verify(encoder, never()).encode(any());
        }

        @Test
        void createFailsWhenDisplayNameIsBlank() throws DataAccessException {
            User toCreate = TestDataHelper.userToCreate();
            toCreate.setDisplayName("");

            Result<User> actual = service.create(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Display name cannot be blank"));

            verify(repository, never()).create(any());
            verify(encoder, never()).encode(any());
        }

        @Test
        void createFailsWhenCreatedAtIsNull() throws DataAccessException {
            User toCreate = TestDataHelper.userToCreate();
            toCreate.setCreatedAt(null);

            Result<User> actual = service.create(toCreate);

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Created at cannot be null"));

            verify(repository, never()).create(any());
            verify(encoder, never()).encode(any());
        }

        @Test
        void createFailsWhenEmailIsDuplicate() throws DataAccessException {
            when(repository.findByEmail(TestDataHelper.userToCreate().getEmail())).thenReturn(TestDataHelper.existingUser());

            Result<User> actual = service.create(TestDataHelper.userToCreate());

            assertEquals(ResultType.INVALID, actual.getResultType());
            assertTrue(actual.getErrorMessages().contains("Email is already taken"));

            verify(repository, never()).create(any());
            verify(encoder, never()).encode(any());
        }

        @Test
        void createHappyPath() throws DataAccessException {
            User user = TestDataHelper.userToCreate();
            User created = TestDataHelper.userAfterCreate();

            when(repository.findByEmail(user.getEmail())).thenReturn(null);
            when(encoder.encode(user.getPassword())).thenReturn("encoded-password");
            when(repository.create(user)).thenReturn(created);

            Result<User> actual = service.create(user);

            assertEquals(created, actual.getPayload());
            assertEquals("encoded-password", user.getPassword());
        }
    }

}