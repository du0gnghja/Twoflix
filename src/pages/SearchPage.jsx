import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { useSource } from '../context/SourceContext';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';

export default function SearchPage() {
  const { source } = useSource();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!keyword) return;
    setLoading(true);

    searchMovies(keyword, currentPage)
      .then(res => {
        const data = res.data || res;
        setMovies(data.items || []);
        setTotalPages(data.params?.pagination?.totalPages || 1);
      })
      .catch(err => console.error('Search error:', err))
      .finally(() => setLoading(false));
  }, [keyword, currentPage, source]);

  const handlePageChange = (page) => {
    setSearchParams({ keyword, page: String(page) });
  };

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="page-title">
          {keyword ? `Kết quả tìm kiếm: "${keyword}"` : 'Tìm kiếm phim'}
        </h1>
        {loading ? (
          <div className="loading-container"><div className="loading-spinner" /></div>
        ) : !keyword ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
            Nhập từ khóa để tìm kiếm phim.
          </p>
        ) : movies.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
            Không tìm thấy phim nào cho "{keyword}".
          </p>
        ) : (
          <>
            <div className="movie-grid">
              {movies.map(movie => (
                <MovieCard key={movie._id || movie.slug} movie={movie} />
              ))}
            </div>
            <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}
