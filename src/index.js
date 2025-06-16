/* eslint-disable no-restricted-syntax */
/* eslint-disable no-bitwise */
const fnv1a = (str) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
};

const fnv1aIndex = (str, bucketCount) => fnv1a(str) % bucketCount;

class HashTable {
  constructor(bucketCount = 2048) {
    this.bucketCount = bucketCount;
    this.buckets = Array.from({ length: bucketCount }, () => []);
  }

  hash(key) {
    return fnv1aIndex(key, this.bucketCount);
  }

  set(key, value) {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    for (const node of bucket) {
      if (node.key === key) {
        node.value = value;
        return;
      }
    }
    bucket.push({ key, value });
  }

  get(key) {
    const bucket = this.buckets[this.hash(key)];
    for (const node of bucket) {
      if (node.key === key) return node.value;
    }
    return undefined;
  }
}

const tokenize = (text) => text
  .match(/\w+/g)
  ?.map((w) => w.toLowerCase())
  ?? [];

let idfMap = {};
const invertedIndexCache = new Map();

/**
 * @param {{id: string, text: string}[]} docs
 * @returns {HashTable} term to { [docId]: count }
 */
const buildInvertedIndex = (docs) => {
  const docString = docs.map((d) => `${d.id}:${d.text}`).join('|');
  const hash = fnv1a(docString);
  if (invertedIndexCache.has(hash)) {
    return invertedIndexCache.get(hash);
  }

  const index = new HashTable(2048);
  // document frequency per term
  const df = new Map();
  const N = docs.length;

  // 1) build postings with raw counts + df
  for (const { id, text } of docs) {
    const freq = new Map();
    for (const w of tokenize(text)) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    for (const [term, count] of freq.entries()) {
      // postings
      const post = index.get(term) ?? {};
      post[id] = count;
      index.set(term, post);
      // df
      df.set(term, (df.get(term) || 0) + 1);
    }
  }

  // IDF = log(1 + N/df)
  idfMap = {};
  for (const [term, dfCount] of df.entries()) {
    idfMap[term] = Math.log(1 + N / dfCount);
  }

  invertedIndexCache.set(hash, index);
  return index;
};

/**
 * @param {{id: string, text: string}[]} docs
 * @param {string} searchTerm
 * @returns {string[]} sorted doc IDs by TF–IDF score
 */
const search = (docs, searchTerm) => {
  const terms = tokenize(searchTerm);
  if (!docs.length || !terms.length) return [];

  const index = buildInvertedIndex(docs);
  const docScores = new Map();
  const docMatched = new Map();

  for (const t of terms) {
    const post = index.get(t);
    // eslint-disable-next-line no-continue
    if (!post) continue;
    const idf = idfMap[t] || 0;
    for (const [docId, cnt] of Object.entries(post)) {
      docScores.set(docId, (docScores.get(docId) || 0) + cnt * idf);
      if (!docMatched.has(docId)) docMatched.set(docId, new Set());
      docMatched.get(docId).add(t);
    }
  }

  const Q = terms.length;
  const ranked = [];
  for (const [docId, rawScore] of docScores.entries()) {
    const cov = docMatched.get(docId).size / Q;
    ranked.push({ id: docId, score: rawScore * cov });
  }

  return ranked
    .sort((a, b) => b.score - a.score)
    .map((x) => x.id);
};

export default search;
