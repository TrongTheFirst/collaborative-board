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

    public String generateToken(int id, String email, String role) {
        return Jwts.builder()
                .subject(String.valueOf(id))
                .claim("role", role)
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    //token verification
    public boolean isTokenValid(String token, String username) {
        return extractUsername(token).equals(username)
                && extractExpiration(token).after(new Date());
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
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
