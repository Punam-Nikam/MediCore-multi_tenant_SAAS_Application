package com.medicore.context;

public class TenantContext
{
    private static final ThreadLocal<Integer> userId = new ThreadLocal<>();
    private static final ThreadLocal<Integer> tenantId = new ThreadLocal<>();
    private static final ThreadLocal<String> role = new ThreadLocal<>();

    public static void set(int uId , int tId, String r){
        userId.set(uId);
        tenantId.set(tId);
        role.set(r);
    }

    public static int getUserId() {
        return userId.get();
    }

    public static int getTenantId() {
        return tenantId.get();
    }

    public static String getRole() {
        return role.get();
    }

    public static void clear() {
        userId.remove();
        tenantId.remove();
        role.remove();
    }
}