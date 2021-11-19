exports.getRoudedDate = (seconds, roundedTime) => {
  const date = new Date(seconds * 1000);

  date.setHours(date.getHours());

  if (roundedTime == "minutes") {
    date.setMinutes(date.getMinutes(), 0, 0);
    date.setSeconds(0, 0);
  } else if (roundedTime == "hours") {
    date.setMinutes(0, 0, 0);
  } else if ("days") {
    date.setHours(0, 0, 0, 0);
  }

  return date;
};
