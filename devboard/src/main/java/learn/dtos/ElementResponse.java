package learn.dtos;

import learn.models.BoardElement;

public record ElementResponse(boolean success, BoardElement element, String error) {}