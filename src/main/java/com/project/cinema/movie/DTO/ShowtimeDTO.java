package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@AllArgsConstructor
public class ShowtimeDTO {
    private Long roomId;
    private Long movieId;
    private Date startTime;
    private Date endTime;
}
