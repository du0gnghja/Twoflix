import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import LangBadges from './LangBadges';
import { formatEpisodeBadge } from '../utils/movieTags';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  const thumb = getImageUrl(movie.thumb_url || movie.poster_url);
  
  return (
    <Link to={`/phim/${movie.slug}`} className="movie-card">
      <div className="movie-card__poster">
        <img src={thumb} alt={movie.name} loading="lazy" />
        <div className="movie-card__overlay">
          <div className="movie-card__play">▶</div>
        </div>
        <div className="movie-card__badges">
          <LangBadges movie={movie} />
        </div>
        {movie.episode_current && (
          <span className="movie-card__episode badge badge-episode">
            {formatEpisodeBadge(movie.episode_current)}
          </span>
        )}
      </div>
      <div className="movie-card__info">
        <h3 className="movie-card__title">{movie.name}</h3>
        <p className="movie-card__origin">{movie.origin_name} {movie.year ? `(${movie.year})` : ''}</p>
      </div>
    </Link>
  );
}
