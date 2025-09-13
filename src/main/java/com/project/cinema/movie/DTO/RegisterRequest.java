package com.project.cinema.movie.DTO;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String usernameR;
    private String passwordR;
    private String emailR;
}
