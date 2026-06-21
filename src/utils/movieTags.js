const LANG_KEY_MAP = {
  vs: 'vietsub',
  vietsub: 'vietsub',
  sub: 'vietsub',
  tm: 'thuyetminh',
  thuyetminh: 'thuyetminh',
  'thuyet-minh': 'thuyetminh',
  lt: 'thuyetminh',
  'long-tieng': 'thuyetminh',
};

const TAG_LABELS = {
  vietsub: 'Vietsub',
  thuyetminh: 'Thuyết minh',
};

function addTag(tags, key) {
  if (!TAG_LABELS[key] || tags.some(t => t.key === key)) return;
  tags.push({ key, label: TAG_LABELS[key] });
}

function parseLangKeys(langKey) {
  if (!langKey) return [];
  const keys = Array.isArray(langKey) ? langKey : [langKey];
  return keys.map(k => String(k).toLowerCase().trim());
}

export function getLangTags(lang, langKey) {
  const tags = [];

  for (const key of parseLangKeys(langKey)) {
    addTag(tags, LANG_KEY_MAP[key]);
  }

  if (lang) {
    const text = lang.toLowerCase();
    if (text.includes('vietsub') || /\bsub\b/.test(text)) addTag(tags, 'vietsub');
    if (
      text.includes('thuyết minh') ||
      text.includes('thuyet minh') ||
      text.includes('lồng tiếng') ||
      text.includes('long tieng')
    ) {
      addTag(tags, 'thuyetminh');
    }
  }

  return tags;
}

export function formatEpisodeBadge(episode) {
  if (!episode) return '';
  const text = episode.trim();
  if (/full|hoàn tất|hoan tat/i.test(text)) return 'Full';
  const match = text.match(/tập\s*(\d+)|(\d+)\s*\/\s*\d+/i);
  if (match) return `Tập ${match[1] || match[2]}`;
  return text.length > 10 ? text.slice(0, 10) : text;
}

export function buildBroadcastServers(sourceEpisodes, sources) {
  const result = [];
  for (const [sourceId, servers] of Object.entries(sourceEpisodes)) {
    const info = sources[sourceId];
    if (!info || !Array.isArray(servers)) continue;
    servers.forEach((server, idx) => {
      if (!server.server_data?.length) return;
      result.push({
        key: `${sourceId}-${idx}`,
        sourceId,
        label: `${info.broadcastName} · ${server.server_name}`,
        episodes: server.server_data,
      });
    });
  }
  return result;
}
