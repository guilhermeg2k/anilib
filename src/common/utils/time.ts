export const formatSecondsInTime = (
  timeInSeconds: number | undefined | null
) => {
  if (timeInSeconds) {
    if (timeInSeconds < 3600) {
      const formattedTime = new Date(timeInSeconds * 1000)
        .toISOString()
        .slice(14, 19);
      return formattedTime;
    }

    const formattedTime = new Date(timeInSeconds * 1000)
      .toISOString()
      .slice(11, 19);
    return formattedTime;
  }
  return '00:00';
};
