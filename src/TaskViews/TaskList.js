import React from "react";
import { useState, useEffect } from "react";
import {
  getAddTopic,
  sanitizeTopicOrderIndex,
} from "../ADG/ModifyFuncGeneratorsV1.ts";
import { getUnfoldAll, getFoldAll } from "../Topics/TopicModifyFuncGens.js";
import { FinishedState } from "../Tasks/TaskInterfaces.tsx";
import { isTaskDueIn, convertDueDateNameToSeconds } from "../Timing.ts";
import TopicContainer from "../Topics/TopicContainer.tsx";
import TaskContainer from "./TaskContainer.tsx";
import { convert_v1_to_v2 } from "../Converters/Migration_V1_V2/UpdateV1ToV2.ts";

const isNewTask = (task, allSubTaskIds) => {
  return task.topics.length == 0 && !allSubTaskIds.includes(task.id);
};

const isTaskVisible = (
  task,
  hideCompletedItems,
  showRepeatedOnly,
  dueInSeconds,
) => {
  return (
    !(
      (task.completed ||
        (task.finishStatus !== undefined &&
          task.finishStatus !== FinishedState.NotFinished)) &&
      hideCompletedItems
    ) &&
    (task.repeated || !showRepeatedOnly) &&
    (!dueInSeconds || isTaskDueIn(task, new Date(), dueInSeconds))
  );
};

