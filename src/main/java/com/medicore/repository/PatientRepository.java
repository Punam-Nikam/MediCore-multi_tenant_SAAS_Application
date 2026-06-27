package com.medicore.repository;

import com.medicore.db.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PatientRepository {
    public int insertPatient(int tenantId, String name, int age, String gender, String phone, String bloodGroup, String complaint) throws SQLException {

        String sql = "INSERT INTO patients(tenant_id, full_name, age, gender, phone, blood_group, complaint) VALUES (?,?,?,?,?,?,?)";
        Connection conn = DBConnection.getConnection();

        PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
        ps.setInt(1, tenantId);
        ps.setString(2, name);
        ps.setInt(3, age);
        ps.setString(4, gender);
        ps.setString(5, phone);
        ps.setString(6, bloodGroup);
        ps.setString(7, complaint);

        ps.executeUpdate();

        ResultSet rs = ps.getGeneratedKeys();

        int patientId = 0;
        if(rs.next()) {
            patientId = rs.getInt(1);

        }
        conn.close();
        return patientId;

    }

    public List<String> findAllByTenant(int tenantId) throws SQLException{

        String sql = "SELECT * FROM patients WHERE tenant_id = ?";

        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, tenantId);
        ResultSet rs = ps.executeQuery();

        List<String> patients = new ArrayList<>();
        while(rs.next())
        {
            int id = rs.getInt("id");
            String name = rs.getString("full_name");
            int age = rs.getInt("age");
            String gender = rs.getString("gender");
            String phone = rs.getString("phone");
            String bloodGroup = rs.getString("blood_group");
            String complaint = rs.getString("complaint");

            String json = "{\"id\":" + id + ",\"name\":\"" + name + "\",\"age\":" + age + ",\"gender\":\"" + gender + "\",\"phone\":\"" + phone + "\",\"bloodGroup\":\"" + bloodGroup + "\",\"complaint\":\"" + complaint + "\"}";
            patients.add(json);
        }
        conn.close();
        return patients;
    }
    public boolean existsByIdAndTenant(int patientId, int tenantId) throws SQLException {

        String sql = "SELECT * FROM patients WHERE id = ? AND tenant_id = ?";

        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, patientId);
        ps.setInt(2, tenantId);

        ResultSet rs = ps.executeQuery();

        boolean exists = rs.next();

        conn.close();
        return exists;
    }

    public String findByIdAndTenant(int patientId, int tenantId) throws SQLException {

        String sql = "SELECT * FROM patients WHERE id = ? AND tenant_id = ?";

        Connection conn = DBConnection.getConnection();
        PreparedStatement ps = conn.prepareStatement(sql);
        ps.setInt(1, patientId);
        ps.setInt(2, tenantId);

        ResultSet rs = ps.executeQuery();

        String json = null;
        if (rs.next()) {
            int id = rs.getInt("id");
            String name = rs.getString("full_name");
            int age = rs.getInt("age");
            String gender = rs.getString("gender");
            String phone = rs.getString("phone");
            String bloodGroup = rs.getString("blood_group");
            String complaint = rs.getString("complaint");

            json = "{\"id\":" + id + ",\"name\":\"" + name + "\",\"age\":" + age + ",\"gender\":\"" + gender + "\",\"phone\":\"" + phone + "\",\"bloodGroup\":\"" + bloodGroup + "\",\"complaint\":\"" + complaint + "\"}";
        }

        conn.close();
        return json;
    }
}