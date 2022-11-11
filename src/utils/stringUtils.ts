export const removeHTMLTags = (text: string) => {
  return text.replace(/(<([^>]+)>)/gi, '');
};

export const getNumbersSumFromString = (str: string) => {
  return parseInt(str.replace(/\D/g, ''));
};
