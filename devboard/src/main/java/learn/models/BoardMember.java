package learn.models;

import lombok.*;

import java.time.LocalDateTime;

import net.datafaker.Faker;

@Getter
@Setter
@ToString
@EqualsAndHashCode
@AllArgsConstructor
@NoArgsConstructor
public class BoardMember {
    private long id;
    private String clientId;
    private String displayName;
    private String roomCode;
    private int roleId;
    private LocalDateTime joinedAt;

    public static String generateDisplayName(){
        Faker faker = new Faker();
        String color = faker.color().name();
        color = color.substring(0,1).toUpperCase() + color.substring(1);
        String animal = faker.animal().name();
        animal = animal.substring(0,1).toUpperCase() + animal.substring(1);
        return color + " " + animal ;
    }
}