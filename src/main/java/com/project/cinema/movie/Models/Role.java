package com.project.cinema.movie.Models;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Set;

public enum Role {
    USER(Set.of(new SimpleGrantedAuthority("ROLE_USER"))),
    ADMIN(Set.of(new SimpleGrantedAuthority("ROLE_ADMIN"))),
    STAFF(Set.of(new SimpleGrantedAuthority("ROLE_STAFF")));
    private final Set<GrantedAuthority> authorities;

    Role(Set<GrantedAuthority> authorities) {
        this.authorities = authorities;
    }

    public Set<GrantedAuthority> getAuthorities() {
        return authorities;
    }
}