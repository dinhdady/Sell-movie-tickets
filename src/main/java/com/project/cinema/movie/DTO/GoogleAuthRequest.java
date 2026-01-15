package com.project.cinema.movie.DTO;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {
    
    @NotBlank(message = "Google ID token is required")
    private String googleIdToken;
    
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String picture;
    private String birthday;
    private String phone;
    
    // Constructors
    public GoogleAuthRequest() {}
    
    public GoogleAuthRequest(String googleIdToken, String email, String name) {
        this.googleIdToken = googleIdToken;
        this.email = email;
        this.name = name;
    }
    
    // Getters and Setters
    public String getGoogleIdToken() {
        return googleIdToken;
    }
    
    public void setGoogleIdToken(String googleIdToken) {
        this.googleIdToken = googleIdToken;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPicture() {
        return picture;
    }
    
    public void setPicture(String picture) {
        this.picture = picture;
    }
    
    public String getBirthday() {
        return birthday;
    }
    
    public void setBirthday(String birthday) {
        this.birthday = birthday;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
}