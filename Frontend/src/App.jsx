import { useState, useEffect } from 'react';

function App() {
  const [movieName, setMovieName] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false); 

  // Fetch all movies from Flask API on component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/movies");
        const movies = await response.json();
        setAllMovies(movies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };
    fetchMovies();
  }, []);

  const handleInputChange = (e) => {
    setMovieName(e.target.value);
  };

  const handleSearch = async () => {
    if (!movieName) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movie: movieName }),
      });

      const data = await res.json();

      if (res.ok && data.recommendations) {
        // Fetch posters for each movie 
        const postersWithTitles = await Promise.all(
          data.recommendations.map(async (movie) => {
            try {
              const movieRes = await fetch(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en-US`
              );
              const movieData = await movieRes.json();
              return {
                title: movie.title,
                poster: `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
              };
            } catch {
              return {
                title: movie.title,
                poster: 'https://via.placeholder.com/500x750?text=No+Image',
              };
            }
          })
        );

        setRecommendations(postersWithTitles);
        setShowRecommendations(true); 
      } else {
        console.error('Error fetching recommendations:', data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 text-gray-800 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mt-6 text-blue-700">🎬 Movie Recommender</h1>

      <p className="text-lg text-blue-500 mb-8 italic mt-8">
        "Discover movies you'll love — one click away"
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
        <div className="relative">
          <input 
            type="text" 
            value={movieName}
            onChange={handleInputChange}
            placeholder="Type a movie name..."
            className="px-4 py-2 w-72 rounded-md border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            list="movie-list"
          />
          <datalist id="movie-list">
            {allMovies
              .filter((movie) =>
                movie.toLowerCase().includes(movieName.toLowerCase())
              )
              .map((movie, index) => (
                <option key={index} value={movie} />
              ))}
          </datalist>
        </div>
        <button 
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-md text-white transition-all duration-200"
        >
          Recommend
        </button>
      </div>

      {showRecommendations && (
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Recommended Movies:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {recommendations.map((movie, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
              >
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  className="w-full h-90 object-cover rounded-t-lg"
                />
                <div className="p-2 text-center font-medium text-purple-800">
                  {movie.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
