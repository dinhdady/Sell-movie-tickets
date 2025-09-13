document.addEventListener("DOMContentLoaded", function() {
    fetchMovies();
});

function fetchMovies() {
    fetch("http://localhost:8080/api/movie")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            displayMovies(data.movies);
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error);
        });
}

function displayMovies(movies) {
    const movieContainer = document.getElementById("movie-list");
    movieContainer.innerHTML = ""; // Clear existing content

    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.className = "movie-card";
        movieElement.innerHTML = `
            <img src="${movie.posterUrl}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.description}</p>
        `;
        movieContainer.appendChild(movieElement);
    });
}
