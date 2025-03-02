import { useState, useEffect } from "react";
import React from "react";
import {
  TagMap,
  TagTasksMap,
  TaskMap,
  TaskTagsMap,
} from "../Converters/V2_types";
import Task from "./Task.tsx";
import Topic from "../Topics/Topic.js";
import { FinishedState } from "../Tasks/TaskInterfaces.tsx";
import TaskContainerV2 from "../Tasks/TaskContainerV2.tsx";

const TaskListV2 = (props: TaskListPropsV2) => {
  const { appData, setAppData, fancy } = props;
  const { tagMap, taskMap, tagTasksMap, plannedTaskIdList } = appData;

  // Invert the tagTaskMap
  // So that we have
  // taskTagsMap[taskId] = [tagId1, tagId2, ...]
  const taskTagsMap: TaskTagsMap = {};
  for (const tagId in tagTasksMap) {
    for (const taskId of tagTasksMap[tagId]) {
      if (!taskTagsMap[taskId]) {
        taskTagsMap[taskId] = [];
      }
      taskTagsMap[taskId].push(Number(tagId));
    }
  }

  const showUntaggedTasks = () => {
    // 1. Find all tasks that are not tagged
    // 2. Find all of those that are 'root' tasks (no supertasks)
    // 2. Show them (and their subtasks)
    let taggedTaskIds = new Set<number>();
    return <div key="untagged-tasks"></div>;
    for (const tagId in tagTasksMap) {
      const taskIds = tagTasksMap[tagId];
      taskIds.forEach((tid) => taggedTaskIds.add(tid));
    }

    return (
      <div key="untagged-tasks">
        {Object.keys(taskMap)
          .filter((tid) => !taggedTaskIds.has(Number(tid)))
          .filter((tid) => taskMap[tid].parentTaskIds.length === 0)
          .map((taskId) =>
            recursiveShowTaskDAG(Number(taskId), undefined, undefined),
          )}
      </div>
    );
  };

  const createTaskReactElement = (
    taskId: number,
    parentTaskId: number | undefined,
    parentTagId: number | undefined,
  ) => {
    return (
      <TaskContainerV2
        appData={appData}
        setAppData={setAppData}
        taskId={taskId}
        taskTagsMap={taskTagsMap}
        parentTaskId={parentTaskId}
        currentTagId={parentTagId}
        currentTagName={parentTagId && tagMap[parentTagId].name}
        fancy={fancy}
      />
    );
  };

  const createTagReactElement = (tagId: number) => {
    return (
      <Topic
        name={tagMap[tagId].name}
        id={tagMap[tagId].id}
        unfolded={tagMap[tagId].unfolded}
        // selectedTasks={selectedTasks}
        // setTopicName={getSetTopicNameFunc(setTopics, topics, topic.id)}
        // toggleFold={getToggleFold(setTopics, topics)}
        // addSubTopic={getAddSubtopic(setTopics, topics, topic)}
        // moveTopic={getMoveTopic(setTopics, topics)}
        // addTask={getAddTask(setTasks, tasks, topics, topic.id)}
        // moveTasks={getMoveTasks(topics, tasks, setTasks)}
        // unfoldAll={getUnfoldAll(setTopics, topics)}
        // foldAll={getFoldAll(setTopics, topics)}
        // duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
        // deleteTopic={getDeleteTopic(setTopics, topics, setTasks, tasks, topic.id)}
        fancy={true}
      />
    );
  };

  const recursiveShowTaskDAG = (
    taskId: number,
    parentTaskId: number | undefined,
    parentTagId: number | undefined,
  ) => {
    return (
      <li key={"tk-" + parentTagId + "-" + parentTaskId + "-" + taskId}>
        {createTaskReactElement(taskId, parentTaskId, parentTagId)}
        {/* Task: {taskId} : {taskMap[taskId].name} */}
      </li>
    );
  };

  const showTagDAG = () => {
    // 1. Find all root tags
    // 2. Show them (and their subtags)
    return Object.keys(tagMap)
      .filter((tagId) => tagMap[tagId].parentTagIds.length === 0)
      .map((tagId) => recursiveShowTagDAG(Number(tagId)));
  };

  const recursiveShowTagDAG = (tagId: number) => {
    return (
      <div key={"div-tg-" + tagId}>
        <li key={"tg-" + tagId}>{createTagReactElement(tagId)}</li>
        <ul key={"tg-" + tagId + "-tags"}>
          {tagMap[tagId].childTagIds.map((childTagId) => {
            return recursiveShowTagDAG(childTagId);
          })}
        </ul>
        <ul key={"tg-" + tagId + "-tasks"}>
          {tagTasksMap[tagId].map((taskId) =>
            recursiveShowTaskDAG(taskId, undefined, tagId),
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="task-list">
      <h1>Tag Task DAG </h1>
      <ul key="root-tags">
        {showUntaggedTasks()}
        {showTagDAG()}
      </ul>
    </div>
  );
};

interface AppData {
  tagMap: TagMap;
  taskMap: TaskMap;
  tagTasksMap: TagTasksMap;
  plannedTaskIdList: number[];
}

interface TaskListPropsV2 {
  appData: AppData;
  setAppData: (appData: AppData) => void;
  fancy: boolean;
}

export { TaskListV2 };