const TaskList = (props) => {
  const { appData, setAppData, fancy } = props;
  const { topics, tasks } = appData;
  const setTasks = (newTasks) => {
    setAppData({ tasks: newTasks, ...appData });
  };
  const setTopics = (newTopics) => {
    setAppData({ topics: newTopics, ...appData });
  };
  console.debug("Rendering TaskList");

  const [hideCompletedItems, setHideCompletedItems] = useState(true);
  const [showRepeatedOnly, setShowRepeatedOnly] = useState(false);
  const [dueTimeInSeconds, setDueTimeInSeconds] = useState(undefined);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [runOnce, setRunOnce] = useState(false);
  const [needTransitiveUpdate, setNeedTransitiveUpdate] = useState(true);

  const testFunction = () => {
    console.log(tasks);
    console.log(topics);
  };

  useEffect(() => {
    // Function to clear selection
    const clearSelectionOnClickOutside = (event) => {
      // if (selectedTasks.length > 0)
      console.log(selectedTasks);
      setSelectedTasks([]);
      // else
      //     console.log("Empty selection")
    };

    // Add global click listener
    document.addEventListener("click", clearSelectionOnClickOutside);

    // Remove the event listener on cleanup
    return () => {
      document.removeEventListener("click", clearSelectionOnClickOutside);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const onHideCompletedItemsChange = () => {
    setHideCompletedItems(!hideCompletedItems);
  };

  const onShowRepeatedOnlyChange = () => {
    setShowRepeatedOnly(!showRepeatedOnly);
  };

  const handleFoldAll = () => {
    let foldAll = getFoldAll(setTopics, topics);
    topics.map((topic) => foldAll(topic.id));
  };

  const handleUnfoldAll = () => {
    let unfoldAll = getUnfoldAll(setTopics, topics);
    topics.map((topic) => unfoldAll(topic.id));
  };

  const onDueDateChange = (event) => {
    let dueDateName = event.target.value;
    console.log(dueDateName);
    console.log(convertDueDateNameToSeconds(dueDateName));
    setDueTimeInSeconds(convertDueDateNameToSeconds(dueDateName));
  };

  const showTopics = () => {
    console.info("Re-rendering task list");
    return topics.map((topic) => recursiveShowTopic(topic));
  };

  const recursiveShowTopic = (topic) => {
    // 1. Show topic
    // 2. Show all subtopics (and their subtopics and tasks)
    // 3. Show all tasks

    // Do not show subtopics when Topic is folded
    const findTopicViewIdx = (topicId, task) => {
      return task.topicViewIndices[
        task.topics.findIndex((taskTopicId) => taskTopicId == topicId)
      ];
    };

    // Return the following HTML structure
    //  <div div_topic_id>
    //      <li>
    //          <Topic>
    //      <ul>
    //          Other subtopics
    //      <ul>
    //          Tasks inside of topic
    return (
      <div key={"div_" + topic.id}>
        <li key={topic.id}>
          <TopicContainer
            topic={topic}
            appData={appData}
            setAppData={setAppData}
            selectedTasks={selectedTasks}
            fancy={fancy}
          />
        </li>
        <ul key={topic.id + "_topics"}>
          {topic.unfolded &&
            topic.subtopics.map((subtopic) => recursiveShowTopic(subtopic))}
        </ul>
        <ul key={topic.id + "_tasks"}>
          {topic.unfolded &&
            tasks
              .filter((task) => task.topics.includes(topic.id))
              .filter((task) =>
                isTaskVisible(
                  task,
                  hideCompletedItems,
                  showRepeatedOnly,
                  dueTimeInSeconds,
                ),
              )
              .slice(0)
              .sort((taskA, taskB) => {
                return (
                  findTopicViewIdx(topic.id, taskA) -
                  findTopicViewIdx(topic.id, taskB)
                );
              })
              .map((task) => recursiveShowTask(topic, null, task))}
        </ul>
      </div>
    );
  };

  const recursiveShowTask = (topic, superTask, task) => {
    // 1. Show task
    // 2. Show all subtasks

    // Return the following HTML structure
    //  <>
    //      <li topic.id - suipertask.id - task id>
    //      <Task>
    //      <ul>
    //          subtasks
    //
    return (
      <>
        <li
          key={
            (topic && topic.id) +
            "-" +
            (superTask && superTask.id) +
            " - " +
            task.id
          }
        >
          <TaskContainer
            task={task}
            topic={topic}
            superTask={superTask}
            setAppData={setAppData}
            selectedTasks={selectedTasks}
            setSelectedTasks={setSelectedTasks}
            fancy={fancy}
          />
        </li>
        {task.subTaskIds && task.subTaskIds.length > 0 && task.unfolded && (
          <ul>
            {tasks
              // .map(t=>{console.log("Hi, I'm a subtask"+t);return t})
              .filter((subTask) => task.subTaskIds.includes(subTask.id))
              .filter((subTask) =>
                isTaskVisible(
                  subTask,
                  hideCompletedItems,
                  showRepeatedOnly,
                  dueTimeInSeconds,
                ),
              )
              // TODO: ordering of subtasks
              .map((subTask) => recursiveShowTask(null, task, subTask))}
          </ul>
        )}
      </>
    );
  };

  const showTasksWithoutTopics = (allSubTaskIds) => {
    return (
      <div key="div_tasks_no_topic">
        {tasks
          .filter((task) => isNewTask(task, allSubTaskIds))
          .filter((subTask) =>
            isTaskVisible(
              subTask,
              hideCompletedItems,
              showRepeatedOnly,
              dueTimeInSeconds,
            ),
          )
          .map((task) => recursiveShowTask(null, null, task))}
      </div>
    );
  };

  let allSuperTasks = tasks.filter(
    (task) => task.subTaskIds && task.subTaskIds.length > 0,
  );
  let allSubTaskIds = allSuperTasks.reduce((acc, task) => {
    acc = acc.concat(task.subTaskIds);
    return acc;
  }, []);

  if (runOnce < 2) {
    console.log("Running sanitize");
    sanitizeTopicOrderIndex(topics, tasks, setTasks);
    // setRunOnce(runOnce + 1)
  }

  const updateTransitiveDueDate_r = (subTaskIds) => {
    return tasks
      .filter((task) => subTaskIds.includes(task.id))
      .reduce((acc, task) => {
        let newDueTime = updateTransitiveDueDate_r(task.subTaskIds);
        acc = safe_min(acc, task.dueTime);
        acc = safe_min(acc, newDueTime);
        console.log(acc);
        return acc;
      }, undefined);
  };

  const safe_min = (a, b) => {
    if (a === undefined && b === undefined) {
      return undefined;
    }
    if (a === undefined) {
      return b;
    }
    if (b === undefined) {
      return a;
    }
    return Math.min(a, b);
  };

  const updateTransitiveDueDate = () => {
    tasks.forEach((task) => {
      console.log(task.name);
      task.transitiveDueTime = safe_min(
        task.dueTime,
        updateTransitiveDueDate_r(task.subTaskIds),
      );
      console.log(task.dueTime);
      console.log(task.transitiveDueTime);
    });
  };

  if (needTransitiveUpdate) {
    console.log("Updating transitive ADG data");
    updateTransitiveDueDate();
    setNeedTransitiveUpdate(false);
  }

  // TODO: add duplicate id recognition and resolving
  // let arr = new Array
  // for (let i in new Range(300)){
  //     arr[i]=0
  // }
  // let taskIdCount = tasks.map((task,idx)=>(arr[task.id])?arr[task.id]+=1:arr[task.id]=1)
  // console.log(taskIdCount)
  // console.log(arr)
  const checkForDuplicateIds = (tasks) => {
    let taskIdCount = new Array();
    tasks.forEach((task, idx) =>
      taskIdCount[idx] ? (taskIdCount[idx] += 1) : (taskIdCount[idx] = 1),
    );
    taskIdCount.forEach((count, taskId) => {
      if (taskIdCount > 1) {
        console.warn(
          `task (id:${taskId}) has ${count} tasks associated with it:`,
        );
        console.warn(tasks.filter((task) => task.id == taskId));
      }
    });
  };
  // checkForDuplicateIds(tasks)

  return (
    <div className="task-list">
      <button onClick={getAddTopic(setTopics, topics)}>
        {" "}
        Add New Root topic
      </button>
      <br />
      <label>
        <input
          type="checkbox"
          name="HideCompletedItems"
          onChange={onHideCompletedItemsChange}
          className="form-check-input"
          defaultChecked={hideCompletedItems}
        />
        Hide finished tasks
      </label>
      <label>
        <input
          type="checkbox"
          name="ShowRepeatedOnly"
          onChange={onShowRepeatedOnlyChange}
          className="form-check-input"
          defaultChecked={setShowRepeatedOnly}
        />
        Show repeated tasks only
      </label>
      <button className="fold_all" onClick={handleFoldAll}>
        Fold all
      </button>
      <button className="unfold_all" onClick={handleUnfoldAll}>
        Unfold all
      </button>
      <select id="select_due_date" name="due_date" onChange={onDueDateChange}>
        <option value="none">Select due time interval</option>
        <option value="setDueDate"></option>
        <option value="30min">30 minutes</option>
        <option value="2hrs">2 hours</option>
        <option value="8hrs">8 hours</option>
        <option value="1day">1 day</option>
        <option value="4day">4 day</option>
        <option value="1week">1 week</option>
        <option value="2week">2 weeks</option>
        <option value="3week">3 weeks</option>
        <option value="1month">1 month</option>
      </select>
      <ul key="root_topics">
        {showTasksWithoutTopics(allSubTaskIds)}
        {showTopics()}
      </ul>
      <button onClick={() => testFunction()}>Test Function</button>
      <button onClick={() => setNeedTransitiveUpdate(true)}>
        Test ADG Update
      </button>
    </div>
  );
};

export default TaskList;
