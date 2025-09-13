package com.project.cinema.movie.Controllers;

import com.project.cinema.movie.Models.ResponseObject;
import com.project.cinema.movie.Models.Review;
import com.project.cinema.movie.Services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;
    @GetMapping
    public List<Review> getAllReviews(){return reviewService.getAllReviews();}
    @GetMapping("/{id}")
    public ResponseEntity<ResponseObject> getReviewById(@PathVariable Long id){
       Review review = reviewService.getReviewById(id);
       return review != null ? ResponseEntity.status(HttpStatus.FOUND).body(new ResponseObject("302","Found!",review))
               : ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseObject("404","Not found!",null));
    }
    @PostMapping
    public ResponseEntity<ResponseObject> createReview(@RequestBody Review review){
        Review created = reviewService.createReview(review);
        return created != null ? ResponseEntity.status(HttpStatus.CREATED).body(new ResponseObject("201","Created!",created))
                : ResponseEntity.status(HttpStatus.CONFLICT).body(new ResponseObject("409","Review existed!",null));
    }
    @DeleteMapping("/{id}")
    public void deleteReviewById(@PathVariable Long id){reviewService.deleteReview(id);}
    @PutMapping("/{id}")
    public ResponseEntity<ResponseObject> updateReviewById(@PathVariable Long id, @RequestBody Review review){
        Review updated = reviewService.updateReview(id,review);
        return ResponseEntity.status(HttpStatus.OK).body(new ResponseObject("200","Updated!",updated));
    }
}
