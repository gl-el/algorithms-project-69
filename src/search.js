/**
 * @param {{id: string, text: string}[]} docs
 * @param {string} term
 */
const search = (docs, term) => {

  const cleanTerm = term.match(/\w+/g)?.[0].toLowerCase();
  if (!docs || !term || !cleanTerm) return [];

  return docs.reduce((acc, {id, text}) => {
    const words = text.match(/\w+/g)?.map(i => i.toLowerCase());
    if (words && words.includes(cleanTerm)) acc.push(id);
    return acc;
  }, []);
}

export default search;
