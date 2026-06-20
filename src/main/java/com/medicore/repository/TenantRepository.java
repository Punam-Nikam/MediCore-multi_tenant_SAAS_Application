package com.medicore.repository;

import com.medicore.db.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class TenantRepository
{
    public int insertTenant(String name, String email, String phone, String city) throws SQLException{

        String sql = "INSERT INTO tenants(name,email,phone,city,plan) VALUES(?,?,?,?,?)";
        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS);

        ps.setString(1, name);
        ps.setString(2, email);
        ps.setString(3, phone);
        ps.setString(4, city);
        ps.setString(5, "FREE");

        ps.executeUpdate();

        ResultSet rs = ps.getGeneratedKeys();

        int tenantId = 0;
        if(rs.next()){
            tenantId = rs.getInt(1);
        }
        conn.close();

        return tenantId;
    }
}
