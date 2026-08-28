package learn.dtos;

import learn.models.BoardElement;

public record BoardElementResponse(boolean success, String error, BoardElement element) {
}
