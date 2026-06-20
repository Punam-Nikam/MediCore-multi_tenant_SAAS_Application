package com.medicore.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;

import com.medicore.repository.TenantRepository;
import com.medicore.repository.UserRepository;

public class AuthHandler implements HttpHandler
{
    @Override
public void handle(HttpExchange exchange) throws IOException {
        System.out.println("Request received");

        //read incoming JSON from client
        String body = new String(exchange.getRequestBody().readAllBytes());

        //convert JSON string -> RegisterRequest object
        ObjectMapper mapper = new ObjectMapper();
        RegisterRequest req = mapper.readValue(body, RegisterRequest.class);

        //now we can access individual field cleanly

        if(req.getClinicName() == null || req.getClinicName().isBlank()){
            sendResponse(exchange, 400, "{\"error\":\"Clinic name is required!\"}");
            return;
        }
        if(req.getEmail() == null || req.getEmail().isEmpty()){
            sendResponse(exchange, 400, "{\"error\":\"Email is required!\"}");
            return;
        }
        if (!req.getEmail().contains("@") || !req.getEmail().contains(".")) {
            sendResponse(exchange, 400, "{\"error\":\"Invalid email format\"}");
            return;
        }
        if(req.getPassword() == null || req.getPassword().isEmpty() || req.getPassword().length() < 6){
            sendResponse(exchange, 400, "{\"error\":\"Password must be at least 6 characters!\"}");
            return;
        }
        System.out.println("Validation passed!");
        sendResponse(exchange, 200, "{\"message\":\"Received your request!\"}");
        String hashedPassword = BCrypt.hashpw(req.getPassword(), BCrypt.gensalt(12));

        System.out.println("Original password : "+req.getPassword());
        System.out.println("Hashed password : "+hashedPassword);

        TenantRepository tenantRepo = new TenantRepository();
        try{
        int tenantId= tenantRepo.insertTenant(
                req.getClinicName(),
                req.getEmail(),
                req.getPhone(),
                req.getCity()
        );
            System.out.println("Tenant created with id");
            sendResponse(exchange,201,"{\"error\":\"Tenant created!\",\"tenant id\" : " +tenantId+"}");

            UserRepository userRepo = new UserRepository();

            userRepo.insertUser(tenantId,
                    req.getOwnerName(),
                    req.getEmail(),
                    hashedPassword,
                    "OWNER",
                    null);

            System.out.println("User created for tenant : " +tenantId);


        } catch(SQLException e){
            System.out.println("Database error: " + e.getMessage());
            sendResponse(exchange,500,"{\"error\":\"Failed to create tenant!\"}");
        }



    }

    //send response back
    private void sendResponse(HttpExchange exchange,int statusCode, String response) throws IOException
    {
        byte[] responseBytes = response.getBytes();

        exchange.sendResponseHeaders(statusCode, responseBytes.length);

        OutputStream os = exchange.getResponseBody();
        os.write(responseBytes);
        os.close();
    }
}
