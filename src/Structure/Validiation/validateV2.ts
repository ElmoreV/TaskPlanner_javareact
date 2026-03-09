import { AppDataV2 } from "../AppDataTypes";
import {
  Tag,
  Task,
  TagTasksMap,
  TagMap,
  TaskMap,
  TaskTagsMap,
} from "../V2_types";

// Validates all rules of the V2 structures
const validateV2Structure = (appData: AppDataV2): boolean => {
  let messages: string[] = [];

  Object.entries(appData.tagMap).forEach((entry) => {
    const [tagId, tag] = entry;
    // test if the tagId is a number
    if (/^\d+$/.test(tagId)) {
      messages.push(`TagId ${tagId} is not numeric`);
    }
    // test if taskId === task.id
    if (tagId !== String(tag.id)) {
      messages.push(`TagId ${tagId} and tag.id are not the same`);
    }
    if (!tag.name || tag.name.length === 0) {
      messages.push(`TagId ${tagId}: Tag name is empty`);
    }
    if (tag.childTagIds.length > 0) {
      // check if all childTagIds are numbers
      if (
        tag.childTagIds.some((childTagId) => !(typeof childTagId === "number"))
      ) {
        messages.push(`TagId ${tagId}:Not all childTagIds are numbers`);
      }
      // check if all childTagIds are in tagMap
      if (
        tag.childTagIds.some((childTagId) => !(childTagId in appData.tagMap))
      ) {
        messages.push(`TagId ${tagId}:Not all childTagIds are in tagMap`);
      }
      // check if all childTagIds are unique
      if (
        tag.childTagIds.some(
          (childTagId, idx) => tag.childTagIds.indexOf(childTagId) !== idx
        )
      ) {
        messages.push(`TagId ${tagId}:Not all childTagIds are unique`);
      }
      // check if all tags in the childTagIds have this tag as parentTagId
      tag.childTagIds.forEach((childTagId) => {
        if (appData.tagMap[childTagId].parentTagIds.indexOf(tagId) === -1) {
          messages.push(`TagId ${tagId}: Child tag is not in parentTagIds`);
        }
      });
    }
    if (tag.parentTagIds.length > 0) {
      // check if all parentTagIds are numbers
      if (
        tag.parentTagIds.some(
          (parentTagId) => !(typeof parentTagId === "number")
        )
      ) {
        messages.push(`TagId ${tagId}:Not all parentTagIds are numbers`);
      }
      // check if all parentTagIds are in tagMap
      if (
        tag.parentTagIds.some((parentTagId) => !(parentTagId in appData.tagMap))
      ) {
        messages.push(`TagId ${tagId}:Not all parentTagIds are in tagMap`);
      }
      // check if all parentTagIds are unique
      if (
        tag.parentTagIds.some(
          (parentTagId, idx) => tag.parentTagIds.indexOf(parentTagId) !== idx
        )
      ) {
        messages.push(`TagId ${tagId}:Not all parentTagIds are unique`);
      }
      // check if all tags in the parentTagIds have this tag as parentTagId
      tag.parentTagIds.forEach((parentTagId) => {
        if (appData.tagMap[parentTagId].childTagIds.indexOf(tag.id) === -1) {
          messages.push(
            `TagId ${tagId}:Parent tag ${parentTagId} is not in childTagIds`
          );
        }
      });
    }
    // check if unfolded is a boolean
    if (typeof tag.unfolded !== "boolean") {
      console.warn("Tag unfolded is not a boolean");
      return false;
    }
  });

  // Check if there are any cycles in the tag graph
  // NOT IMPLEMENTED

  //////////
  /// VALIDATE TASKS
  //////////

  Object.entries(appData.taskMap).forEach((entry) => {
    const [taskId, task] = entry;
    // test if the taskId is a number
    if (/^\d+$/.test(taskId)) {
      messages.push(`TaskId ${taskId} is not numeric`);
    }
    // test if taskId === task.id
    if (taskId !== String(task.id)) {
      messages.push(`TaskId ${taskId} and task.id are not the same`);
    }
    if (!task.name || task.name.length === 0) {
      messages.push(`TaskId ${taskId}: Task name is empty`);
    }
    if (task.childTaskIds.length > 0) {
      // check if all childTaskIds are numbers
      if (
        task.childTaskIds.some(
          (childTaskId) => !(typeof childTaskId === "number")
        )
      ) {
        messages.push(`TaskId ${taskId}:Not all childTaskIds are numbers`);
      }
      // check if all childTaskIds are in taskMap
      if (
        task.childTaskIds.some(
          (childTaskId) => !(childTaskId in appData.taskMap)
        )
      ) {
        messages.push(`TaskId ${taskId}:Not all childTaskIds are in taskMap`);
      }
      // check if all childTaskIds are unique
      if (
        task.childTaskIds.some(
          (childTaskId, idx) => task.childTaskIds.indexOf(childTaskId) !== idx
        )
      ) {
        messages.push(`TaskId ${taskId}:Not all childTaskIds are unique`);
      }
      // check if all tasks in the childTaskIds have this task as parentTaskId
      task.childTaskIds.forEach((childTaskId) => {
        if (appData.taskMap[childTaskId].parentTaskIds.indexOf(taskId) === -1) {
          messages.push(`TaskId ${taskId}: Child task is not in parentTaskIds`);
        }
      });
    }
    if (task.parentTaskIds.length > 0) {
      // check if all parentTaskIds are numbers
      if (
        task.parentTaskIds.some(
          (parentTaskId) => !(typeof parentTaskId === "number")
        )
      ) {
        messages.push(`TaskId ${taskId}:Not all parentTaskIds are numbers`);
      }
      // check if all parentTaskIds are in taskMap
      if (
        task.parentTaskIds.some(
          (parentTaskId) => !(parentTaskId in appData.taskMap)
        )
      ) {
        messages.push(`TaskId ${taskId}:Not all parentTaskIds are in taskMap`);
      }
      // check if all parentTaskIds are unique
      if (
        task.parentTaskIds.some(
          (parentTaskId, idx) =>
            task.parentTaskIds.indexOf(parentTaskId) !== idx
        )
      ) {
        messages.push(`TaskId ${taskId}:Not all parentTaskIds are unique`);
      }
      // check if all tasks in the parentTaskIds have this task as parentTaskId
      task.parentTaskIds.forEach((parentTaskId) => {
        if (
          appData.taskMap[parentTaskId].childTaskIds.indexOf(task.id) === -1
        ) {
          messages.push(
            `TaskId ${taskId}:Parent task ${parentTaskId} is not in childTaskIds`
          );
        }
      });
    }
    // check if unfolded is a boolean
    if (typeof task.unfolded !== "boolean") {
      console.warn("Task unfolded is not a boolean");
      return false;
    }
  });

  // Check if there are any cycles in the task graph
  // NOT IMPLEMENTED

  //////////
  /// VALIDATE TAG TASKS MAP
  //////////

  ///////
  /// VALIDATE PLANNED TASK ID LIST
  ///////

  return true;
};
