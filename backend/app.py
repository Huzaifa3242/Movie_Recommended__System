from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd

# Load movies
movies = pickle.load(open('model.pkl', 'rb'))

if isinstance(movies, dict):
    movies = pd.DataFrame(movies)

similarity = pickle.load(open('similarity.pkl', 'rb'))

app = Flask(__name__)
CORS(app)

# Movie recommender function with IDs
def recommend(movie):
    movie = movie.lower()
    movie_list = list(movies['title'].str.lower())
    
    if movie not in movie_list:
        return [{"title": "Wrong movie name", "movie_id": None}]

    idx = movie_list.index(movie)
    distances = similarity[idx]
    movie_indexes = sorted(
        list(enumerate(distances)), key=lambda x: x[1], reverse=True
    )[1:9]

    recommended = [
        {
            "title": movies.iloc[i[0]].title,
            "id": int(movies.iloc[i[0]].movie_id)  # or 'movie_id' if your column is named that
        }
        for i in movie_indexes
    ]

    return recommended

#Route
@app.route('/recommend', methods=['POST'])
def recommend_api():
    data = request.get_json()
    movie_name = data.get('movie')

    if not movie_name:
        return jsonify({'error': 'Movie name is missing'}), 400

    results = recommend(movie_name)
    return jsonify({'recommendations': results})

@app.route('/movies', methods=['GET'])
def get_movies():
    movie_titles = movies['title'].tolist()
    return jsonify(movie_titles)

if __name__ == '__main__':
    app.run(debug=True)
