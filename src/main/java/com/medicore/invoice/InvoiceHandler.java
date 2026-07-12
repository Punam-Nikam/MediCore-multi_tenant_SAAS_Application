package com.medicore.invoice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.context.TenantContext;
import com.medicore.repository.InvoiceRepository;
import com.medicore.repository.PatientRepository;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;

import java.util.List;

public class InvoiceHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        try {
            if (method.equals("POST") && path.endsWith("/cash-paid")) {
                handleCashPaid(exchange, path);

            } else if (method.equals("POST")) {
                handleCreate(exchange);

            } else if (method.equals("GET")) {
                handleGetAll(exchange);

            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        } catch (Exception e) {
            System.out.println("InvoiceHandler ERROR: " + e.getMessage());
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Internal server error\"}");
        }
    }

    private void handleCreate(HttpExchange exchange) throws Exception {
        String body = new String(exchange.getRequestBody().readAllBytes());
        ObjectMapper mapper = new ObjectMapper();
        InvoiceRequest req = mapper.readValue(body, InvoiceRequest.class);

        int tenantId = TenantContext.getTenantId();
        PatientRepository patientRepo = new PatientRepository();
        InvoiceRepository repo = new InvoiceRepository();

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
    }

    private void handleGetAll(HttpExchange exchange) throws Exception {
        int tenantId = TenantContext.getTenantId();
        InvoiceRepository repo = new InvoiceRepository();
        List<String> invoices = repo.findAllByTenant(tenantId);
        String json = "[" + String.join(",", invoices) + "]";
        sendResponse(exchange, 200, json);
    }

    private void handleCashPaid(HttpExchange exchange, String path) throws Exception {
        int tenantId = TenantContext.getTenantId();

        String idStr = path.replace("/api/invoices/", "").replace("/cash-paid", "").trim();
        int invoiceId = Integer.parseInt(idStr);

        InvoiceRepository repo = new InvoiceRepository();
        boolean done = repo.markPaidById(invoiceId, tenantId);

        if (done) {
            sendResponse(exchange, 200, "{\"message\":\"Invoice marked as paid (cash)\"}");
        } else {
            sendResponse(exchange, 404, "{\"error\":\"Invoice not found\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes("UTF-8");
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}