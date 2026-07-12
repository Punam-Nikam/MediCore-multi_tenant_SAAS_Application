package com.medicore;

import com.medicore.auth.AuthHandler;
import com.medicore.auth.LoginHandler;
import com.medicore.db.DBConnection;
import com.medicore.filter.SecuredHandler;
import com.medicore.invoice.InvoiceHandler;
import com.medicore.patient.PatientHandler;
import com.medicore.payment.PaymentHandler;
import com.medicore.payment.RazorpayService;
import com.medicore.payment.SignatureHandler;
import com.medicore.payment.WebhookHandler;
import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.sql.Connection;
import java.util.concurrent.Executors;
import com.medicore.filter.CorsFilter;

public class Main
{

    private static final int PORT = 8080;

    public static void main(String[] args) {

        System.out.println("Starting MediCore!");
        //test database connection
        try{
            Connection conn = DBConnection.getConnection();

            if(conn != null){
                System.out.println("Database connected successfully !!");
                conn.close();;
            }
        } catch(Exception e){
            System.out.println("Database connection failed : "+e.getMessage());
            return;
        }

        //step 2 : create http server
        try{
            HttpServer server = HttpServer.create(
                    new InetSocketAddress(PORT),0
            );

            //step 3 : Register URL routes

            server.createContext("/api/register", new CorsFilter(new AuthHandler()));
            server.createContext("/api/login", new CorsFilter(new LoginHandler()));
            server.createContext("/api/patients", new CorsFilter(new SecuredHandler(new PatientHandler())));
            server.createContext("/api/invoices", new CorsFilter(new SecuredHandler(new InvoiceHandler())));
            server.createContext("/api/payments", new CorsFilter(new SecuredHandler(new PaymentHandler())));
            server.createContext("/api/webhook/razorpay", new CorsFilter(new WebhookHandler()));
            server.createContext("/api/webhook/sign", new CorsFilter(new SignatureHandler()));

            //step 4 : Give server a thread pool
            //each request gets its own thread from this pool

            server.setExecutor(Executors.newFixedThreadPool(10));

            //step 5 : start server
            server.start();

            System.out.println("MediCore running on port : "+PORT);
            System.out.println("Test : http://localhost:8080");

        }catch(Exception e) {
            System.out.println("Server failed to start");
        }


        //temporatity tesing code for webhook razorpay payment

//        try {
//            RazorpayService testService = new RazorpayService();
//            String testSignature = testService.generateSignature("order_8433e356-589e-43fe-bcab-3af1a89de581");
//            System.out.println("TEST SIGNATURE: " + testSignature);
//        } catch (Exception e) {
//
//            System.out.println("Error: " + e.getMessage());
//        }
    }

}