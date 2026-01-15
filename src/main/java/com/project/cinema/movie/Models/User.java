package com.project.cinema.movie.Models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class User implements UserDetails {
    @Id
    private String id = UUID.randomUUID().toString().substring(0, 8);

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    private String phoneNumber;

    private String address;

    @Column(name = "birthday")
    private LocalDateTime birthday;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime registrationDate;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY,orphanRemoval = true)
    @JsonIgnore
    private List<Order> orders = new ArrayList<>();

    @Enumerated(value = EnumType.STRING)
    private Role role;

    @Column(name = "is_active")
    private Boolean isActive = Boolean.TRUE;

    @Column(name = "is_email_verified")
    private Boolean isEmailVerified = Boolean.FALSE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public User(String username, String password, String email) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.isActive = Boolean.TRUE;
        this.isEmailVerified = Boolean.FALSE;
        this.createdAt = LocalDateTime.now();
    }

    public User(String id, String username, String passwordHash, String fullName, String email, String phoneNumber, LocalDateTime registrationDate, Role role) {
        this.id = id;
        this.username = username;
        this.password = passwordHash;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.registrationDate = registrationDate;
        this.role = role;
        this.isActive = Boolean.TRUE;
        this.isEmailVerified = Boolean.FALSE;
        this.createdAt = LocalDateTime.now();
    }

    public User(String id, String username, String passwordHash, String fullName, String email, String phoneNumber, LocalDateTime birthday, LocalDateTime registrationDate, Role role) {
        this.id = id;
        this.username = username;
        this.password = passwordHash;
        this.fullName = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.birthday = birthday;
        this.registrationDate = registrationDate;
        this.role = role;
        this.isActive = Boolean.TRUE;
        this.isEmailVerified = Boolean.FALSE;
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return role.getAuthorities();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive != null ? isActive : true;
    }

    // Getter and setter for isActive
    public Boolean isActive() {
        return isActive;
    }

    public void setActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // Getter and setter for isEmailVerified
    public Boolean isEmailVerified() {
        return isEmailVerified;
    }

    public void setEmailVerified(Boolean isEmailVerified) {
        this.isEmailVerified = isEmailVerified;
    }

    // Getter and setter for createdAt
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}

