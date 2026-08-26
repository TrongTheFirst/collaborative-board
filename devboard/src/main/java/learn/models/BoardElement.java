package learn.models;

import lombok.*;
import tools.jackson.databind.JsonNode;

import java.math.BigInteger;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class BoardElement {
    private BigInteger element_id;
    private long board_id;
    private String type;
    private JsonNode element_data;
    

}
