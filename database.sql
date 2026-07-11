-- Multi -tenant SAAS application database


CREATE DATABASE IF NOT EXISTS medicore_db;
USE medicore_db;

CREATE TABLE tenants (
                         id          INT AUTO_INCREMENT PRIMARY KEY,
                         name        VARCHAR(255) NOT NULL,
                         email       VARCHAR(255) NOT NULL UNIQUE,
                         phone       VARCHAR(15)  NOT NULL,
                         city        VARCHAR(100) NOT NULL,
                         plan        VARCHAR(10)  NOT NULL DEFAULT 'FREE',
                         created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
                       id              INT AUTO_INCREMENT PRIMARY KEY,
                       tenant_id       INT          NOT NULL,
                       full_name       VARCHAR(255) NOT NULL,
                       email           VARCHAR(255) NOT NULL,
                       password        VARCHAR(255) NOT NULL,
                       role            VARCHAR(20)  NOT NULL DEFAULT 'DOCTOR',
                       specialization  VARCHAR(100),
                       created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE patients (
                          id          INT AUTO_INCREMENT PRIMARY KEY,
                          tenant_id   INT          NOT NULL,
                          full_name   VARCHAR(255) NOT NULL,
                          age         INT          NOT NULL,
                          gender      VARCHAR(10)  NOT NULL,
                          phone       VARCHAR(15)  NOT NULL,
                          blood_group VARCHAR(5),
                          complaint   VARCHAR(500),
                          created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE invoices (
                          id                  INT AUTO_INCREMENT PRIMARY KEY,
                          tenant_id           INT            NOT NULL,
                          patient_id          INT            NOT NULL,
                          description         VARCHAR(500)   NOT NULL,
                          amount              DECIMAL(10,2)  NOT NULL,
                          status              VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
                          razorpay_order_id   VARCHAR(100),
                          created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
                          paid_at             DATETIME,
                          FOREIGN KEY (tenant_id)  REFERENCES tenants(id),
                          FOREIGN KEY (patient_id) REFERENCES patients(id)
);

DESCRIBE tenants;
DESCRIBE users;
DESCRIBE patients;
DESCRIBE invoices;

USE medicore_db;

select *from users;
select *from tenants;

select *from invoices;
select * from patients;

ALTER TABLE invoices ADD COLUMN payment_method VARCHAR(20) DEFAULT NULL;
