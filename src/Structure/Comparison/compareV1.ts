import { FinishedState } from "../TaskInterfaces.tsx";
import { V1_Task, V1_Topic } from "../V1_types";

export const compareV1 = (
  tasksA: V1_Task[],
  topicsA: V1_Topic[],
  tasksB: V1_Task[],
  topicsB: V1_Topic[]
): boolean => {
  let areEqual: boolean = true;

  // compare if there are differences between tasks and tasksV1, and topics and topicsV1
  if (tasksA.length !== tasksB.length) {
    console.log("Tasks are different lenghts");
    areEqual = false;
  }
  if (topicsA.length !== topicsB.length) {
    console.log("Topics are different lenghts");
    areEqual = false;
  }
  let allTaskIds = tasksA.map((task) => task.id);

  // Migrate this to the validators
  allTaskIds.forEach((taskId) => {
    let refTask = tasksA.find((task) => task.id === taskId);
    let reviewTask = tasksB.find((task) => task.id === taskId);
    if (reviewTask === undefined) {
      console.log("Task is missing: " + taskId);
      areEqual = false;
      return areEqual;
    }
    if (refTask === undefined) {
      console.log("This cannot happen: " + taskId);
      areEqual = false;

      return areEqual;
    }
    if (refTask.name !== reviewTask.name) {
      console.log(
        "Task names are different: " + refTask.name + " vs " + reviewTask.name
      );
      areEqual = false;
    }
    if (refTask.topics.length !== reviewTask.topics.length) {
      console.log(
        "Task topics are different lenghts: " +
          refTask.topics.length +
          " vs " +
          reviewTask.topics.length
      );
      areEqual = false;
    } else if (
      !refTask.topics.every((value) => reviewTask.topics.includes(value))
    ) {
      console.log(
        "Task topics have different elements: " +
          refTask.topics +
          " vs " +
          reviewTask.topics
      );
      areEqual = false;
    }

    if (
      refTask.topicViewIndices.length !== reviewTask.topicViewIndices.length
    ) {
      console.log(
        "Task order in topics are different lenghts: " +
          refTask.topicViewIndices.length +
          " vs " +
          reviewTask.topicViewIndices.length
      );
      areEqual = false;
    }
    // else if (!refTask.topicViewIndices.every(value => reviewTask.topicViewIndices.includes(value))) {
    //   console.log("Task topicViewIndices have different elements: " + refTask.topicViewIndices + " vs " + reviewTask.topicViewIndices)
    // }
    if (
      refTask.subTaskIds &&
      refTask.subTaskIds.length !== reviewTask.subTaskIds.length
    ) {
      console.log(
        "Task subTaskIds are different lenghts: " +
          refTask.subTaskIds.length +
          " vs " +
          reviewTask.subTaskIds.length
      );
      areEqual = false;
    } else if (
      !refTask.subTaskIds.every((value) =>
        reviewTask.subTaskIds.includes(value)
      )
    ) {
      console.log(
        "Task subTaskIds have different elements: " +
          refTask.subTaskIds +
          " vs " +
          reviewTask.subTaskIds
      );
      areEqual = false;
    }
    if (
      (refTask.thisWeek !== reviewTask.thisWeek &&
        refTask.thisWeek !== undefined) ||
      (refTask.thisWeek === undefined && reviewTask.thisWeek === true)
    ) {
      console.log(
        "Task thisWeek are different: " +
          refTask.thisWeek +
          " vs " +
          reviewTask.thisWeek
      );
      areEqual = false;
    }
    if (refTask.weekOrderIndex !== reviewTask.weekOrderIndex) {
      console.log(
        "Task weekOrderIndex are different: " +
          refTask.weekOrderIndex +
          " vs " +
          reviewTask.weekOrderIndex
      );
      areEqual = false;
    }
    if (
      refTask.finishStatus !== undefined &&
      refTask.finishStatus !== reviewTask.finishStatus
    ) {
      console.log(
        "Task finishStatus are different: " +
          refTask.finishStatus +
          " vs " +
          reviewTask.finishStatus
      );
      areEqual = false;
    } else if (
      refTask.finishStatus === undefined &&
      reviewTask.finishStatus !== undefined
    ) {
      if (
        refTask.completed &&
        reviewTask.finishStatus !== FinishedState.Completed
      ) {
        console.log(
          "Task finishStatus are different: " +
            refTask.finishStatus +
            " vs " +
            reviewTask.finishStatus
        );
        areEqual = false;
      }
    }

    // if ((refTask.completed !== reviewTask.completed)
    //   || (refTask.finishStatus !== reviewTask.finishStatus)) {
    //   console.log("Task finishStatus are different: " + refTask.finishStatus + " vs " + reviewTask.finishStatus)
    //   console.log("Task completed are different: " + refTask.completed + " vs " + reviewTask.completed)
    // }
    if (refTask.repeated !== reviewTask.repeated) {
      console.log(
        "Task repeated are different: " +
          refTask.repeated +
          " vs " +
          reviewTask.repeated
      );
      areEqual = false;
    }
    if (refTask.scheduled !== reviewTask.scheduled) {
      console.log(
        "Task scheduled are different: " +
          refTask.scheduled +
          " vs " +
          reviewTask.scheduled
      );
      areEqual = false;
    }
    if (refTask.unfolded !== reviewTask.unfolded) {
      console.log(
        "Task unfolded are different: " +
          refTask.unfolded +
          " vs " +
          reviewTask.unfolded
      );
      areEqual = false;
    }
    if (refTask.dueTime !== reviewTask.dueTime) {
      console.log(
        "Task dueTime are different: " +
          refTask.dueTime +
          " vs " +
          reviewTask.dueTime
      );
      areEqual = false;
    }
    // Compare preserved legacy values; effective deadlines are not written back.
    if (refTask.transitiveDueTime !== reviewTask.transitiveDueTime) {
      console.log(
        "Task transitiveDueTime are different: " +
          refTask.transitiveDueTime +
          " vs " +
          reviewTask.transitiveDueTime
      );
      areEqual = false;
    }
    if (refTask.lastFinished !== reviewTask.lastFinished) {
      console.log(
        "Task lastFinished are different: " +
          refTask.lastFinished +
          " vs " +
          reviewTask.lastFinished
      );
      areEqual = false;
    }
  });

  /// Compare topics
  // need to recursively compare topics
  // for each matching pair of topics (matching by id)
  // compare name
  // compare unfolded
  // compare collection of subtopics
  // do this comparison also for all subtopics

  const compareTopics_r = (
    topicA: V1_Topic,
    topicB: V1_Topic,
    areEqual: boolean
  ): boolean => {
    if (topicA.id !== topicB.id) {
      console.log("Topic ids are different: " + topicA.id + " vs " + topicB.id);
      areEqual = false;
    }
    if (topicA.name !== topicB.name) {
      console.log(
        "Topic names are different: " + topicA.name + " vs " + topicB.name
      );
      areEqual = false;
    }
    if (topicA.unfolded !== topicB.unfolded) {
      console.log(
        "Topic unfolded are different: " +
          topicA.unfolded +
          " vs " +
          topicB.unfolded
      );
      areEqual = false;
    }
    if (topicA.subtopics.length !== topicB.subtopics.length) {
      console.log(
        "Topic subtopics are different lenghts: " +
          topicA.subtopics.length +
          " vs " +
          topicB.subtopics.length
      );
      areEqual = false;
    } else {
      // lenghts are equal here

      // Recurse through all subtopics
      topicA.subtopics.forEach((subtopicA) => {
        // Find the corresponding subtopic in topicB
        let subtopicB = topicB.subtopics.find(
          (subtopicB) => subtopicB.id === subtopicA.id
        );
        if (subtopicB === undefined) {
          console.log("Subtopic is missing: " + subtopicA.id);
          areEqual = false;
          return areEqual;
        }
        areEqual = areEqual && compareTopics_r(subtopicA, subtopicB, areEqual);
      });
    }
    return areEqual;
  };
  topicsA.forEach((topicA) => {
    let topicB = topicsB.find((topicB) => topicB.id === topicA.id);
    if (topicB === undefined) {
      console.log("Topic is missing: " + topicA.id);
      areEqual = false;
      return areEqual;
    }
    areEqual = areEqual && compareTopics_r(topicA, topicB, areEqual);
  });
  console.log("End of checks");
  return areEqual;
};
