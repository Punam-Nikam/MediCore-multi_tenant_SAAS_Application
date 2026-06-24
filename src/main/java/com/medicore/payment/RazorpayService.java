package com.medicore.payment;

import java.util.UUID;

public class RazorpayService
{
    public String createOrder(double amount){

        String orderId = "order_"+ UUID.randomUUID().toString();
        System.out.println("Fake RazorPay order created : "+orderId + "for amount : "+ amount);
        return orderId;
    }
}
