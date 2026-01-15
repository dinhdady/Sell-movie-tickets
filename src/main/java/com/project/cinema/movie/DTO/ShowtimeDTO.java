package com.project.cinema.movie.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ShowtimeDTO {
    private Long roomId;
    private Long movieId;
    private Date startTime;
    private Date endTime;
    private RoomDTO room;  // thông tin phòng chiếu
}
