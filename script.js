// To-Do
const BASE_URL = 'https://api.themoviedb.org/3';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYzM5MDA3ZTZkNWRiZjA2YzFkNjMzODRiNWM3NWRlOSIsIm5iZiI6MTc3MTg4MTUzOS42MDE5OTk4LCJzdWIiOiI2OTljYzQ0MzY0YmQ3N2QzMWU2YTQ1MDUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.IvkmO6xx1Sazctr1sdj8XyP7qlocBQqT55uCHUm5yFY'
  }
};

fetch('https://api.themoviedb.org/3/authentication', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));

const sortButton = document.querySelector('.sort-btn');
const dropdownContent = document.querySelector('.dropdown-content');

const sortMap = {
    'Release Date (Asc)': 'primary_release_date.asc',
    'Release Date (Desc)': 'primary_release_date.desc',
    'Rating (Asc)': 'vote_average.asc',
    'Rating (Desc)': 'vote_average.desc',
}

let currentPage = 1;
let currentQuery = '';
let currentSort = 'popularity.desc';

sortButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownContent.style.display = 
        dropdownContent.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.dropdown-content a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        sortButton.textContent = link.textContent;
        dropdownContent.style.display = 'none';
        currentSort = sortMap[link.textContent];
        currentPage = 1;
        fetchMovies(currentQuery, currentPage, currentSort);
    });
});

async function fetchMovies(query = '', page = 1, sort = currentSort) {
  const endpoint = query
    ? `${BASE_URL}/search/movie?query=${query}&page=${page}`
    : `${BASE_URL}/discover/movie?page=${page}&sort_by=${sort}`;

  const response = await fetch(endpoint, options);
  const data = await response.json();
  displayMovies(data.results);
  updatePagination(page, data.total_pages);
}

function displayMovies(movies) {
  let grid = document.querySelector('.movie-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.classList.add('movie-grid');
    document.body.appendChild(grid);
  }
  grid.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <p>${movie.title}</p>
      <p>Release Date: ${movie.release_date || 'N/A'}</p>
      <p>Rating: ${movie.vote_average && !isNaN(movie.vote_average) ? 
        Number(movie.vote_average).toFixed(1) : 'N/A'}</p>
    </div>
  `).join('');
}

function updatePagination(page, totalPages) {
  let pagination = document.querySelector('.pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.classList.add('pagination');
    document.body.appendChild(pagination);
  }
  pagination.innerHTML = `
    <button ${page <= 1 ? 'disabled' : ''} id="prev">Previous</button>
    <span>Page ${page} of ${totalPages}</span>
    <button ${page >= totalPages ? 'disabled' : ''} id="next">Next</button>
  `;

  document.querySelector('#prev').addEventListener('click', () => {
    currentPage--;
    fetchMovies(currentQuery, currentPage);
  });
  document.querySelector('#next').addEventListener('click', () => {
    currentPage++;
    fetchMovies(currentQuery, currentPage);
  });
}

document.querySelector('input').addEventListener('input', (e) => {
  currentQuery = e.target.value;
  currentPage = 1;
  fetchMovies(currentQuery, currentPage);
});

fetchMovies();