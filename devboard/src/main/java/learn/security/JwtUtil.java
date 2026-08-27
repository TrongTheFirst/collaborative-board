package learn.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey key = Jwts.SIG.HS256.key().build();
    private final long expirationMs = 1000*60*60; // 1 hour

    public String generateToken(long id, String email, String displayName) {
        return Jwts.builder()
                .subject(String.valueOf(id))
                .claim("email", email)
                .claim("displayName", displayName)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    //token verification
    public boolean isTokenValid(String token, String username) {
        return extractEmail(token).equals(username)
                && extractExpiration(token).after(new Date());
    }

    public String extractEmail(String token) {
        return parseClaims(token).get("email",String.class);
    }

    private Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    //extract the user details out of the token passed in the authorization header
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
