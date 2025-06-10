package com.rondatrack.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET = "CHAVE_SUPER_SECRETA";

    public String generateToken(String email, String role) {
        Algorithm algorithm = Algorithm.HMAC256(SECRET);
        String issuer = "RondaTrack";
        var expiresIn = Instant.now().plus(Duration.ofHours(2));
        return JWT.create()
                .withIssuer(issuer)
                .withIssuedAt(new Date())
                .withExpiresAt(expiresIn)
                .withSubject(email)
                .withClaim("role", role)
                .sign(algorithm);
    }

    public String extractEmail(String token) {
        return JWT.decode(token).getSubject();
    }

    public String extractRoles(String token) {
        return JWT.decode(token).getClaim("role").asString();
    }

    public boolean isValidToken(String token) {
        try {
            var verifier = JWT.require(Algorithm.HMAC256(SECRET)).build();
            verifier.verify(token);

            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
