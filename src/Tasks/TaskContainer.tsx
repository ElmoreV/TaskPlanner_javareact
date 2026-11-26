//TaskContainer.tsx
import { memo, useCallback } from "react";

import {
  deleteTaskV1Pure,
  addNewSubtaskV1Pure,
  duplicateTaskV1Pure,
  moveTasksV1Pure,
setTaskTopicV1Pure,
} from "../ADG/ModifyFuncGeneratorsV1Idempotent.ts";

import Task from "./Task.tsx";
import {
  scheduleTaskV1Semipure,
  setTaskFinishStatusV1Semipure,
  toggleFoldTaskV1Semipure,
  toggleRepeatTaskV1Semipure,
  planTaskForWeekV1Semipure,
  unplanTaskV1Semipure,
  setTaskNameV1Semipure,
  setTaskDueTimeV1Semipure,
  completeTaskV1Semipure,
} from "./TaskModifyFuncGensV1Pure.ts";
import { V1_Task } from "../Structure/V1_types.ts";
import { TASK_CONFIG_BY_VIEW } from "./taskSettings";

class SelectedCategoryTask {
  constructor(taskId, topicId, topicViewIndex, superTaskId) {
    this.taskId = taskId;
    this.topicId = topicId;
    this.topicViewIndex = topicViewIndex;
    this.superTaskId = superTaskId;
  }
}

const addTaskToSelection = (
  selectedTasks,
  taskId,
  topicId,
  topicViewIndex,
  superTaskId
) => {
  let newSelectedTasks = [...selectedTasks];
  newSelectedTasks.push(
    new SelectedCategoryTask(taskId, topicId, topicViewIndex, superTaskId)
  );
  return newSelectedTasks;
};
const deleteTaskFromSelection = (
  selectedTasks,
  taskId,
  topicId,
  superTaskId
) => {
  console.log(
    `Deleting task ${taskId}, ${topicId}, ${superTaskId} from selection`
  );
  console.log(selectedTasks);
  let newSelectedTasks = [...selectedTasks];
  newSelectedTasks = newSelectedTasks.filter(
    (selTask) =>
      !(
        selTask.taskId == taskId &&
        selTask.topicId == topicId &&
        selTask.superTaskId == superTaskId
      )
  );
  console.log(
    `New selection after deleting task ${taskId}, ${topicId}, ${superTaskId}`
  );
  console.log(newSelectedTasks);
  return newSelectedTasks;
};

const useCallbackifySelectedTasks = (fn, setSelectedTasks) => {
  return useCallback(
    (...args) => {
      return setSelectedTasks((oldSelectedTasks) => {
        return fn(oldSelectedTasks, ...args);
      });
    },
    [fn, setSelectedTasks]
  );
};

const useCallbackify = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((oldAppData) => {
        return {
          tasks: fn(oldAppData.tasks, ...args),
          topics: oldAppData.topics,
        };
      });
    },
    [fn, setAppData]
  );
};

const useCallbackifyTopics = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((oldAppData) => {
        return {
          tasks: fn(oldAppData.topics, oldAppData.tasks, ...args),
          topics: oldAppData.topics,
        };
      });
    },
    [fn, setAppData]
  );
};

