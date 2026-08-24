package learn.controllers;

import learn.domain.Result;
import learn.domain.ResultType;
import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

@Getter
public class ErrorResponse {
    private final LocalDateTime timestamp = LocalDateTime.now();
    private final String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public static ResponseEntity<Object> build(Result<?> result) {
        HttpStatus status = HttpStatus.BAD_REQUEST;
        if (result.getResultType() == ResultType.NOT_FOUND) {
            status = HttpStatus.NOT_FOUND;
        }
        return new ResponseEntity<>(result.getErrorMessages(), status);
    }
}
