package com.medicore.patient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.context.TenantContext;
import com.medicore.repository.PatientRepository;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.List;

public class PatientHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();

        if (method.equals("POST")) {

            String body = new String(exchange.getRequestBody().readAllBytes());
            ObjectMapper mapper = new ObjectMapper();
            PatientRequest req = mapper.readValue(body, PatientRequest.class);

            int tenantId = TenantContext.getTenantId();
            PatientRepository repo = new PatientRepository();

            try {
                int patientId = repo.insertPatient(
                        tenantId, req.getName(), req.getAge(), req.getGender(),
                        req.getPhone(), req.getBloodGroup(), req.getComplaint()
                );
                System.out.println("Success 201 ");
                sendResponse(exchange, 201, "{\"Success\":\"User inserted successfully ! \"}");

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Cannot inserted user !!\"}");
            }

        } else if (method.equals("GET")) {
            int tenantId = TenantContext.getTenantId();
            System.out.println("TenantId being used for query: " + tenantId);
            PatientRepository repo = new PatientRepository();


            try {
                List<String> patients = repo.findAllByTenant(tenantId);
                String json = "[" + String.join(",", patients) + "]";
                sendResponse(exchange, 200, json);

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Cannot get user response ! \"}");

            }
        }
            else{
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        }
        private void sendResponse (HttpExchange exchange,int statusCode, String response) throws IOException {
            byte[] responseBytes = response.getBytes();
            exchange.sendResponseHeaders(statusCode, responseBytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(responseBytes);
            os.close();
        }
}
