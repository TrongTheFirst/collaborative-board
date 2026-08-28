package learn.dtos;

import learn.models.BoardElement;

import java.util.List;

public record JoinRoomResponse(boolean success, String error, Long boardId, List<BoardElement> elements) { }
