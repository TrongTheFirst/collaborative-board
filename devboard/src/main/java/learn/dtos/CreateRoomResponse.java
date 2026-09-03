package learn.dtos;

import learn.models.BoardMember;

import java.util.List;

public record CreateRoomResponse(boolean success,
                                 List<String> errors,
                                 BoardMember member
 ) { }
