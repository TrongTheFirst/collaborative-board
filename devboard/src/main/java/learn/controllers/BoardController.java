package learn.controllers;

import learn.data.DataAccessException;
import learn.domain.BoardService;
import learn.domain.Result;
import learn.domain.UserService;
import learn.models.Board;
import learn.models.User;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
@CrossOrigin
@AllArgsConstructor
public class BoardController {

    private final BoardService service;
    private final UserService userService;

    @PostMapping("/add")
    public ResponseEntity<?> addBoard(@RequestBody Board board, Authentication auth) throws DataAccessException {
        UserDetails userDetails = null;
        User user = null;
        if(auth != null) {
            userDetails = (UserDetails) auth.getPrincipal();
            user = userService.findByEmail(userDetails.getUsername());
        }

        boolean boardOwnerIdAndJwtTokenUserIdIsNotTheSame =
                user!=null
                && board.getOwnerId()!=0
                && board.getOwnerId() != user.getId();
        if(boardOwnerIdAndJwtTokenUserIdIsNotTheSame){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Result<Board> result = service.create(board);

        if (!result.isSuccess()) {
            return ErrorResponse.build(result);
        }

        return new ResponseEntity<>(result.getPayload(), HttpStatus.CREATED);
    }
}
