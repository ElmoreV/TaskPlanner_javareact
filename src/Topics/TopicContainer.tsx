import { memo } from "react";
import {
  getDeleteTopic,
  getDuplicateTask,
  getMoveTopic,
  getAddTask,
  getAddSubtopic,
  getMoveTasks,
} from "../ADG/ModifyFuncGeneratorsV1.ts";
import {
  getToggleFold,
  getSetTopicNameFunc,
  getUnfoldAll,
  getFoldAll,
} from "../Topics/TopicModifyFuncGens.js";
import Topic from "./Topic.js";

export default function TopicContainer(props) {
  const { topic, appData, setAppData, selectedTasks, fancy } = props;
  const { topics, tasks } = appData;
  const setTasks = (newTasks) => {
    setAppData({ ...appData, tasks: newTasks });
  };
  const setTopics = (newTopics) => {
    setAppData({ ...appData, topics: newTopics });
  };

  // TODO: useCallbackify all topic modification functions (but maybe later)

  return (
    <Topic
      name={topic.name}
      id={topic.id}
      unfolded={topic.unfolded}
      selectedTasks={selectedTasks}
      setTopicName={getSetTopicNameFunc(setTopics, topics, topic.id)}
      toggleFold={getToggleFold(setTopics, topics)}
      addSubTopic={getAddSubtopic(setTopics, topics, topic)}
      moveTopic={getMoveTopic(setTopics, topics)}
      addTask={getAddTask(setTasks, tasks, topics, topic.id)}
      moveTasks={getMoveTasks(topics, tasks, setTasks)}
      unfoldAll={getUnfoldAll(setTopics, topics)}
      foldAll={getFoldAll(setTopics, topics)}
      duplicateTask={getDuplicateTask(setTasks, tasks, topics)}
      deleteTopic={getDeleteTopic(setAppData, appData, topic.id)}
      fancy={fancy}
    />
  );
}
