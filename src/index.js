const invertedIndex = {};
let prevDocsHash = '';
/**
 * @param {{id: string, text: string}[]} docs
 */
const buildInvertedIndex = (docs) => {
  const hash = docs.reduce((acc, { id, text }) => `${acc}|${id}:${text}`, '');
  if (hash !== prevDocsHash) {
    const newIndex = {};
    prevDocsHash = hash;
    docs.forEach(({ id, text }) => {
      const words = text.match(/\w+/g)?.map((word) => word.toLowerCase()) ?? [];
      const freqMap = new Map();

      // eslint-disable-next-line no-restricted-syntax
      for (const word of words) {
        freqMap.set(word, (freqMap.get(word) || 0) + 1);
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const [word, count] of freqMap.entries()) {
        if (!newIndex[word]) newIndex[word] = {};
        newIndex[word][id] = count;
      }
    });
    invertedIndex[hash] = newIndex;
  }
  return invertedIndex[hash];
};

/**
 * @param {{id: string, text: string}[]} docs
 * @param {string} searchTerm
 */
const search = (docs, searchTerm) => {
  const cleanTerms = searchTerm.match(/\w+/g)?.map((term) => term.toLowerCase());

  if (!docs.length || !searchTerm || !cleanTerms?.length) return [];

  const totalTerms = cleanTerms.length;

  const index = buildInvertedIndex(docs);

  const docScores = new Map();
  const docMatchedTerms = new Map();

  // eslint-disable-next-line no-restricted-syntax
  for (const term of cleanTerms) {
    const posting = index[term];
    if (!posting) continue;

    // eslint-disable-next-line no-restricted-syntax
    for (const [docId, freq] of Object.entries(posting)) {
      docScores.set(docId, (docScores.get(docId) || 0) + freq);

      if (!docMatchedTerms.has(docId)) {
        docMatchedTerms.set(docId, new Set());
      }
      docMatchedTerms.get(docId).add(term);
    }
  }

  const ranked = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [docId, score] of docScores.entries()) {
    const uniqueMatches = docMatchedTerms.get(docId).size;
    const finalScore = score * (uniqueMatches / totalTerms);
    ranked.push({ id: docId, score: finalScore });
  }

  return ranked.sort((a, b) => b.score - a.score).map(({ id }) => id);
};

export default search;
