package com.medicore.repository;

import com.medicore.db.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UserRepository
{
    public void insertUser(int tenantId, String name, String email, String password, String role, String specialization) throws SQLException{

        String sql = "INSERT INTO users(tenant_id, full_name, email, password, role, specialization) VALUES (?,?,?,?,?,?)";

        Connection conn  = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);

        ps.setInt(1, tenantId);
        ps.setString(2, name);
        ps.setString(3, email);
        ps.setString(4, password);
        ps.setString(5, role);
        ps.setString(6, specialization);

        ps.executeUpdate();

        conn.close();
    }
}
