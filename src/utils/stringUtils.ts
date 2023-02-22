export const removeHTMLTags = (text: string) => {
  return text.replace(/(<([^>]+)>)/gi, '');
};

export const getNumbersSumFromString = (str: string) => {
  return parseInt(str.replace(/\D/g, ''));
};

export const sortByStringNumbersSum = (strA: string, strB: string) => {
  const strANumbersSum = getNumbersSumFromString(strA);
  const strBNumbersSum = getNumbersSumFromString(strB);
  return strANumbersSum > strBNumbersSum ? 1 : -1;
};
