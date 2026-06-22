package com.medicore.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;

import java.util.Date;

public class JwtUtil
{
    private static final String SECRET_KEY = "secretkeyforthetoken";
    private static final Algorithm ALGORITHM = Algorithm.HMAC256(SECRET_KEY);

    public static String createToken(int userId, int tenantId, String role) {

        Date now = new Date();
        Date expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); //24 hours

        return JWT.create()
                .withClaim("userId", userId)
                .withClaim("tenantId", tenantId)
                .withClaim("role", role)
                .withIssuedAt(now)
                .withExpiresAt(expiry)
                .sign(ALGORITHM);
    }

    public static DecodedJWT verifyToken(String token){
        return JWT.require(ALGORITHM).build().verify(token);
    }
}