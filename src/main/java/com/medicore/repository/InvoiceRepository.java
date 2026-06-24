package com.medicore.repository;

import com.medicore.db.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class InvoiceRepository
{
    public int insertInvoice(int tenantId, int patientId, String description, double amount) throws SQLException {

        String sql = "INSERT INTO invoices(tenant_id, patient_id, description, amount, status) VALUES (?, ?, ?, ?, ?)";

        Connection conn = DBConnection.getConnection();

        PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        ps.setInt(1, tenantId);
        ps.setInt(2, patientId);
        ps.setString(3, description);
        ps.setDouble(4, amount);
        ps.setString(5,"PENDING");

        ps.executeUpdate();
        ResultSet rs = ps.getGeneratedKeys();

        int invoiceId = 0;
        if (rs.next()) {
            invoiceId = rs.getInt(1);
        }

        conn.close();
        return invoiceId;
    }
    public List<String> findAllByTenant(int tenantId) throws SQLException{

        String sql = "SELECT * FROM invoices WHERE tenant_id = ?";

        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, tenantId);
        ResultSet rs = ps.executeQuery();

        List<String> invoices = new ArrayList<>();
        while(rs.next())
        {
            int id = rs.getInt("id");
            int tenant_id = rs.getInt("tenant_id");
            int patient_id = rs.getInt("patient_id");
            String desc = rs.getString("description");
            double amount = rs.getDouble("amount");
            String status = rs.getString("status");


            String json =
                    "{\"id\":" + id +
                            ",\"tenantId\":" + tenant_id +
                            ",\"patientId\":" + patient_id +
                            ",\"description\":\"" + desc + "\"" +
                            ",\"amount\":" + amount +
                            ",\"status\":\"" + status + "\"" +
                            "}";
            invoices.add(json);
        }
        conn.close();
        return invoices;
    }

    public void updateRazorpayOrderId(int invoiceId, String orderId) throws SQLException {
        String sql = "UPDATE invoices SET razorpay_order_id = ? WHERE id =?";

        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);

        ps.setString(1, orderId);
        ps.setInt(2, invoiceId);

        ps.executeUpdate();
        conn.close();
    }

    public double getAmountByIdAndTenant(int invoiceId, int tenantId) throws SQLException {

        String sql = "SELECT amount FROM invoices WHERE id = ? AND tenant_id =?";

        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);

        ps.setInt(1, invoiceId);
        ps.setInt(2, tenantId);

        ResultSet rs =ps.executeQuery();

        double amount = -1;
        if(rs.next()) {
            amount = rs.getDouble("amount");
        }
        conn.close();
        return amount;
    }
}