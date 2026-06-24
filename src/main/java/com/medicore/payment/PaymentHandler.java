package com.medicore.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medicore.context.TenantContext;
import com.medicore.repository.InvoiceRepository;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.SQLException;

public class PaymentHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();

        if(!method.equals("POST")) {
            sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            return;
        }

        String body = new String(exchange.getRequestBody().readAllBytes());

        ObjectMapper mapper = new ObjectMapper();
        PaymentRequest req = mapper.readValue(body, PaymentRequest.class);

        if (req.getInvoiceId() <= 0) {
            sendResponse(exchange, 400, "{\"error\":\"Valid invoiceId is required\"}");
            return;
        }

        int tenantId = TenantContext.getTenantId();
        InvoiceRepository repo = new InvoiceRepository();
        RazorpayService service = new RazorpayService();

        try {
            double amount = repo.getAmountByIdAndTenant(req.getInvoiceId(), tenantId);

            if (amount == -1) {
                sendResponse(exchange, 404, "{\"error\":\"Invoice not found\"}");
                return;
            }

            String orderId = service.createOrder(amount);

            repo.updateRazorpayOrderId(req.getInvoiceId(),orderId);

            sendResponse(exchange, 200,"{\"orderId\":\"" + orderId + "\",\"amount\":" + amount + "}");
        }
        catch (SQLException e)
        {
            sendResponse(exchange, 500, "{\"error\":\"Payment processing failed\"}");
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

