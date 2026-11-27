// Fuzzy name matching for people search ("usr2" → user2, "jhon" → John,
// "kai riv" → Kai Rivera). Pure functions; mirrored in
// frontend/src/lib/fuzzyName.js — keep the two in sync.

function normalize(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents: "José" → "jose"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Bounded Levenshtein: returns max+1 as soon as the distance must exceed max.
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      // Adjacent transposition ("jhon" ↔ "john") counts as one edit.
      if (prev2 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        cur[j] = Math.min(cur[j], prev2[j - 2] + 1);
      }
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}

// Typos allowed for a token of this length: none for 1-2 chars, 1 up to 5, 2 beyond.
const allowedTypos = (len) => (len <= 2 ? 0 : len <= 5 ? 1 : 2);

// Letters appear in order and reasonably close together ("usr2" in "user2").
function isTightSubsequence(q, text) {
  let i = 0;
  let start = -1;
  for (let j = 0; j < text.length && i < q.length; j++) {
    if (text[j] === q[i]) {
      if (start < 0) start = j;
      i++;
      if (i === q.length) return j - start + 1 <= q.length * 2;
    }
  }
  return false;
}

// How well one query token matches one name word (0 = no match).
function tokenScore(tok, word) {
  if (word === tok) return 1;
  if (word.startsWith(tok)) return 0.9;
  if (word.includes(tok)) return 0.7;
  const typos = allowedTypos(tok.length);
  if (typos > 0) {
    // Compare against the whole word and against its same-length prefix so a
    // partially typed, misspelled word ("rivr" → "rivera") still matches.
    const d = Math.min(
      editDistance(tok, word, typos),
      editDistance(tok, word.slice(0, tok.length), typos)
    );
    if (d <= typos) return 0.6 - d * 0.1;
  }
  if (tok.length >= 3 && isTightSubsequence(tok, word)) return 0.45;
  return 0;
}

/**
 * Score how well `query` matches `name`, 0..100. 0 means "not a match".
 * Ranking: exact > starts with > word starts with > contains > every word
 * matches (prefix / typo / letters in order) > whole-name letters in order.
 */
function scoreName(query, name) {
  const q = normalize(query);
  const n = normalize(name);
  if (!q || !n) return 0;
  if (n === q) return 100;
  if (n.startsWith(q)) return 95;
  const words = n.split(' ');
  if (words.some((w) => w.startsWith(q))) return 90;
  const qCompact = q.replace(/ /g, '');
  const nCompact = n.replace(/ /g, '');
  if (n.includes(q) || nCompact.includes(qCompact)) return 85;

  // Every query word must match some name word (or, for single-word names,
  // the compacted name so "user 2" still finds "user2").
  const qTokens = q.split(' ');
  const targets = words.length > 1 ? [...words, nCompact] : [nCompact];
  let total = 0;
  for (const tok of qTokens) {
    let best = 0;
    for (const w of targets) best = Math.max(best, tokenScore(tok, w));
    if (best === 0) { total = 0; break; }
    total += best;
  }
  if (total > 0) return Math.round(20 + 60 * (total / qTokens.length));

  if (qCompact.length >= 3 && isTightSubsequence(qCompact, nCompact)) return 30;
  return 0;
}

// Filter + rank a list by name. Stable for equal scores.
function rankByName(query, items, getName = (x) => x.name) {
  return items
    .map((item, idx) => ({ item, idx, score: scoreName(query, getName(item)) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.idx - b.idx)
    .map((r) => r.item);
}

module.exports = { normalize, scoreName, rankByName, editDistance };
