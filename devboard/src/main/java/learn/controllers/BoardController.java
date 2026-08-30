package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.BoardService;
import learn.domain.Result;
import learn.dtos.BoardRequest;
import learn.models.Board;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
        //both anonymous and logged-in users are allowed to delete boards
        if(authHelper.boardOwnerExistsAndAuthUserIsNotTheSame(boardRequest.ownerId(), auth)){
            return new ResponseEntity<>("Owner and User are not the same",HttpStatus.FORBIDDEN);
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
