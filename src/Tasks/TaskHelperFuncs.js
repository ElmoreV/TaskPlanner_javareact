const translateLastCompletedDatetime = (lastCompletionDatetime) => {
  let now = new Date();
  let lastFinished = new Date(lastCompletionDatetime);

  let timeDeltaInSeconds = Math.floor((now - lastFinished) / 1000);
  let minutes = Math.floor(timeDeltaInSeconds / 60);
  let hours = Math.floor(timeDeltaInSeconds / 3600);
  let days = Math.floor(timeDeltaInSeconds / 86400);
  let weeks = Math.floor(timeDeltaInSeconds / (86400 * 7));
  let months = Math.floor(timeDeltaInSeconds / (86400 * 30.42));
  let timeDeltaString = "";
  if (timeDeltaInSeconds < 15) {
    timeDeltaString = "just now";
  } else if (timeDeltaInSeconds < 60) {
    timeDeltaString = "less than a minute ago";
  } else if (timeDeltaInSeconds < 3600) {
    timeDeltaString = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (timeDeltaInSeconds < 86400) {
    timeDeltaString = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (days < 7) {
    timeDeltaString = `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (weeks < 5) {
    timeDeltaString = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  } else {
    timeDeltaString = `${months} month${months > 1 ? "s" : ""} ago`;
  }

  return timeDeltaString;
};

const translateTimeDifference = (dateTimeToCompare) => {
  let now = new Date();
  let compareTime = new Date(dateTimeToCompare);
  let timeDeltaInSeconds = Math.floor((now - compareTime) / 1000);
  console.log(timeDeltaInSeconds);
  let minutes = Math.floor(timeDeltaInSeconds / 60);
  let hours = Math.floor(timeDeltaInSeconds / 3600);
  let days = Math.floor(timeDeltaInSeconds / 86400);
  let weeks = Math.floor(timeDeltaInSeconds / (86400 * 7));
  let months = Math.floor(timeDeltaInSeconds / (86400 * 30.42));
  let timeDeltaString = "";
  if (timeDeltaInSeconds > 0) {
    if (timeDeltaInSeconds < 15) {
      timeDeltaString = "just now";
    } else if (timeDeltaInSeconds < 60) {
      timeDeltaString = "less than a minute ago";
    } else if (timeDeltaInSeconds < 3600) {
      timeDeltaString = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (timeDeltaInSeconds < 86400) {
      timeDeltaString = `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 7) {
      timeDeltaString = `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (weeks < 5) {
      timeDeltaString = `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      timeDeltaString = `${months} month${months > 1 ? "s" : ""} ago`;
    }
  } else {
    hours = -hours;
    minutes = -minutes;
    days = -days;
    weeks = -weeks;
    months = -months;
    timeDeltaInSeconds = -timeDeltaInSeconds;
    if (timeDeltaInSeconds < 60) {
      timeDeltaString = "In less than a minute";
    } else if (timeDeltaInSeconds < 3600) {
      timeDeltaString = `In ${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else if (timeDeltaInSeconds < 86400) {
      timeDeltaString = `In ${hours} hour${hours > 1 ? "s" : ""}`;
    } else if (days < 7) {
      timeDeltaString = `In ${days} day${days > 1 ? "s" : ""}`;
    } else if (weeks < 5) {
      timeDeltaString = `In ${weeks} week${weeks > 1 ? "s" : ""}`;
    } else {
      timeDeltaString = `In ${months} month${months > 1 ? "s" : ""}`;
    }
  }

  return timeDeltaString;
};

export { translateLastCompletedDatetime, translateTimeDifference };
