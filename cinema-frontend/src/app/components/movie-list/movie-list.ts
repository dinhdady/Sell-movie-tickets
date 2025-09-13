import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Movie } from '../../models/movie';
import { MovieService } from '../../services/movie';

@Component({
  selector: 'app-movie-list',
  imports: [RouterModule, CommonModule],
  templateUrl: './movie-list.html',
  styleUrls: ['./movie-list.scss']
})
export class MovieList implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  currentFilter: string = 'all';
  loading = false;

  constructor(private route: ActivatedRoute, private movieService: MovieService) {}

  ngOnInit() {
    this.loadMovies();
    this.route.queryParams.subscribe(params => {
      this.currentFilter = params['status'] || 'all';
      this.filterMovies();
    });
  }

  loadMovies() {
    this.loading = true;
    this.movieService.getAllMovies().subscribe({
      next: (response) => {
        // Nếu response có dạng {movies: Movie[]} thì lấy response.movies, nếu không thì lấy response
        this.movies = response.movies || response || [];
        this.filterMovies();
        this.loading = false;
      },
      error: (err) => {
        this.movies = [];
        this.loading = false;
      }
    });
  }

  filterMovies() {
    if (this.currentFilter === 'now-showing') {
      this.filteredMovies = this.movies.filter(movie => movie.status === 'NOW_SHOWING');
    } else if (this.currentFilter === 'coming-soon') {
      this.filteredMovies = this.movies.filter(movie => movie.status === 'COMING_SOON');
    } else {
      this.filteredMovies = this.movies;
    }
  }

  setFilter(filter: string) {
    this.currentFilter = filter;
    this.filterMovies();
  }
}
