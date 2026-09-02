package learn.dtos;

import learn.models.BoardElement;

public record BoardElementResponse(boolean success, String type, String error, BoardElement payload) {
}
