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

        if (method.equals("POST"))
        {
            String body = new String(exchange.getRequestBody().readAllBytes());
            ObjectMapper mapper = new ObjectMapper();
            PatientRequest req = mapper.readValue(body, PatientRequest.class);

            int tenantId = TenantContext.getTenantId();
            PatientRepository repo = new PatientRepository();

            if (req.getName() == null || req.getName().isEmpty()) {
                sendResponse(exchange, 400, "{\"error\":\"Name is required\"}");
                return;
            }

            if (req.getAge() <= 0 || req.getAge() > 120) {
                sendResponse(exchange, 400, "{\"error\":\"Valid age is required\"}");
                return;
            }

            if (req.getGender() == null || req.getGender().isEmpty()) {
                sendResponse(exchange, 400, "{\"error\":\"Gender is required\"}");
                return;
            }

            if (req.getPhone() == null || req.getPhone().isEmpty()) {
                sendResponse(exchange, 400, "{\"error\":\"Phone is required\"}");
                return;
            }
            try {
                int patientId = repo.insertPatient(
                        tenantId, req.getName(), req.getAge(), req.getGender(),
                        req.getPhone(), req.getBloodGroup(), req.getComplaint()
                );

                sendResponse(exchange, 201, "{\"message\":\"Patient added\",\"patientId\":" + patientId + "}");
            }
            catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Failed to add patient\"}");
            }

        } else if (method.equals("GET"))
        {
            int tenantId = TenantContext.getTenantId();
            PatientRepository repo = new PatientRepository();

            try {
                List<String> patients = repo.findAllByTenant(tenantId);
                String json = "[" + String.join(",", patients) + "]";
                sendResponse(exchange, 200, json);

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Cannot get user response\"}");

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
