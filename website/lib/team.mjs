// The team list, used on the home and Community pages.
import { TEAM } from '../site.config.mjs';
import { esc } from './html.mjs';
import { icon } from './icons.mjs';

const LABELS = { linkedin: 'LinkedIn', github: 'GitHub', instagram: 'Instagram', x: 'X' };

export function teamGrid(lang) {
  return `<ul class="team-grid">${TEAM.map(
    (m) => `<li>
  <p class="team-role">${esc(m.role[lang])}</p>
  <h3>${esc(m.name[lang])}</h3>
  <p class="team-links">${Object.entries(m.links)
    .filter(([, url]) => url)
    .map(
      ([kind, url]) =>
        `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon(kind)}<span>${LABELS[kind] ?? kind}</span></a>`,
    )
    .join('')}</p>
</li>`,
  ).join('')}</ul>`;
}
