package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.BoardElementService;
import learn.domain.BoardService;
import learn.domain.Result;
import learn.models.Board;
import learn.models.BoardElement;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/element")
@CrossOrigin
@AllArgsConstructor
public class BoardElementController {

    private final BoardElementService service;
    private final BoardService boardService;
    private final AuthHelper authHelper;

    @GetMapping("/{boardId}")
    public ResponseEntity<?> getAllBoardElements(@PathVariable("boardId") long boardId) throws DataAccessException {
        List<BoardElement> boardElements = service.findAllFromBoardId(boardId);
        return ResponseEntity.ok(boardElements);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addElement(@RequestBody BoardElement element, Authentication auth) throws DataAccessException {
        User user =  authHelper.getUserFromAuth(auth);
        if(user != null){
            if(!boardService.userHasBoard(user.getId(), element.getBoardId())){
                return new ResponseEntity<>("Board does not belong to user",HttpStatus.FORBIDDEN);
            }
        }
        Result<BoardElement> result = service.add(element);
        if (!result.isSuccess()) {
            return ErrorResponse.build(result);
        }

        return new ResponseEntity<>(result.getPayload(), HttpStatus.CREATED);
    }



}
