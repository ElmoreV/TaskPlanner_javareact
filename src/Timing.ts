// Shows tasks that are due in the next timeIntervalInSeconds
const showTasksDueIn = (tasks, now: Date, timeIntervalInSeconds: number) => {
  let dueTime = now.setSeconds(now.getSeconds() + timeIntervalInSeconds);
  return tasks.filter((task) => task.dueTime && task.dueTime < dueTime);
};

const isTaskDueIn = (task, now: Date, timeIntervalInSeconds: number) => {
  let dueTime = now.setSeconds(now.getSeconds() + timeIntervalInSeconds);
  if (task.transitiveDueTime === undefined) return false;
  return task.transitiveDueTime < dueTime;
};

const convertDueDateNameToSeconds = (dueDateName) => {
  switch (dueDateName) {
    case "none":
      return undefined;
    case "30min":
      return 30 * 60;
    case "2hrs":
      return 2 * 60 * 60;
    case "8hrs":
      return 8 * 60 * 60;
    case "1day":
      return 24 * 60 * 60;
    case "4day":
      return 4 * 24 * 60 * 60;
    case "1week":
      return 7 * 24 * 60 * 60;
    case "2week":
      return 2 * 7 * 24 * 60 * 60;
    case "4week":
      return 4 * 7 * 24 * 60 * 60;
    case "1month":
      return 31 * 24 * 60 * 60;
    case "2month":
      return 61 * 24 * 60 * 60;
    case "3month":
      return 92 * 24 * 60 * 60;
    default:
      return undefined;
  }
};

const getFutureDate = (seconds) => {
  let now = new Date();
  let dueTime = now.setSeconds(now.getSeconds() + seconds);
  return dueTime;
};

export {
  isTaskDueIn,
  showTasksDueIn,
  convertDueDateNameToSeconds,
  getFutureDate,
};
