import { useState, useEffect, useRef } from 'react';
import './App.css';

const BASE_URL = 'https://api.themoviedb.org/3';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYzM5MDA3ZTZkNWRiZjA2YzFkNjMzODRiNWM3NWRlOSIsIm5iZiI6MTc3MTg4MTUzOS42MDE5OTk4LCJzdWIiOiI2OTljYzQ0MzY0YmQ3N2QzMWU2YTQ1MDUiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.IvkmO6xx1Sazctr1sdj8XyP7qlocBQqT55uCHUm5yFY'
  }
};

const sortMap = {
  'Release Date (Asc)': 'primary_release_date.asc',
  'Release Date (Desc)': 'primary_release_date.desc',
  'Rating (Asc)': 'vote_average.asc',
  'Rating (Desc)': 'vote_average.desc',
};

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentSort, setCurrentSort] = useState('popularity.desc');
  const [sortLabel, setSortLabel] = useState('Sort By');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchMovies(query, currentPage, currentSort);
  }, [query, currentPage, currentSort]);

  async function fetchMovies(q, page, sort) {
    const endpoint = q
      ? `${BASE_URL}/search/movie?query=${q}&page=${page}`
      : `${BASE_URL}/discover/movie?page=${page}&sort_by=${sort}`;
    const response = await fetch(endpoint, options);
    const data = await response.json();
    setMovies(data.results || []);
    setTotalPages(data.total_pages || 1);
  }

  function handleSortSelect(label) {
    setSortLabel(label);
    setCurrentSort(sortMap[label]);
    setCurrentPage(1);
    setDropdownOpen(false);
  }

  function handleSearchInput(e) {
    setQuery(e.target.value);
    setCurrentPage(1);
  }

  return (
    <div>
      <div className="fixed-header">
        <h1>Movie Explorer</h1>
      </div>

      <div className="search">
        <label>
          <input
            type="text"
            placeholder="Enter movie here..."
            value={query}
            onChange={handleSearchInput}
          />
        </label>

        <div className="dropdown" ref={dropdownRef}>
          <button
            className="sort-btn"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen((prev) => !prev);
            }}
          >
            {sortLabel}
          </button>
          {dropdownOpen && (
            <div className="dropdown-content" style={{ display: 'block' }}>
              {Object.keys(sortMap).map((label) => (
                <a
                  key={label}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSortSelect(label);
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="movie-grid">
        {movies.map((movie) => (
          <div className="movie-card" key={movie.id}>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
            />
            <p>{movie.title}</p>
            <p>Release Date: {movie.release_date || 'N/A'}</p>
            <p>
              Rating:{' '}
              {movie.vote_average && !isNaN(movie.vote_average)
                ? Number(movie.vote_average).toFixed(1)
                : 'N/A'}
            </p>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          disabled={currentPage <= 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}