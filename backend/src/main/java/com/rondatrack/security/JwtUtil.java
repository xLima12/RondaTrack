package com.rondatrack.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET = "CHAVE_SUPER_SECRETA";
    private static final long EXPIRATION = 86400000;

    public String generateToken(String email) {
        Algorithm algorithm = Algorithm.HMAC256(SECRET);
        String issuer = "RondaTrack";
        return JWT.create()
                .withIssuer(issuer)
                .withIssuedAt(new Date())
                .withExpiresAt(Instant.ofEpochSecond(EXPIRATION))
                .withSubject(email)
                .withClaim("email", email)
                .sign(algorithm);
    }

    public String extractEmail(String token) {
        return JWT.decode(token).getClaim("email").toString();
    }

    public boolean isValidToken(String token) {
        try {
          var email = JWT.decode(token).getClaim("email").toString();

          if(email == null || email.isEmpty()) {
              return false;
          }

          var verifier = JWT.require(Algorithm.HMAC256(SECRET)).build();

          return !email.equals(verifier.verify(token).getSubject());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
