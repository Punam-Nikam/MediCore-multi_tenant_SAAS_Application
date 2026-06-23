package com.medicore.filter;

import com.medicore.context.TenantContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;

public class SecuredHandler implements HttpHandler
{
    private final HttpHandler realHandler;
    private final AuthFilter authFilter = new AuthFilter();

    public SecuredHandler(HttpHandler realHandler){
        this.realHandler = realHandler;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        try {
            boolean allowed = authFilter.check(exchange);

            if (!allowed) {
                return;  //authFiler already sent 401 response
            }
            realHandler.handle(exchange);
        } finally {
            TenantContext.clear(); // ALWAYS clear, success or failure
        }
    }
}