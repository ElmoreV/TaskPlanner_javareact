// Helper functions (as before)
export function arraysEqual(arr1, arr2) {
  if (!arr1 || !arr2) return arr1 === arr2;
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((value, index) => value === sorted2[index]);
}

export function datesEqual(d1, d2) {
  if (d1 === d2) return true;
  if (!d1 || !d2) return false;
  return new Date(d1).getTime() === new Date(d2).getTime();
}

// Compare two tasks ignoring id and name
export function areTasksEqualExceptIdAndName(task1, task2) {
  return (
    task1.finishStatus === task2.finishStatus &&
    task1.scheduled === task2.scheduled &&
    task1.repeated === task2.repeated &&
    arraysEqual(task1.childTaskIds, task2.childTaskIds) &&
    arraysEqual(task1.parentTaskIds, task2.parentTaskIds) &&
    datesEqual(task1.dueTime, task2.dueTime) &&
    datesEqual(task1.transitiveDueTime, task2.transitiveDueTime) &&
    datesEqual(task1.lastFinished, task2.lastFinished)
  );
}

export function areTagsEqualExceptIdAndName(tag1, tag2) {
  // we don't care about unfolded
  return (
    arraysEqual(tag1.childTagIds, tag2.childTagIds) &&
    arraysEqual(tag1.parentTagIds, tag2.parentTagIds)
  );
}

// Compare two tasks ignoring id and name
export function areTasksEqualExceptId(task1, task2) {
  return (
    task1.name === task2.name &&
    task1.finishStatus === task2.finishStatus &&
    task1.scheduled === task2.scheduled &&
    task1.repeated === task2.repeated &&
    arraysEqual(task1.childTaskIds, task2.childTaskIds) &&
    arraysEqual(task1.parentTaskIds, task2.parentTaskIds) &&
    datesEqual(task1.dueTime, task2.dueTime) &&
    datesEqual(task1.transitiveDueTime, task2.transitiveDueTime) &&
    datesEqual(task1.lastFinished, task2.lastFinished)
  );
}

// Compare two tasks ignoring id and name
export function areTagsEqualExceptId(tag1, tag2) {
  // we don't care about unfolded
  return (
    tag1.id === tag2.id &&
    arraysEqual(tag1.childTagIds, tag2.childTagIds) &&
    arraysEqual(tag1.parentTagIds, tag2.parentTagIds)
  );
}
