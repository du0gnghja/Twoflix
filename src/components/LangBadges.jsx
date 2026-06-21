import { getLangTags } from '../utils/movieTags';

export default function LangBadges({ movie, lang, langKey }) {
  const tags = getLangTags(lang ?? movie?.lang, langKey ?? movie?.lang_key);
  if (tags.length === 0) return null;

  return tags.map(tag => (
    <span key={tag.key} className={`badge badge-${tag.key}`}>
      {tag.label}
    </span>
  ));
}
