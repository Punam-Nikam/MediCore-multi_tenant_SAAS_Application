package com.medicore.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.repository.UserRepository;
import com.medicore.security.JwtUtil;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.ResultSet;
import java.sql.SQLException;

public class LoginHandler implements HttpHandler
{
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        String body = new String(exchange.getRequestBody().readAllBytes());

        ObjectMapper mapper = new ObjectMapper();
        LoginRequest req = mapper.readValue(body , LoginRequest.class);

        if(req.getEmail() == null || req.getEmail().isBlank()) {
            sendResponse(exchange, 400, "{\"error\":\"Email is required\"}");
            return;
        }
        if (req.getPassword() == null || req.getPassword().isEmpty()) {
            sendResponse(exchange, 400, "{\"error\":\"Password is required\"}");
            return;
        }

        UserRepository userRepo = new UserRepository();

        try {
            ResultSet rs = userRepo.findUserByEmail(req.getEmail());
            if(!rs.next()) {
                sendResponse(exchange, 401, "{\"error\":\"Invalid email or password\"}");
                return;
            }
            String storeHash = rs.getString("password");

            boolean passwordMatches = BCrypt.checkpw(req.getPassword() ,storeHash);

            if(!passwordMatches) {
                sendResponse(exchange, 401, "{\"error\":\"Invalid email or password\"}");
                return;
            }

            int userId = rs.getInt("id");
            int tenantId = rs.getInt("tenant_id");
            String role = rs.getString("role");

            String token = JwtUtil.createToken(userId, tenantId, role);
            System.out.println("Login successFul token : "+ token);
            sendResponse(exchange, 200, "{\"token\":\""+ token + " \"}");

            }catch(SQLException e){
            System.out.println("Database error : "+e.getMessage());
            sendResponse(exchange, 401, "{\"error\":\"Login failed\"}");
        }
    }
    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] responseBytes = response.getBytes();
        exchange.sendResponseHeaders(statusCode,responseBytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(responseBytes);
        os.close();
    }
}
