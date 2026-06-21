import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchMovieDetail,
  fetchMovieDetailFromSource,
  fetchMoviesByType,
  getImageUrl,
} from '../services/api';
import { useSource } from '../context/SourceContext';
import { SOURCES } from '../config/sources';
import MovieCard from '../components/MovieCard';
import LangBadges from '../components/LangBadges';
import { buildBroadcastServers } from '../utils/movieTags';
import { FiPlay, FiCalendar, FiClock, FiGlobe, FiStar, FiRotateCw } from 'react-icons/fi';
import './MovieDetailPage.css';

export default function MovieDetailPage() {
  const { source } = useSource();
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [sourceEpisodes, setSourceEpisodes] = useState({ ophim: [], kkphim: [] });
  const [activeBroadcastKey, setActiveBroadcastKey] = useState(null);
  const [activeEp, setActiveEp] = useState(null);
  const [lightsOff, setLightsOff] = useState(false);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const playerRef = useRef(null);

  const exitLandscape = useCallback(async () => {
    setIsLandscape(false);
    document.body.classList.remove('player-landscape-active');
    try { screen.orientation?.unlock?.(); } catch { /* ignore */ }
    if (document.fullscreenElement) {
      try { await document.exitFullscreen(); } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && isLandscape) {
        setIsLandscape(false);
        document.body.classList.remove('player-landscape-active');
        try { screen.orientation?.unlock?.(); } catch { /* ignore */ }
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [isLandscape]);

  useEffect(() => () => { exitLandscape(); }, [exitLandscape]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setActiveEp(null);
    setActiveBroadcastKey(null);

    async function load() {
      try {
        const [detailRes, ophimRes, kkphimRes] = await Promise.all([
          fetchMovieDetail(slug),
          fetchMovieDetailFromSource(slug, 'ophim'),
          fetchMovieDetailFromSource(slug, 'kkphim'),
        ]);

        const data = detailRes?.movie || detailRes?.data?.item || detailRes;
        setMovie(data);

        const epsMap = {
          ophim: ophimRes?.episodes || [],
          kkphim: kkphimRes?.episodes || [],
        };
        setSourceEpisodes(epsMap);

        const broadcasts = buildBroadcastServers(epsMap, SOURCES);
        const preferred = broadcasts.find(b => b.sourceId === source) || broadcasts[0];
        if (preferred) {
          setActiveBroadcastKey(preferred.key);
          setActiveEp(preferred.episodes[0]);
        }

        const type = data.type === 'single' ? 'phim-le' : 'phim-bo';
        const relRes = await fetchMoviesByType(type);
        const relItems = relRes.data?.items || relRes.items || [];
        setRelated(relItems.filter(m => m.slug !== slug).slice(0, 12));
      } catch (err) {
        console.error('Error loading movie:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, source]);

  if (loading) {
    return <div className="page-content"><div className="loading-container"><div className="loading-spinner" /></div></div>;
  }

  if (!movie) {
    return <div className="page-content"><div className="container"><p>Không tìm thấy phim.</p></div></div>;
  }

  const poster = getImageUrl(movie.poster_url);
  const thumb = getImageUrl(movie.thumb_url);
  const broadcastServers = buildBroadcastServers(sourceEpisodes, SOURCES);
  const activeBroadcast = broadcastServers.find(b => b.key === activeBroadcastKey);
  const currentServerEps = activeBroadcast?.episodes || [];

  const handleBroadcastSelect = (broadcast) => {
    setActiveBroadcastKey(broadcast.key);
    setActiveEp(broadcast.episodes[0] || null);
  };

  const toggleLandscape = async () => {
    if (isLandscape) {
      await exitLandscape();
      return;
    }

    setIsLandscape(true);
    document.body.classList.add('player-landscape-active');

    const el = playerRef.current;
    if (el) {
      try {
        await el.requestFullscreen?.();
      } catch {
        try { await el.webkitRequestFullscreen?.(); } catch { /* CSS fallback */ }
      }
    }

    try {
      await screen.orientation?.lock?.('landscape');
    } catch { /* iOS / unsupported — CSS fallback handles layout */ }
  };

  return (
    <div className={`movie-detail ${lightsOff ? 'lights-off' : ''}`}>
      <div className="detail-backdrop" style={{ backgroundImage: `url(${poster})` }} />
      <div className="detail-backdrop-gradient" />

      <div className="page-content">
        <div className="container">
          {activeEp?.link_embed && (
            <div
              ref={playerRef}
              className={`player-section ${isLandscape ? 'player-section--landscape' : ''}`}
            >
              <div className="player-wrapper">
                <iframe src={activeEp.link_embed} allowFullScreen frameBorder="0"
                        title={movie.name} allow="autoplay; encrypted-media" />
                {isMobile && (
                  <button
                    type="button"
                    className="rotate-btn"
                    onClick={toggleLandscape}
                    aria-label={isLandscape ? 'Thoát xoay màn hình' : 'Xoay màn hình ngang'}
                  >
                    <FiRotateCw />
                  </button>
                )}
              </div>
              <div className="player-controls">
                <div className="player-controls__left">
                  <button className={`lights-btn ${lightsOff ? 'lights-btn--on' : ''}`}
                          onClick={() => setLightsOff(!lightsOff)}>
                    {lightsOff ? '💡 Bật đèn' : '🌙 Tắt đèn'}
                  </button>
                  {isMobile && (
                    <button
                      type="button"
                      className={`rotate-btn rotate-btn--bar ${isLandscape ? 'rotate-btn--active' : ''}`}
                      onClick={toggleLandscape}
                    >
                      <FiRotateCw /> {isLandscape ? 'Thoát xoay' : 'Xoay ngang'}
                    </button>
                  )}
                </div>
                {activeEp && activeBroadcast && (
                  <span className="current-ep-label">
                    {activeBroadcast.label} — {activeEp.name === 'Full' ? 'Full' : `Tập ${activeEp.name}`}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="detail-content">
            <div className="detail-poster-col">
              <img src={thumb} alt={movie.name} className="detail-poster" />
            </div>
            <div className="detail-info-col">
              <h1 className="detail-title">{movie.name}</h1>
              <p className="detail-origin">{movie.origin_name}</p>
              <div className="detail-badges">
                <LangBadges movie={movie} />
                {movie.episode_current && <span className="badge badge-episode">{movie.episode_current}</span>}
              </div>
              <div className="detail-meta">
                {movie.year && <span><FiCalendar /> {movie.year}</span>}
                {movie.time && <span><FiClock /> {movie.time}</span>}
                {movie.tmdb?.vote_average > 0 && (
                  <span className="detail-rating"><FiStar /> {movie.tmdb.vote_average.toFixed(1)}</span>
                )}
              </div>
              <div className="detail-tags">
                {movie.category?.map(c => (
                  <Link key={c.slug} to={`/the-loai/${c.slug}`} className="detail-tag">{c.name}</Link>
                ))}
                {movie.country?.map(c => (
                  <Link key={c.slug} to={`/quoc-gia/${c.slug}`} className="detail-tag detail-tag--country">
                    <FiGlobe /> {c.name}
                  </Link>
                ))}
              </div>
              <div className="detail-desc">
                <h3>Nội dung phim</h3>
                <p>{movie.content || 'Đang cập nhật...'}</p>
              </div>
              {!activeEp?.link_embed && currentServerEps.length > 0 && (
                <button className="hero__btn hero__btn--primary"
                        onClick={() => setActiveEp(currentServerEps[0])}>
                  <FiPlay /> Xem Phim
                </button>
              )}
            </div>
          </div>

          {broadcastServers.length > 0 && (
            <div className="episodes-section">
              <h3 className="section-title">Bản chiếu</h3>

              <div className="broadcast-tabs">
                {broadcastServers.map(broadcast => (
                  <button
                    key={broadcast.key}
                    type="button"
                    className={`broadcast-tab ${activeBroadcastKey === broadcast.key ? 'broadcast-tab--active' : ''}`}
                    onClick={() => handleBroadcastSelect(broadcast)}
                  >
                    {broadcast.label}
                  </button>
                ))}
              </div>

              <h4 className="episodes-subtitle">Danh sách tập</h4>
              <div className="episode-grid">
                {currentServerEps.map((ep, idx) => (
                  <button
                    key={`${activeBroadcastKey}-${idx}`}
                    type="button"
                    className={`episode-btn ${activeEp?.slug === ep.slug && activeEp?.name === ep.name && activeEp?.link_embed === ep.link_embed ? 'episode-btn--active' : ''}`}
                    onClick={() => { setActiveEp(ep); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    {ep.name === 'Full' ? 'Full' : ep.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {related.length > 0 && (
            <div className="section">
              <h3 className="section-title">Phim Đề Cử</h3>
              <div className="movie-grid">
                {related.map(m => <MovieCard key={m._id || m.slug} movie={m} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
