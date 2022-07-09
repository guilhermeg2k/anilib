export const flatten = (array: Array<any>) => {
  const flatArray = <Array<any>>[];

  array.forEach((arrayItem) => {
    if (Array.isArray(arrayItem)) {
      flatArray.push(...flatten(arrayItem));
    } else {
      flatArray.push(arrayItem);
    }
  });

  return flatArray;
};
