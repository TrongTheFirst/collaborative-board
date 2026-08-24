package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.Result;
import learn.domain.UserService;
import learn.dtos.AuthResponse;
import learn.models.User;
import learn.security.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
@AllArgsConstructor
public class UserController {

    private final UserService service;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) throws DataAccessException {
        Result<User> result = service.create(user);

        if (!result.isSuccess()) {
            return ErrorResponse.build(result);
        }
        User createdUser = result.getPayload();
        String token = jwtUtil.generateToken(createdUser.getId(), createdUser.getEmail(), createdUser.getDisplayName());
        AuthResponse response = new AuthResponse(token);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
