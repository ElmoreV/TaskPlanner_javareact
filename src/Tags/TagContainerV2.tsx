import { memo, useCallback } from "react";
import Tag from "./TagV2.tsx";
import { TagMap, TagTasksMap, TaskMap } from "../Converters/V2_types";
import {
  tagToggleFoldV2,
  setTagNameV2,
  unfoldAllDescendantsV2,
  foldAllDescendantsV2,
} from "./TagModifyFuncGensV2.ts";
import {
  addChildTagV2,
  createTaskInTagV2,
  moveTagToTagV2,
  moveTasksToTagV2,
} from "../ADG/ModifyFuncGeneratorsV2.ts";
interface AppData {
  tagMap: TagMap;
  taskMap: TaskMap;
  tagTasksMap: TagTasksMap;
  plannedTaskIdList: number[];
}

interface TagContainerProps {
  appData: AppData;
  setAppData: (appData: AppData) => void;
  tagId: number;
}

const useCallbackifyTags = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((appData: AppData) => {
        return {
          ...appData,
          tagMap: fn(appData.tagMap, ...args),
        };
      });
    },
    [fn, setAppData]
  );
};

const useCallbackifyTagTasks = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((appData: AppData) => {
        const newTagTasksMap = fn(appData.tagTasksMap, ...args);

        return {
          ...appData,
          tagTasksMap: newTagTasksMap,
        };
      });
    },
    [fn, setAppData]
  );
};

const useCallbackifyTagsTagTasks = (fn, setAppData) => {
  return useCallback(
    (...args) => {
      return setAppData((appData: AppData) => {
        const { newTagMap, newTagTasksMap } = fn(
          appData.tagMap,
          appData.tagTasksMap,
          ...args
        );
        return {
          ...appData,
          tagMap: newTagMap,
          tagTasksMap: newTagTasksMap,
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
        const { newTagTasksMap, newTaskMap } = fn(
          appData.tagTasksMap,
          appData.taskMap,
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

export default function TagContainer(props) {
  const { tagId, appData, setAppData } = props;
  const { tagMap, taskMap, tagTasksMap, plannedTaskIdList } = appData;
  const tag = tagMap[tagId];
  const fancy = true;
  const toggleFoldCallBack = useCallbackifyTags(tagToggleFoldV2, setAppData);
  const setTagNameCallback = useCallbackifyTags(setTagNameV2, setAppData);
  const unfoldAllCallBack = useCallbackifyTags(
    unfoldAllDescendantsV2,
    setAppData
  );
  const foldAllCallback = useCallbackifyTags(foldAllDescendantsV2, setAppData);
  const addChildTagCallback = useCallbackifyTagsTagTasks(
    addChildTagV2,
    setAppData
  );
  const createTaskInTagCallback = useCallbackifyTasksTagTasks(
    createTaskInTagV2,
    setAppData
  );
  const moveTagToTagCallback = useCallbackifyTags(moveTagToTagV2, setAppData);
  const moveTasksToTagCallback = useCallbackifyTagTasks(
    moveTasksToTagV2,
    setAppData
  );

  return (
    <Tag
      name={tag.name}
      id={tag.id}
      unfolded={tag.unfolded}
      setTagName={setTagNameCallback}
      toggleFold={toggleFoldCallBack}
      addSubTopic={addChildTagCallback}
      moveTopic={moveTagToTagCallback}
      unfoldAll={unfoldAllCallBack}
      foldAll={foldAllCallback}
      //   selectedTasks={selectedTasks}
      addTask={createTaskInTagCallback}
      moveTasks={moveTasksToTagCallback}
      //   duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
      //   deleteTopic={getDeleteTopic(setTopics, topics, setTasks, tasks, topic.id)}
      fancy={fancy}
    />
  );
}
