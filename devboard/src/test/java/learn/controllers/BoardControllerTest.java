package learn.controllers;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import learn.data.TestDataHelper;
import learn.domain.BoardService;
import learn.domain.Result;
import learn.domain.ResultType;
import learn.domain.UserService;
import learn.models.Board;
import learn.models.User;
import learn.security.JwtFilter;
import learn.security.JwtUtil;
import learn.security.SecurityConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BoardController.class)
@AutoConfigureMockMvc(addFilters = false)
class BoardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BoardService service;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtFilter jwtFilter;



    @Test
    void addBoardFailsWhenServiceReturnsInvalid() throws Exception {
        Board toCreate = TestDataHelper.boardToCreate();
        toCreate.setCreatedAt(null);

        Result<Board> result = new Result<>();
        result.addErrorMessage("Created at cannot be null", ResultType.INVALID);

        when(service.create(toCreate)).thenReturn(result);

        mockMvc.perform(post("/api/board/add")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(toCreate)))
                .andExpect(status().isBadRequest())
                .andExpect(content().json("[\"Created at cannot be null\"]"));
    }

    @Test
    void addBoardFailsWhenBoardOwnerIdDoesNotMatchAuthenticatedUser() throws Exception {
        Board toCreate = TestDataHelper.boardToCreate();
        toCreate.setOwnerId(2);

        User existingUser = TestDataHelper.existingUser();

        when(userService.findByEmail(existingUser.getEmail())).thenReturn(existingUser);

        mockMvc.perform(post("/api/board/add")
                        .with(authentication(
                                new UsernamePasswordAuthenticationToken(
                                        existingUser.getEmail(),
                                        "encoded-password"
                                )
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toCreate)))
                .andExpect(status().isForbidden());

        verify(service, never()).create(any(Board.class));
    }

    @Test
    void addBoardSucceedsWhenBoardOwnerIdMatchesAuthenticatedUser() throws Exception {
        Board toCreate = TestDataHelper.boardToCreate();

        User existingUser = TestDataHelper.existingUser();

        Result<Board> result = new Result<>();
        result.setPayload(TestDataHelper.boardToCreate());

        when(userService.findByEmail(existingUser.getEmail())).thenReturn(existingUser);
        when(service.create(toCreate)).thenReturn(result);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(existingUser.getEmail())
                .password("encoded-password")
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        mockMvc.perform(post("/api/board/add")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(toCreate)))
                .andExpect(status().isCreated())
                .andExpect(content().json(objectMapper.writeValueAsString(toCreate)));
    }

    @Test
    void addBoardSucceedsWithNoBoardOwnerId() throws Exception {
        Board toCreate = TestDataHelper.boardToCreate();
        toCreate.setOwnerId(0);

        Board afterCreate = TestDataHelper.boardToCreate();
        afterCreate.setOwnerId(0);

        Result<Board> result = new Result<>();
        result.setPayload(afterCreate);

        when(service.create(toCreate)).thenReturn(result);

        mockMvc.perform(post("/api/board/add")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(toCreate)))
                .andExpect(status().isCreated())
                .andExpect(content().json(objectMapper.writeValueAsString(afterCreate)));
    }


}