import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/api';
import LangBadges from './LangBadges';
import { FiChevronLeft, FiChevronRight, FiPlay } from 'react-icons/fi';
import './HeroCarousel.css';

export default function HeroCarousel({ movies = [] }) {
  const [current, setCurrent] = useState(0);
  const items = movies.slice(0, 7);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, items.length]);

  if (items.length === 0) return null;

  const movie = items[current];
  const bg = getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div className="hero">
      <div className="hero__bg" style={{ backgroundImage: `url(${bg})` }} />
      <div className="hero__gradient" />
      <div className="hero__content container">
        <div className="hero__info">
          <div className="hero__badges">
            <LangBadges movie={movie} />
            {movie.year && <span className="badge badge-year">{movie.year}</span>}
          </div>
          <h1 className="hero__title">{movie.name}</h1>
          <p className="hero__origin">{movie.origin_name}</p>
          <div className="hero__meta">
            {movie.category?.map(c => (
              <Link key={c.slug} to={`/the-loai/${c.slug}`} className="hero__tag">{c.name}</Link>
            ))}
          </div>
          <div className="hero__actions">
            <Link to={`/phim/${movie.slug}`} className="hero__btn hero__btn--primary">
              <FiPlay /> Xem Ngay
            </Link>
            <Link to={`/phim/${movie.slug}`} className="hero__btn hero__btn--secondary">
              Chi Tiết
            </Link>
          </div>
        </div>
      </div>
      <div className="hero__controls">
        <button className="hero__arrow" onClick={prev}><FiChevronLeft /></button>
        <button className="hero__arrow" onClick={next}><FiChevronRight /></button>
      </div>
      <div className="hero__dots">
        {items.map((_, i) => (
          <button key={i} className={`hero__dot ${i === current ? 'hero__dot--active' : ''}`}
                  onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}
