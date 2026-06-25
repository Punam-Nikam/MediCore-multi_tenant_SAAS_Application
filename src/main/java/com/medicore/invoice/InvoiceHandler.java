package com.medicore.invoice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.context.TenantContext;
import com.medicore.repository.InvoiceRepository;
import com.medicore.repository.PatientRepository;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;
import java.util.List;

public class InvoiceHandler  implements HttpHandler
{
    @Override
    public void handle(HttpExchange exchange) throws IOException {

        String method = exchange.getRequestMethod();

        if (method.equals("POST")) {
            String body = new String(exchange.getRequestBody().readAllBytes());
            ObjectMapper mapper = new ObjectMapper();
            InvoiceRequest req = mapper.readValue(body, InvoiceRequest.class);

            int tenantId = TenantContext.getTenantId();
            PatientRepository patientRepo = new PatientRepository();
            InvoiceRepository repo = new InvoiceRepository();

            try {
                if (req.getDescription() == null || req.getDescription().isEmpty()) {
                    sendResponse(exchange, 400, "{\"error\":\"Description is required\"}");
                    return;
                }
                if (req.getAmount() <= 0) {
                    sendResponse(exchange, 400, "{\"error\":\"Amount must be greater than zero\"}");
                    return;
                }

                boolean patientExists = patientRepo.existsByIdAndTenant(req.getPatientId(), tenantId);

                if (!patientExists) {
                    sendResponse(exchange, 404, "{\"error\":\"Patient not found for this clinic\"}");
                    return;
                }

                int invoiceId = repo.insertInvoice(
                        tenantId, req.getPatientId(), req.getDescription(), req.getAmount()
                );

                sendResponse(exchange, 201, "{\"message\":\"Invoice created\",\"invoiceId\":" + invoiceId + "}");

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Failed to create invoice\"}");
            }

    } else if(method.equals("GET"))
        {
         int tenantId = TenantContext.getTenantId();
         InvoiceRepository repo = new InvoiceRepository();
            try {
                List<String> invoices = repo.findAllByTenant(tenantId);
                String json = "[" + String.join(",", invoices) + "]";
                sendResponse(exchange, 200, json);

            } catch (SQLException e) {
                sendResponse(exchange, 500, "{\"error\":\"Cannot get invoice details\"}");

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
