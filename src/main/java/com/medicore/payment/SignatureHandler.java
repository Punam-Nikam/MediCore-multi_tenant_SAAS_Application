package com.medicore.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Map;

public class SignatureHandler implements HttpHandler {

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String body = new String(exchange.getRequestBody().readAllBytes());
        ObjectMapper mapper = new ObjectMapper();
        Map<?, ?> req = mapper.readValue(body, Map.class);
        String orderId = (String) req.get("orderId");

        try {
            RazorpayService service = new RazorpayService();
            String signature = service.generateSignature(orderId);
            String response = "{\"signature\":\"" + signature + "\"}";
            byte[] bytes = response.getBytes();
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        } catch (Exception e) {
            exchange.sendResponseHeaders(500, -1);
        }
    }
}