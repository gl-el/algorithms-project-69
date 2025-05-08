/**
 * @param {{id: string, text: string}[]} docs
 * @param {string} term
 */
const search = (docs, term) => {
  const cleanTerm = term.match(/\w+/g)?.[0].toLowerCase()

  if (!docs || !term || !cleanTerm) return []

  return docs.reduce((acc, { id, text }) => {
    const words = text.match(/\w+/g);
    if (!words) return acc

    const wordFreqMap = new Map()

    words.forEach((word) => {
      const key = word.toLowerCase()
      wordFreqMap.set(key, (wordFreqMap.get(key) || 0) + 1)
    })

    const wordCount = wordFreqMap.get(cleanTerm);

    if (!wordCount) return acc

    acc.push({ id, count: wordCount })

    return acc
  }, [])
    .sort((a, b) => b.count - a.count)
    .map(({ id }) => id);
}

export default search
