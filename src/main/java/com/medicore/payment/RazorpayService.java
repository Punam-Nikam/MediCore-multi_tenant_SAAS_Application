package com.medicore.payment;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.UUID;

public class RazorpayService
{
    public String createOrder(double amount){

        String orderId = "order_"+ UUID.randomUUID().toString();
        System.out.println("Fake RazorPay order created : "+orderId + "for amount : "+ amount);
        return orderId;
    }

    public static final String WEBHOOK_SECRET = "razorpay-webhook-secret-key";

    public String generateSignature(String payload) throws Exception{
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(WEBHOOK_SECRET.getBytes(), "HmacSHA256");
        mac.init(secretKey);

        byte[] hash = mac.doFinal(payload.getBytes());

        StringBuilder hexString = new StringBuilder();
        for(byte b : hash){
            String hex = Integer.toHexString(0xff & b);
            if(hex.length() == 1)
                hexString.append('0');

            hexString.append(hex);
        }
        return hexString.toString();
    }
}
