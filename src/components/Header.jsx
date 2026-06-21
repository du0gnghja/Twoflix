import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { fetchGenres, fetchCountries } from '../services/api';
import './Header.css';

const NAV_ITEMS = [
  { label: 'Phim Mới', path: '/danh-sach/phim-moi-cap-nhat' },
  { label: 'Phim Bộ', path: '/danh-sach/phim-bo' },
  { label: 'Phim Lẻ', path: '/danh-sach/phim-le' },
  { label: 'Hoạt Hình', path: '/danh-sach/hoat-hinh' },
  { label: 'TV Shows', path: '/danh-sach/tv-shows' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    fetchGenres().then(r => { if (r.data?.items) setGenres(r.data.items); });
    fetchCountries().then(r => { if (r.data?.items) setCountries(r.data.items); });
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="header__inner container">
        <Link to="/" className="header__logo">
  <img
    src="/logo.png"
    alt="DNFlix Logo"
    className="header__logo-image"
  />
</Link>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <FiX />
          </button>
          <ul className="nav-list">
            {NAV_ITEMS.map(item => (
              <li key={item.path} className="nav-item">
                <Link to={item.path} onClick={() => setMobileOpen(false)}>{item.label}</Link>
              </li>
            ))}
            <li className="nav-item nav-item--dropdown"
                onMouseEnter={() => setDropdownOpen('genre')}
                onMouseLeave={() => setDropdownOpen(null)}>
              <span className="nav-dropdown-trigger">
                Thể Loại <FiChevronDown />
              </span>
              {dropdownOpen === 'genre' && (
                <div className="dropdown-menu">
                  {genres.map(g => (
                    <Link key={g.slug} to={`/the-loai/${g.slug}`}
                          onClick={() => { setDropdownOpen(null); setMobileOpen(false); }}>
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
            <li className="nav-item nav-item--dropdown"
                onMouseEnter={() => setDropdownOpen('country')}
                onMouseLeave={() => setDropdownOpen(null)}>
              <span className="nav-dropdown-trigger">
                Quốc Gia <FiChevronDown />
              </span>
              {dropdownOpen === 'country' && (
                <div className="dropdown-menu">
                  {countries.map(c => (
                    <Link key={c.slug} to={`/quoc-gia/${c.slug}`}
                          onClick={() => { setDropdownOpen(null); setMobileOpen(false); }}>
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </nav>

        <div className="header__actions">
          <form className={`search-form ${searchOpen ? 'search-form--open' : ''}`} onSubmit={handleSearch}>
            <input ref={searchRef} type="text" placeholder="Tìm phim..."
                   value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button type="button" className="search-toggle" onClick={() => setSearchOpen(!searchOpen)}>
              <FiSearch />
            </button>
          </form>
          <button className="mobile-toggle" onClick={() => setMobileOpen(true)}>
            <FiMenu />
          </button>
        </div>
      </div>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
    </header>
  );
}
