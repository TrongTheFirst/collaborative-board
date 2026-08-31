package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.BoardService;
import learn.domain.Result;
import learn.dtos.BoardRequest;
import learn.models.Board;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
@CrossOrigin
@AllArgsConstructor
public class BoardController {

    private final BoardService service;
    private final AuthHelper authHelper;

    @GetMapping("/{boardId}")
    public ResponseEntity<?> getBoard(@PathVariable("boardId") long boardId) throws DataAccessException {
        Board result = service.findById(boardId);
        if(result == null) {
            return new ResponseEntity<>("Board not found",HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUsersBoard(@PathVariable("userId") long userId, Authentication auth) throws DataAccessException {
        User user = authHelper.getUserFromAuth(auth);

        if (user == null) {
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        if (user.getId() != userId) {
            return new ResponseEntity<>("Cannot access another user's boards", HttpStatus.FORBIDDEN);
        }

        List<Board> boards = service.findByUserId(userId);
        return new ResponseEntity<>(boards, HttpStatus.OK);
    }
    @PostMapping("/add")
    public ResponseEntity<?> addBoard(@RequestBody Board board, Authentication auth) throws DataAccessException {
        //both anonymous and logged-in users are allowed to add boards
        if(authHelper.boardOwnerExistsAndAuthUserIsNotTheSame(board.getOwnerId(), auth)){
            return new ResponseEntity<>("Owner and User are not the same",HttpStatus.FORBIDDEN);
        }

        Result<Board> result = service.create(board);

        if (!result.isSuccess()) {
            return ErrorResponse.build(result);
        }

        return new ResponseEntity<>(result.getPayload(), HttpStatus.CREATED);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteBoard(@RequestBody BoardRequest boardRequest, Authentication auth) throws DataAccessException {
        User user = authHelper.getUserFromAuth(auth);
        if (user == null) {
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        Board existingBoard = service.findById(boardRequest.boardId());
        if (existingBoard == null) {
            return new ResponseEntity<>("Board not found", HttpStatus.NOT_FOUND);
        }

        if (existingBoard.getOwnerId() != user.getId()) {
            return new ResponseEntity<>("Cannot delete another user's board", HttpStatus.FORBIDDEN);
        }

        Result<Board> result = service.delete(boardRequest.boardId());
        if (!result.isSuccess()) {
            return ErrorResponse.build(result);
        }
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/edit")
    public ResponseEntity<?> editBoard(@RequestBody Board board, Authentication auth) throws DataAccessException {
        if(authHelper.boardOwnerExistsAndAuthUserIsNotTheSame(board.getOwnerId(), auth)){
            return new ResponseEntity<>("Owner and User are not the same",HttpStatus.FORBIDDEN);
        }
        Result<Board> result = service.update(board);
        if (!result.isSuccess()) {
            return ErrorResponse.build(result);
        }
        return  ResponseEntity.noContent().build();
    }
}
