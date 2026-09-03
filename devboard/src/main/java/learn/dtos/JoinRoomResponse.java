package learn.dtos;


import learn.models.BoardElement;
import learn.models.BoardMember;

import java.util.List;

public record JoinRoomResponse(boolean success,
                               List<String> errors,
                               Long boardId,
                               boolean viewMode,
                               List<BoardElement> elements,
                               BoardMember member,
                               List<BoardMember> members
) {}
