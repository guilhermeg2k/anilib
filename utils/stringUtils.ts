const removeHTMLTags = (str: string) => {
  return str.replace(/(<([^>]+)>)/gi, '');
};

const stringUtils = {
  removeHTMLTags,
};

export default stringUtils;
