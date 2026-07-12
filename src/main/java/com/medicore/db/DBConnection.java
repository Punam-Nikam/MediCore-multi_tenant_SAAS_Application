package com.medicore.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection
{
    private static final String DB_URL = "jdbc:mysql://localhost:3306/medicore_db";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "your_password";
    private static final String DRIVER = "com.mysql.cj.jdbc.Driver";

//    Returns a fresh connection to MySQL database
    public static Connection getConnection() throws SQLException {

        try {
            //load the driver class in memory , without this java doesnt know mysql exists
            Class.forName(DRIVER);

        } catch (ClassNotFoundException e)
        {
            //exception if driver jav not found in pom.xml
            throw new SQLException("MYSQL driver not found : "+e.getMessage());
        }
        //create and return connection,uses url,username,password to connect
        return DriverManager.getConnection(DB_URL,DB_USER,DB_PASS);
    }
}
