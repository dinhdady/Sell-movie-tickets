package com.project.cinema.movie.Models;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ResponseObject {
    private String state;
    private String message;
    private Object object;

}

