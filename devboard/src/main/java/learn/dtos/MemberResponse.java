package learn.dtos;

import learn.models.BoardMember;

public record MemberResponse(String type, BoardMember member) {
}
