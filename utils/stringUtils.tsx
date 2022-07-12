class StringUtils {
  removeHTMLTags(str: string) {
    return str.replace(/(<([^>]+)>)/gi, '');
  }
}

export default StringUtils;
