package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.BoardGeminiAgentService;
import learn.domain.BoardService;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin
@AllArgsConstructor
public class BoardAgentController {

    private final BoardGeminiAgentService agentService;
    private final BoardService boardService;
    private final AuthHelper authHelper;

    public record AgentDrawRequest(long boardId, String prompt, double centerX, double centerY) {}

    @PostMapping("/draw")
    public ResponseEntity<?> draw(@RequestBody AgentDrawRequest request, Authentication auth) throws DataAccessException {
        User user = authHelper.getUserFromAuth(auth);
        if (user != null && !boardService.userHasBoard(user.getId(), request.boardId())) {
            return new ResponseEntity<>("Board does not belong to user", HttpStatus.FORBIDDEN);
        }

        String summary = agentService.runAgent(request.boardId(), request.prompt(), request.centerX, request.centerY);
        return ResponseEntity.ok(Map.of("summary", summary));
    }
}