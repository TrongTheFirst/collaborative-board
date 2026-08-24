package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.Result;
import learn.domain.UserService;
import learn.dtos.AuthResponse;
import learn.dtos.LoginRequest;
import learn.models.User;
import learn.security.JwtUtil;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) throws DataAccessException {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();

            User user = service.findByEmail(userDetails.getUsername());

            String token = jwtUtil.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getDisplayName()
            );

            return new ResponseEntity<>(new AuthResponse(token),HttpStatus.OK);

        } catch (AuthenticationException e) {
            return new ResponseEntity<>("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }
    }
}
