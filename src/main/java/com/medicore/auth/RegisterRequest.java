package com.medicore.auth;

public class RegisterRequest
{
    private String clinicName;
    private String email;
    private String password;
    private String phone;
    private String city;

    private String ownerName;

    public String getClinicName(){
        return clinicName;
    }
    public void setClinicName(String clinicName){
    this.clinicName=clinicName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }
}