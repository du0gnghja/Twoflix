import { SOURCES, DEFAULT_SOURCE, STORAGE_KEY } from '../config/sources';

let activeSource = DEFAULT_SOURCE;

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SOURCES[saved]) activeSource = saved;
} catch {
  // ignore
}

export function getActiveSource() {
  return activeSource;
}

export function setActiveSource(source) {
  if (!SOURCES[source]) return;
  activeSource = source;
  try {
    localStorage.setItem(STORAGE_KEY, source);
  } catch {
    // ignore
  }
}

function getBase() {
  return `/api/${activeSource}`;
}

function getImgCdn() {
  return SOURCES[activeSource].imgCdn;
}

function buildFilterParams(page, filters = {}) {
  const params = new URLSearchParams({ page: String(page) });
  if (filters.country) params.set('country', filters.country);
  if (filters.year) params.set('year', filters.year);
  if (filters.type) params.set('type', filters.type);
  if (filters.sort && filters.sort !== '_id') params.set('sort_field', filters.sort);
  return params;
}

async function enrichMovieLang(items, sourceId) {
  const needs = items.filter(item => !item.lang && !item.lang_key?.length);
  if (!needs.length) return items;

  const updates = await Promise.all(
    needs.map(async item => {
      try {
        const res = await fetch(`/api/${sourceId}/phim/${item.slug}`);
        const data = await res.json();
        const movie = data.movie || data.data?.item;
        if (!movie) return null;
        return { slug: item.slug, lang: movie.lang, lang_key: movie.lang_key };
      } catch {
        return null;
      }
    })
  );

  const langMap = new Map(updates.filter(Boolean).map(u => [u.slug, u]));
  return items.map(item => {
    const extra = langMap.get(item.slug);
    return extra ? { ...item, lang: extra.lang, lang_key: extra.lang_key } : item;
  });
}

async function normalizeListResponse(data, sourceId, type) {
  let normalized = data;
  if (data.items && !data.data) {
    normalized = {
      data: {
        items: data.items,
        pagination: data.pagination,
        params: { pagination: data.pagination },
      },
    };
  }

  const items = normalized.data?.items;
  if (items?.length && sourceId === 'kkphim' && type === 'phim-moi-cap-nhat') {
    normalized.data.items = await enrichMovieLang(items, sourceId);
  }

  return normalized;
}

function normalizeMetaResponse(data) {
  if (Array.isArray(data)) return { data: { items: data } };
  return data;
}

export function getImageUrl(filename) {
  if (!filename) return 'https://placehold.co/300x450/1a1a2e/ffffff?text=No+Image';
  if (filename.startsWith('http')) return filename;
  return `${getImgCdn()}${filename}`;
}

export async function fetchNewMovies(page = 1) {
  const path = activeSource === 'kkphim'
    ? `/danh-sach/phim-moi-cap-nhat?page=${page}`
    : `/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`;
  const res = await fetch(`${getBase()}${path}`);
  return normalizeListResponse(await res.json(), activeSource, 'phim-moi-cap-nhat');
}

export async function fetchMoviesByType(type, page = 1) {
  const path = type === 'phim-moi-cap-nhat' && activeSource === 'kkphim'
    ? `/danh-sach/phim-moi-cap-nhat?page=${page}`
    : `/v1/api/danh-sach/${type}?page=${page}`;
  const res = await fetch(`${getBase()}${path}`);
  return normalizeListResponse(await res.json(), activeSource, type);
}

export async function fetchMovieDetail(slug) {
  const res = await fetch(`${getBase()}/phim/${slug}`);
  return res.json();
}

export async function fetchMovieDetailFromSource(slug, sourceId) {
  if (!SOURCES[sourceId]) return null;
  try {
    const res = await fetch(`/api/${sourceId}/phim/${slug}`);
    return res.json();
  } catch {
    return null;
  }
}

export async function searchMovies(keyword, page = 1) {
  const res = await fetch(
    `${getBase()}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`
  );
  return res.json();
}

export async function fetchGenres() {
  const path = activeSource === 'kkphim' ? '/the-loai' : '/v1/api/the-loai';
  const res = await fetch(`${getBase()}${path}`);
  return normalizeMetaResponse(await res.json());
}

export async function fetchCountries() {
  const path = activeSource === 'kkphim' ? '/quoc-gia' : '/v1/api/quoc-gia';
  const res = await fetch(`${getBase()}${path}`);
  return normalizeMetaResponse(await res.json());
}

export async function fetchByCategory(type, slug, page = 1, filters = {}) {
  const params = buildFilterParams(page, filters);
  const res = await fetch(`${getBase()}/v1/api/${type}/${slug}?${params.toString()}`);
  return res.json();
}

export async function fetchMoviesByTypeWithFilters(type, page = 1, filters = {}) {
  const params = buildFilterParams(page, filters);
  const path = type === 'phim-moi-cap-nhat' && activeSource === 'kkphim'
    ? `/danh-sach/phim-moi-cap-nhat?${params.toString()}`
    : `/v1/api/danh-sach/${type}?${params.toString()}`;
  const res = await fetch(`${getBase()}${path}`);
  return normalizeListResponse(await res.json(), activeSource, type);
}
