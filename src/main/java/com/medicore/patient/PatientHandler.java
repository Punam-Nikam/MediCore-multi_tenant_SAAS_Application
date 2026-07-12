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
        String path = exchange.getRequestURI().getPath();

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

        } else if (method.equals("GET")) {

            int tenantId = TenantContext.getTenantId();
            PatientRepository repo = new PatientRepository();


            try {
                if (path.equals("/api/patients")) {
                    // GET all patients
                    List<String> patients = repo.findAllByTenant(tenantId);
                    String json = "[" + String.join(",", patients) + "]";
                    sendResponse(exchange, 200, json);

                } else {
                    // GET one patient by ID
                    String idStr = path.substring("/api/patients/".length());
                    int patientId = Integer.parseInt(idStr);

                    String json = repo.findByIdAndTenant(patientId, tenantId);

                    if (json == null) {
                        sendResponse(exchange, 404, "{\"error\":\"Patient not found\"}");
                    } else {
                        sendResponse(exchange, 200, json);
                    }
                }

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Cannot get patient data\"}");
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"error\":\"Invalid patient id\"}");
            }
        }
        else if (method.equals("DELETE")) {

            int tenantId = TenantContext.getTenantId();
            PatientRepository repo = new PatientRepository();

            try {
                String idStr = path.substring("/api/patients/".length());
                int patientId = Integer.parseInt(idStr);

                boolean deleted = repo.deletePatient(patientId, tenantId);

                if (deleted) {
                    sendResponse(exchange, 200, "{\"message\":\"Patient deleted\"}");
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Patient not found\"}");
                }

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Cannot delete patient\"}");
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"error\":\"Invalid patient id\"}");
            }
        } else if (method.equals("PUT")) {

            int tenantId = TenantContext.getTenantId();
            PatientRepository repo = new PatientRepository();

            String body = new String(exchange.getRequestBody().readAllBytes());
            ObjectMapper mapper = new ObjectMapper();
            PatientRequest req = mapper.readValue(body, PatientRequest.class);

            try {
                String idStr = path.substring("/api/patients/".length());
                int patientId = Integer.parseInt(idStr);

                boolean updated = repo.updatePatient(
                        patientId, tenantId, req.getName(), req.getAge(),
                        req.getGender(), req.getPhone(), req.getBloodGroup(), req.getComplaint()
                );

                if (updated) {
                    sendResponse(exchange, 200, "{\"message\":\"Patient updated\"}");
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Patient not found\"}");
                }

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Cannot update patient\"}");
            } catch (NumberFormatException e) {
                sendResponse(exchange, 400, "{\"error\":\"Invalid patient id\"}");
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