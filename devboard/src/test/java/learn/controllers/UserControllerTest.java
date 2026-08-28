package learn.controllers;


import learn.TestDataHelper;
import learn.domain.Result;
import learn.domain.ResultType;
import learn.domain.UserService;
import learn.dtos.LoginRequest;
import learn.models.User;
import learn.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService service;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private AuthenticationManager authManager;

    @Test
    void registerUserFailsWhenServiceReturnsInvalid() throws Exception {
        User user = TestDataHelper.userToCreate();

        Result<User> result = new Result<>();
        result.addErrorMessage("Email is already taken", ResultType.INVALID);

        when(service.create(user)).thenReturn(result);

        mockMvc.perform(post("/api/user/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isBadRequest())
                .andExpect(content().json("[\"Email is already taken\"]"));
    }

    @Test
    void registerUserHappyPath() throws Exception {
        User user = TestDataHelper.userToCreate();
        User createdUser = TestDataHelper.userToCreate();

        Result<User> result = new Result<>();
        result.setPayload(createdUser);

        when(service.create(user)).thenReturn(result);
        when(jwtUtil.generateToken(
                createdUser.getId(),
                createdUser.getEmail(),
                createdUser.getDisplayName()
        )).thenReturn("test-token");

        mockMvc.perform(post("/api/user/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("test-token"));
    }

    @Test
    void loginUserFailsWhenBadEmailOrPassword() throws Exception {
        LoginRequest loginRequest = new LoginRequest("fake@email.com","wrong-password");

        when(authManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/user/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid email or password"));
    }

    @Test
    void loginUserHappyPath() throws Exception {
        User user = TestDataHelper.existingUser();
        LoginRequest loginRequest = new LoginRequest(user.getEmail(), "a");

        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(authManager.authenticate(any()))
                .thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn(user.getEmail());
        when(service.findByEmail(user.getEmail())).thenReturn(user);
        when(jwtUtil.generateToken(user.getId(), user.getEmail(), user.getDisplayName())).
                thenReturn("test-token");

        mockMvc.perform(post("/api/user/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.token").value("test-token"));
    }
}
