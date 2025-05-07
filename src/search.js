/**
 * @param {{id: string, text: string}[]} docs
 * @param {string} term
 */
const search = (docs, term) => {
  const cleanTerm = term.match(/\w+/g)?.[0].toLowerCase();

  if (!docs || !term || !cleanTerm) return [];

  return docs.reduce((acc, {id, text}) => {
    const words = text.match(/\w+/g)?.map(i => i.toLowerCase());
    if (!words) return acc;

    const filtered = words.filter(word => word === cleanTerm);
    if (!filtered.length) return acc;

    acc.push({id, count: filtered.length});
    return acc;
  }, [])
    .sort((a, b) => b.count - a.count)
    .map((item) => item.id);
}

export default search;
