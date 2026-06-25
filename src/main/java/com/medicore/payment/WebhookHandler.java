package com.medicore.payment;

import com.medicore.repository.InvoiceRepository;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;

public class WebhookHandler implements HttpHandler
{
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String body = new String(exchange.getRequestBody().readAllBytes());
        String signature = exchange.getRequestHeaders().getFirst("X-Razorpay-Signature");

        RazorpayService service = new RazorpayService();

        try {
            String expectedSignature = service.generateSignature(body);
            if (!signature.equals(expectedSignature)) {
                sendResponse(exchange, 400, "{\"error\":\"Invalid signature\"}");
                return;
            }

            String orderId = body.trim();

            InvoiceRepository repo = new InvoiceRepository();
            repo.markAsPaid(orderId);

            sendResponse(exchange, 200, "{\"message\":\"Payment confirmed\"}");

        } catch (Exception e) {
            System.out.println("WEBHOOK ERROR: " + e.getMessage());
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Webhook processing failed\"}");
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
