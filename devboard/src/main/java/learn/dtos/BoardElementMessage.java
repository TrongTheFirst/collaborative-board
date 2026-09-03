package learn.dtos;

import learn.models.BoardElement;
import lombok.*;


public record BoardElementMessage (String sender, BoardElement element) {}
