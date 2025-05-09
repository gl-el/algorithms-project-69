/**
 * @param {{id: string, text: string}[]} docs
 * @param {string} term
 */
const search = (docs, term) => {
  const cleanTerms = term.match(/\w+/g)?.map(term => term.toLowerCase())

  if (!docs || !term || !cleanTerms?.length) return []

  const totalTerms = cleanTerms.length

  return docs.reduce((acc, { id, text }) => {
    const words = text.match(/\w+/g)
    if (!words) return acc

    const wordFreqMap = new Map()

    words.forEach((word) => {
      const key = word.toLowerCase()
      wordFreqMap.set(key, (wordFreqMap.get(key) || 0) + 1)
    })

    let termFrequencySum = 0
    let uniqueTermMatches = 0

    cleanTerms.forEach((term) => {
      const wordsCount = wordFreqMap.get(term)
      if (wordsCount) {
        termFrequencySum += wordsCount || 0
        uniqueTermMatches += 1
      }
    })

    const count = termFrequencySum * (uniqueTermMatches / totalTerms)

    if (!count) return acc

    acc.push({ id, count })

    return acc
  }, [])
    .sort((a, b) => b.count - a.count)
    .map(({ id }) => id)
}

export default search
