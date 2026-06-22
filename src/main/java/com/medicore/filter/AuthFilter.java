package com.medicore.filter;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.medicore.context.TenantContext;
import com.medicore.security.JwtUtil;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.io.OutputStream;

public class AuthFilter
{
    public boolean check(HttpExchange exchange) throws IOException {
        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");

        if(authHeader == null || !authHeader.startsWith("Bearer")) {
            sendUnauthorized(exchange);
            return false;
        }

        String token = authHeader.substring(7);

        try {
            DecodedJWT  decoded = JwtUtil.verifyToken(token);

            int userId = decoded.getClaim("userId").asInt();
            int tenantId = decoded.getClaim("tenantId").asInt();
            String role = decoded.getClaim("role").asString();

            TenantContext.set(userId, tenantId, role);

            System.out.println("Authenticated - UserId : " + userId + "tenantId : "+ tenantId +",role : " +role);
            return true;

        } catch (JWTVerificationException e){
            sendUnauthorized(exchange);
            return false;
        }
    }

    private void sendUnauthorized(HttpExchange exchange) throws IOException {

        String response ="{\"error\":\"Unauthorized - invalid or missing token\"}";

        byte[] responseBytes = response.getBytes();

        exchange.sendResponseHeaders(401, responseBytes.length);

        OutputStream os = exchange.getResponseBody();
        os.write(responseBytes);
        os.close();
    }
}