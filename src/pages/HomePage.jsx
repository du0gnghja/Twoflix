import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMoviesByType } from '../services/api';
import { useSource } from '../context/SourceContext';
import HeroCarousel from '../components/HeroCarousel';
import MovieCard from '../components/MovieCard';
import { FiChevronRight } from 'react-icons/fi';

const SECTIONS = [
  { title: 'Phim Mới Cập Nhật', type: 'phim-moi-cap-nhat', path: '/danh-sach/phim-moi-cap-nhat' },
  { title: 'Phim Bộ Hot', type: 'phim-bo', path: '/danh-sach/phim-bo' },
  { title: 'Phim Lẻ Mới', type: 'phim-le', path: '/danh-sach/phim-le' },
  { title: 'Hoạt Hình', type: 'hoat-hinh', path: '/danh-sach/hoat-hinh' },
];

export default function HomePage() {
  const { source } = useSource();
  const [heroMovies, setHeroMovies] = useState([]);
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    async function load() {
      try {
        const results = await Promise.all(
          SECTIONS.map(s => fetchMoviesByType(s.type))
        );
        const newSections = {};
        results.forEach((res, i) => {
          const items = res.data?.items || res.items || [];
          newSections[SECTIONS[i].type] = items;
        });
        setSections(newSections);
        // Use first section for hero
        const heroItems = newSections['phim-moi-cap-nhat'] || [];
        setHeroMovies(heroItems.slice(0, 7));
      } catch (err) {
        console.error('Error loading homepage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [source]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-container"><div className="loading-spinner" /></div>
      </div>
    );
  }

  return (
    <div>
      <HeroCarousel movies={heroMovies} />
      <div className="container">
        {SECTIONS.map(section => {
          const items = sections[section.type] || [];
          if (items.length === 0) return null;
          return (
            <div key={section.type} className="section">
              <div className="section-header">
                <h2 className="section-title">{section.title}</h2>
                <Link to={section.path} className="section-link">
                  Xem tất cả <FiChevronRight />
                </Link>
              </div>
              <div className="movie-grid">
                {items.map(movie => (
                  <MovieCard key={movie._id || movie.slug} movie={movie} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
