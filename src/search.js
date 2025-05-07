/**
 * @param {{id: string, text: string}[]} docs
 * @param {string} term
 */
const search = (docs, term) => {
  if (!docs || !term) return [];

  return docs.reduce((acc, {id, text}) => {
    const words = text.split(' ');
    if (words.includes(term.toLowerCase())) acc.push(id);
    return acc;
  }, []);
}

export default search;
