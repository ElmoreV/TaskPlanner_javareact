import { memo, useCallback } from "react";

import Task from "../TaskViews/Task.tsx";
import {
  scheduleTaskV2,
  setTaskFinishStatusV2,
  toggleFoldTaskV2,
  toggleRepeatTaskV2,
  planTaskV2,
  unplanTaskV2,
  setTaskNameV2,
  setTaskDueTimeV2,
  completeTaskV2,
} from "../Tasks/TaskModifyFuncGensV2.ts";
import { FinishedState } from "./TaskInterfaces.tsx";
import {
  TagMap,
  TagTasksMap,
  TaskMap,
  TaskTagsMap,
} from "../Converters/V2_types.ts";
import { deleteEntireTaskV2 } from "../ADG/ModifyTaskTagAdgElementsV2.ts";

const useCallbackifyTasks = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((appData: AppData) => {
        return {
          ...appData,
          taskMap: fn(appData.taskMap, ...args),
        };
      });
    },
    [fn, setAppData]
  );
};

const useCallbackifyPlannedIdList = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((appData: AppData) => {
        return {
          ...appData,
          plannedTaskIdList: fn(appData.plannedTaskIdList, ...args),
        };
      });
    },
    [fn, setAppData]
  );
};

const useCallbackifyTasksTagTasks = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((appData: AppData) => {
        const { newTaskMap, newTagTasksMap } = fn(
          appData.taskMap,
          appData.tagTasksMap,
          ...args
        );
        return {
          ...appData,
          taskMap: newTaskMap,
          tagTasksMap: newTagTasksMap,
        };
      });
    },
    [fn, setAppData]
  );
};

export default function TaskContainerV2(props: TaskContainerPropsV2) {
  const {
    appData,
    setAppData,
    taskId,
    taskTagsMap,
    parentTaskId,
    currentTagId,
    currentTagName,
    fancy,
  } = props;
  const { tagMap: _, taskMap, plannedTaskIdList, tagTasksMap } = appData;

  const scheduleTaskCallback = useCallbackifyTasks(scheduleTaskV2, setAppData);
  const toggleFoldTaskCallback = useCallbackifyTasks(
    toggleFoldTaskV2,
    setAppData
  );
  const toggleRepeatTaskCallback = useCallbackifyTasks(
    toggleRepeatTaskV2,
    setAppData
  );
  const completeTaskCallback = useCallbackifyTasks(completeTaskV2, setAppData);
  const setTaskFinishStatusCallback = useCallbackifyTasks(
    setTaskFinishStatusV2,
    setAppData
  );
  const planTaskCallback = useCallbackifyPlannedIdList(planTaskV2, setAppData);
  const unplanTaskCallback = useCallbackifyPlannedIdList(
    unplanTaskV2,
    setAppData
  );
  const setTaskNameCallback = useCallbackifyTasks(setTaskNameV2, setAppData);
  const setTaskDueTimeCallback = useCallbackifyTasks(
    setTaskDueTimeV2,
    setAppData
  );

  const deleteTaskCallback = useCallbackifyTasksTagTasks(
    deleteEntireTaskV2,
    setAppData
  );

  return (
    <Task
      name={taskMap[taskId].name}
      id={taskId}
      completed={taskMap[taskId].finishStatus === FinishedState.Completed}
      taskFinishStatus={taskMap[taskId].finishStatus}
      planned={plannedTaskIdList.includes(taskId)}
      repeated={taskMap[taskId].repeated}
      taskTopics={taskTagsMap[taskId]}
      taskLastCompletion={taskMap[taskId].lastFinished}
      unfolded={taskMap[taskId].unfolded}
      currentDueTime={taskMap[taskId].dueTime}
      setTaskFinishStatus={setTaskFinishStatusCallback}
      currentTopicViewIndex={
        currentTagId && tagTasksMap[currentTagId].indexOf(taskId)
      }
      currentTopicName={currentTagName}
      currentTopicId={currentTagId}
      currentSuperTaskId={parentTaskId}
      setTaskName={setTaskNameCallback}
      deleteTask={deleteTaskCallback}
      // addSubTask={addNewSubtask}
      hasSubTasks={taskMap[taskId].childTaskIds.length > 0}
      completeTask={completeTaskCallback}
      plan={planTaskCallback}
      unplan={unplanTaskCallback}
      toggleRepeatTask={toggleRepeatTaskCallback}
      // addToSelection={addTaskToSelectionCallback}
      // deleteFromSelection={deleteTaskFromSelectionCallback}
      // selected={
      //   selectedTasks.find(
      //     (st) =>
      //       st.taskId == task.id &&
      //       (!topic || st.topicId == topic.id) &&
      //       (!superTask || st.superTaskId == superTask.id),
      //   )
      //     ? true
      //     : false
      // }
      // selectedTasks={selectedTasks}
      // // addToSelection={() => addTaskToSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, topic && findTopicViewIdx(topic.id, task), superTask && superTask.id)}
      // // deleteFromSelection={() => deleteTaskFromSelection(selectedTasks, setSelectedTasks, task.id, topic && topic.id, superTask && superTask.id)}
      // moveTasks={moveTasks}
      // duplicateTask={duplicateTask}
      toggleFold={toggleFoldTaskCallback}
      setDueTime={setTaskDueTimeCallback}
      fancy={fancy}
    />
  );
}

interface TaskContainerPropsV2 {
  appData: AppData;
  setAppData: (appData: AppData) => void;
  taskId: number;
  taskTagsMap: TaskTagsMap;
  parentTaskId: number | undefined;
  currentTagId: number | undefined;
  currentTagName: string | undefined;
  fancy: boolean;
}

interface AppData {
  tagMap: TagMap;
  taskMap: TaskMap;
  tagTasksMap: TagTasksMap;
  plannedTaskIdList: number[];
}
