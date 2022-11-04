export const removeHTMLTags = (text: string) => {
  return text.replace(/(<([^>]+)>)/gi, '');
};
