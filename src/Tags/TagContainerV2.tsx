import { memo, useCallback } from "react";
import Tag from "./TagV2.tsx";
import { TagMap, TagTasksMap, TaskMap } from "../Converters/V2_types";
import {
  tagToggleFoldV2,
  setTagNameV2,
  unfoldAllDescendantsV2,
  foldAllDescendantsV2,
} from "./TagModifyFuncGensV2.ts";
import { addChildTagV2 } from "../ADG/ModifyFuncGeneratorsV2.ts";
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
  const addChildTagCallback = useCallbackifyTagTasks(addChildTagV2, setAppData);
  return (
    <Tag
      name={tag.name}
      id={tag.id}
      unfolded={tag.unfolded}
      setTagName={setTagNameCallback}
      toggleFold={toggleFoldCallBack}
      addSubTopic={addChildTagCallback}
      //   moveTopic={getMoveTopic(setTopics, topics)}
      unfoldAll={unfoldAllCallBack}
      foldAll={foldAllCallback}
      //   selectedTasks={selectedTasks}
      //   addTask={getAddTask(setTasks, tasks, topics, topic.id)}
      //   moveTasks={getMoveTasks(topics, tasks, setTasks)}
      //   duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
      //   deleteTopic={getDeleteTopic(setTopics, topics, setTasks, tasks, topic.id)}
      fancy={fancy}
    />
  );
}