export default function TaskContainer(props) {
  const {
view,
    task,
    topic,
    superTask,
    setAppData,
    topics,
    selectedTasks,
    setSelectedTasks,
    fancy,
  } = props;

  const viewConfig = TASK_CONFIG_BY_VIEW[view];
  if (!viewConfig) {
    throw new Error(`View ${view} does not define task features.`);
  }
  const { features } = viewConfig;

  const findTopicViewIdx = (topicId: number, task: V1_Task) => {
    return task.topicViewIndices[
      task.topics.findIndex((taskTopicId) => taskTopicId == topicId)
    ];
  };

  const scheduleTaskCallback = useCallbackify(
    scheduleTaskV1Semipure,
    setAppData
  );
  const toggleFoldTaskCallback = useCallbackify(
    toggleFoldTaskV1Semipure,
    setAppData
  );
  const toggleRepeatTaskCallback = useCallbackify(
    toggleRepeatTaskV1Semipure,
    setAppData
  );
  const completeTaskCallback = useCallbackify(
    completeTaskV1Semipure,
    setAppData
  );
  const setTaskFinishStatusCallback = useCallbackify(
    setTaskFinishStatusV1Semipure,
    setAppData
  );
  const planTaskCallback = useCallbackify(
    planTaskForWeekV1Semipure,
    setAppData
  );
  const unplanTaskCallback = useCallbackify(unplanTaskV1Semipure, setAppData);
  const setTaskNameCallback = useCallbackify(setTaskNameV1Semipure, setAppData);
  const setTaskDueTimeCallback = useCallbackify(
    setTaskDueTimeV1Semipure,
    setAppData
  );
  const deleteTask = useCallbackify(deleteTaskV1Pure, setAppData);
  const addNewSubtask = useCallbackify(addNewSubtaskV1Pure, setAppData);

  const moveTasks = useCallbackifyTopics(moveTasksV1Pure, setAppData);
  const duplicateTask = useCallbackifyTopics(duplicateTaskV1Pure, setAppData);
const setTaskTopicCallback = useCallbackifyTopics(setTaskTopicV1Pure, setAppData);

  const addTaskToSelectionCallback = useCallbackifySelectedTasks(
    addTaskToSelection,
    setSelectedTasks
  );
  const deleteTaskFromSelectionCallback = useCallbackifySelectedTasks(
    deleteTaskFromSelection,
    setSelectedTasks
  );
  return (
    <Task
      name={task.name}
      id={task.id}
      completed={task.completed}
      taskFinishStatus={task.finishStatus}
      planned={task.thisWeek}
      scheduled={task.scheduled}
      repeated={task.repeated}
      taskTopics={task.topics}
      taskLastCompletion={
        features.includes("lastCompletion") ? task.lastFinished : undefined
}
      setTaskFinishStatus={
        features.includes("finishStatus") ? setTaskFinishStatusCallback : undefined
}
      currentTopicViewIndex={topic && findTopicViewIdx(topic.id, task)}
      currentTopicName={topic && topic.name}
      currentTopicId={topic && topic.id}
      currentSuperTaskId={superTask && superTask.id}
      setTaskName={features.includes("rename") ? setTaskNameCallback : undefined}
      deleteTask={features.includes("delete") ? deleteTask : undefined}
      addSubTask={features.includes("addSubtask") ? addNewSubtask : undefined}
      hasSubTasks={task.subTaskIds && task.subTaskIds.length > 0}
      completeTask={
        features.includes("complete") ? completeTaskCallback : undefined
}
      plan={features.includes("plan") ? planTaskCallback : undefined}
      unplan={features.includes("plan") ? unplanTaskCallback : undefined}
      toggleRepeatTask={
        features.includes("repeat") ? toggleRepeatTaskCallback : undefined
}
      addToSelection={
        features.includes("selection") ? addTaskToSelectionCallback : undefined
}
      deleteFromSelection={
        features.includes("selection") ? deleteTaskFromSelectionCallback : undefined
}
      selected={
        selectedTasks.find(
          (st) =>
            st.taskId == task.id &&
            (!topic || st.topicId == topic.id) &&
            (!superTask || st.superTaskId == superTask.id)
        )
          ? true
          : false
      }
      selectedTasks={selectedTasks}
      // addToSelection={() => addTaskToSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, topic && findTopicViewIdx(topic.id, task), superTask && superTask.id)}
      // deleteFromSelection={() => deleteTaskFromSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, superTask && superTask.id)}
      moveTasks={features.includes("move") ? moveTasks : undefined}
      duplicateTask={features.includes("duplicate") ? duplicateTask : undefined}
      fancy={fancy}
      toggleFold={
        features.includes("fold") ? toggleFoldTaskCallback : undefined
}
      unfolded={task.unfolded}
      setDueTime={features.includes("deadline") ? setTaskDueTimeCallback : undefined}
      currentDueTime={task.dueTime}
    />
  );
}
