import { AppDataV1 } from "../Structure/AppDataTypes.ts";
import { V1_Task, V1_Topic } from "../Structure/V1_types.ts";
import {
  getFreeTopicKeyV1,
  disconnectTopicsByIdV1_r,
} from "../Topics/TopicHelperV1.ts";
import {
  findSupertopicByTopicIdV1,
  findTaskByTaskIdV1,
  findTopicByTopicIdV1,
  isTaskInSubTaskTree,
} from "./FindItemsV1.ts";
import {
  addOrphanTasktoTaskListV1,
  deleteEntireTaskV1,
  generateEmptyTaskV1,
  insertTaskInstanceIntoTaskV1,
  insertTaskInstanceIntoTopicV1,
  removeTaskInstanceFromTopicV1,
  removeTaskInstanceFromTaskV1,
} from "./ModifyTaskTopicAdgElementsV1.ts";

// Now need four functions
// Move from task in topic to subtask in task
// Move from task in subtask to subtask in other task
// Move from task in subtask to task in topic
// Move from task in topic to task in topic

const getMoveTasks = (
  topics: V1_Topic[],
  tasks: V1_Task[],
  setTasks: (tasks: V1_Task[]) => void
) => {
  // taskIds here is the id of the task
  // sourceTopicIds is the topic-object where the task came from
  // targetTopicId is the topic-object where the task is going to
  // const moveTasks = (taskIds, sourceTopicIds, targetTopicId, targetViewIndex) => {
  const moveTasks = (
    taskIds: number[],
    sourceTopicIds: number[],
    sourceTaskIds: number[],
    targetTopicId: number,
    targetViewIndex: number,
    targetTaskId: number
  ) => {
    // Validation checks + defaults

    if (!Array.isArray(taskIds)) {
      taskIds = [taskIds];
    }
    if (!Array.isArray(sourceTopicIds)) {
      sourceTopicIds = [sourceTopicIds];
    }
    if (!Array.isArray(sourceTaskIds)) {
      sourceTaskIds = [sourceTaskIds];
    }
    if (sourceTaskIds.length != taskIds.length) {
      console.error(
        "The length of the taskIds and sourceTopicIds should be the same"
      );
      return;
    }

    let newTasks = [...tasks];
    if (targetTopicId) {
      const targetTopic = findTopicByTopicIdV1(topics, targetTopicId);
      if (!targetTopic) {
        console.warn(`Target topic ${targetTopicId} does not exist.`);
        return;
      }
    } else if (targetTaskId) {
      const targetTask = findTaskByTaskIdV1(tasks, targetTaskId);
      if (!targetTask) {
        console.warn(`Target super task ${targetTaskId} does not exist.`);
        return;
      }
    } else {
      console.warn(
        "Either targetTaskId or targetTopicId needs to be specified."
      );
    }

    // go through all 'operations' 1-by-1
    taskIds.forEach((taskId, idx) => {
      let sourceTopicId = sourceTopicIds[idx];
      let sourceTaskId = sourceTaskIds[idx];
      let moveAllowed = true;
      if (targetTaskId) {
        moveAllowed = !isTaskInSubTaskTree(tasks, targetTaskId, taskId);
      }
      if (!moveAllowed) {
        console.warn(
          `Move of task id ${taskId} to task with id ${targetTaskId} is not allowed: task already in target task subtree.`
        );
      }

      // Removing from source location (task or topic)
      if (sourceTopicId) {
        if (moveAllowed) {
          newTasks = removeTaskInstanceFromTopicV1(
            newTasks,
            taskId,
            sourceTopicId
          );
        }
      } else if (sourceTaskId) {
        if (moveAllowed) {
          newTasks = removeTaskInstanceFromTaskV1(
            newTasks,
            taskId,
            sourceTaskId
          );
        }
      } else {
        console.warn(`No source (task or topic) defined for  ${taskId}.`);
        // return
      }
      // Adding to destination location (task or topic)
      if (targetTopicId) {
        // If the task is already in the targetTopic, remove it
        let taskTopics = newTasks.find((task) => task.id == taskId);
        if (taskTopics.topics.includes(targetTopicId)) {
          console.info(`Task ${taskId} is already in topic ${targetTopicId}`);

          newTasks = removeTaskInstanceFromTopicV1(
            newTasks,
            taskId,
            targetTopicId
          );
        }
        newTasks = insertTaskInstanceIntoTopicV1(
          newTasks,
          taskId,
          targetTopicId,
          targetViewIndex
        );
      } else if (targetTaskId) {
        // If task already in target supertask, remove it
        if (moveAllowed) {
          let superTask = newTasks.find((task) => task.id === targetTaskId);
          console.log(superTask);
          if (superTask.subTaskIds && superTask.subTaskIds.includes(taskId)) {
            console.info(
              `Task ${taskId} is already in supertask ${targetTaskId}`
            );
            newTasks = removeTaskInstanceFromTaskV1(
              newTasks,
              taskId,
              targetTaskId
            );
          }
          // TODO: prevent a cycle to exist (task1<-task2<-task1<-task2<-...)
          if (superTask.subTaskIds === undefined) {
            superTask.subTaskIds = [];
          }
          console.log(superTask);
          let alreadyExisting = isTaskInSubTaskTree(
            tasks,
            targetTaskId,
            taskId
          );
          console.log(alreadyExisting);
          console.log(
            `Task ${taskId} already exists somewhere within task ${targetTaskId}`
          );

          newTasks = insertTaskInstanceIntoTaskV1(
            newTasks,
            taskId,
            targetTaskId
          );
          console.log(superTask);
        }
      }
    });
    setTasks(newTasks);
  };
  return moveTasks;
};

const getDuplicateTask = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[],
  topics: V1_Topic[]
) => {
  const duplicateTask = (
    taskIds: number[],
    targetTopicId: number,
    targetViewIndex: number
  ) => {
    // Validation checks + defaults
    // Convert single items to a list
    if (!Array.isArray(taskIds)) {
      taskIds = [taskIds];
    }
    if (targetViewIndex === undefined) {
      targetViewIndex = 1;
    }
    const targetTopic = findTopicByTopicIdV1(topics, targetTopicId);
    if (!targetTopic) {
      console.warn(`Target topic ${targetTopicId} does not exist.`);
      return;
    }

    // Copy tasks
    let newTasks = [...tasks];
    taskIds.forEach((taskId) => {
      const task_to_change = newTasks.find((task) => task.id == taskId);
      if (task_to_change.topics.includes(targetTopicId)) {
        console.info(
          `Task ${task_to_change.id} is already in topic ${targetTopicId}`
        );
        return;
      }
      newTasks = insertTaskInstanceIntoTopicV1(
        newTasks,
        taskId,
        targetTopicId,
        targetViewIndex
      );
    });
    setTasks(newTasks);
  };
  return duplicateTask;
};

const getAddTaskWithoutTopic = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[]
) => {
  const addTaskWithoutTopic = () => {
    // Check if topic belonging to topicId exists
    // Find tasks in the topic
    // generate a new task
    // insert it into the new topic
    let newTasks = [...tasks];
    let newTask = generateEmptyTaskV1(newTasks);
    newTasks = addOrphanTasktoTaskListV1(newTasks, newTask);
    setTasks(newTasks);
  };
  return addTaskWithoutTopic;
};

const getAddTask = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[],
  topics: V1_Topic[],
  topicId: number
) => {
  const addTask = () => {
    // Check if topic belonging to topicId exists
    // Find tasks in the topic
    // generate a new task
    // insert it into the new topic
    let newTasks = [...tasks];
    const topic = findTopicByTopicIdV1(topics, topicId);
    if (!topic) {
      return;
    }
    let newTask = generateEmptyTaskV1(newTasks);
    newTasks = addOrphanTasktoTaskListV1(newTasks, newTask);
    newTasks = insertTaskInstanceIntoTopicV1(newTasks, newTask.id, topicId, 1);
    setTasks(newTasks);
  };
  return addTask;
};

const getAddNewSubTask = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[],
  superTaskId: number
) => {
  const addTask = () => {
    let newTasks = [...tasks];
    // Check if supertask belonging to superTaskId exists
    // Generate new (sub)task
    // insert it into (super)task
    const superTask = findTaskByTaskIdV1(tasks, superTaskId);
    if (!superTask) {
      return;
    }
    if (superTask.subTaskIds == undefined) {
      superTask.subTaskIds = [];
    }
    let newSubTask = generateEmptyTaskV1(newTasks);
    newTasks = addOrphanTasktoTaskListV1(newTasks, newSubTask);

    newTasks = insertTaskInstanceIntoTaskV1(
      newTasks,
      newSubTask.id,
      superTaskId
    );
    setTasks(newTasks);
  };
  return addTask;
};

const getDeleteTask = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[],
  id: number
) => {
  const deleteTask = () => {
    let newTasks = deleteEntireTaskV1(tasks, id);
    setTasks(newTasks);
  };
  return deleteTask;
};

/////////////////////////
/// Changing topics
//////////////////////////

// Both for v0 and v1 data
const getMoveTopic = (
  setTopics: (topics: V1_Topic[]) => void,
  topics: V1_Topic[]
) => {
  const moveTopic = (source_id, target_id) => {
    console.info(`Moving topic ${source_id} to ${target_id}`);
    // Cannot move a topic into one of its sub(sub)topics
    let source_topic = findTopicByTopicIdV1(topics, source_id);
    console.info(source_topic);
    let is_sub_topic = findTopicByTopicIdV1(source_topic.subtopics, target_id);
    if (is_sub_topic) {
      console.log("Cannot move a topic to its own subtopic");
      return;
    }
    // If the target topic is the sources topic direct supertopic, also don't do it
    // Find the super topic of the source topic
    let newTopics = [...topics];
    let source_supertopic = findSupertopicByTopicIdV1(newTopics, source_id);
    if (!source_supertopic) {
      console.log("There is no supertopic. Is this a root topic?");
      let target_topic = findTopicByTopicIdV1(newTopics, target_id);
      console.info(target_topic);
      console.info(source_supertopic);
      // Copy the topic into the new topic
      target_topic.subtopics.push(source_topic);
      // Delete the topic out of its current spot
      newTopics = newTopics.filter((t) => t.id != source_topic.id);
      setTopics(newTopics);
      return;
    }
    if (source_supertopic.id == target_id) {
      console.log(
        "Will not move a topic to its direct supertopic. It does nothing"
      );
      return;
    }
    let target_topic = findTopicByTopicIdV1(newTopics, target_id);
    console.info(target_topic);
    console.info(source_supertopic);
    // Copy the topic into the new topic
    target_topic.subtopics.push(source_topic);
    // Delete the topic out of its current spot
    source_supertopic.subtopics = source_supertopic.subtopics.filter(
      (t) => t.id != source_topic.id
    );
    setTopics(newTopics);
  };
  return moveTopic;
};

const getAddTopic = (
  setTopics: (topics: V1_Topic[]) => void,
  topics: V1_Topic[]
) => {
  const addTopic = () => {
    let newTopics = [...topics];
    const addedTopic = {
      name: `New Topic ${getFreeTopicKeyV1(topics)}`,
      id: getFreeTopicKeyV1(topics),
      unfolded: true,
      subtopics: [],
    };
    newTopics.unshift(addedTopic);
    setTopics(newTopics);
  };
  return addTopic;
};

// This one might be separated
const addSubtopic_r = (
  topic: V1_Topic,
  superTopic: V1_Topic,
  newSubTopic: V1_Topic
) => {
  if (topic.id == superTopic.id) {
    //Add subtopic here
    topic.subtopics = [newSubTopic, ...topic.subtopics];
    return topic;
  } else {
    //recurse through all subtopics
    return {
      ...topic,
      subtopics: topic.subtopics.map((topic) =>
        addSubtopic_r(topic, superTopic, newSubTopic)
      ),
    };
  }
};

const getAddSubtopic = (
  setTopics: (topics: V1_Topic[]) => void,
  topics: V1_Topic[],
  superTopic: V1_Topic
) => {
  // console.log("Creating add subtopic")
  // console.log(topic);
  // console.log(topics)

  const addSubtopic = () => {
    console.log("In AddSubTopic");
    console.log(superTopic);
    console.log(topics);
    let newTopics = [...topics];
    const addedTopic = {
      name: `New Topic ${getFreeTopicKeyV1(topics)}`,
      id: getFreeTopicKeyV1(topics),
      unfolded: true,
      subtopics: [],
    };
    console.log(addedTopic);
    console.log("start recursion");
    // now add this topic at the exact right spot
    // recurse through newTopics
    // and return the changed topic if it is the right topic
    newTopics = newTopics.map((topic_r) =>
      addSubtopic_r(topic_r, superTopic, addedTopic)
    );
    setTopics(newTopics);
  };
  return addSubtopic;
};

////////////////////////////
/////  Sanitize topic and task order
/////////////////////////////

const checkValidTopicOrderIndex = (topics: V1_Topic[], tasks: V1_Task[]) => {
  // Every task needs to have as many topicOrderIndices as they have topics
  const getWrongTasks = tasks.filter(
    (task) => task.topicViewIndices === undefined
  );
  if (getWrongTasks.length > 0) {
    console.warn("There are tasks that don't have topicViewIndices");
    console.warn(getWrongTasks);
    return false;
  }
  let getWrongTasks2 = tasks.filter(
    (task) => task.topics.length != task.topicViewIndices.length
  );
  if (getWrongTasks2.length > 0) {
    console.warn(
      "There are tasks that don't have the same amount of topicViewIndices as topics"
    );
    console.warn(getWrongTasks2);
    return false;
  }

  return true;
};

const sanitizeTopicOrderIndex = (
  topics: V1_Topic[],
  tasks: V1_Task[],
  setTasks: (tasks: V1_Task[]) => void
) => {
  let newTasks = [...tasks];
  if (checkValidTopicOrderIndex(topics, tasks)) {
    return;
  }
  console.warn("Found invalid topicOrderIndex. Reordering...");
  const sanitize_r = (topics: V1_Topic[], tasks: V1_Task[]) => {
    newTasks = [...tasks];
    for (let topic of topics) {
      //Iterate through subtopics and update tasks
      newTasks = sanitize_r(topic.subtopics, newTasks);
      // are there tasks in this topic?
      let tasksInTopic = newTasks.filter((task) =>
        task.topics.includes(topic.id)
      );
      console.debug(
        `Tasks ${tasksInTopic.map((t) => t.name)} in topic ${topic.name}`
      );
      // if there are tasks in this topic, give them an order index
      nextOrderVal = 0;
      tasksInTopic.forEach((task) => {
        let reduceFn: (
          acc: number[],
          topicId: number,
          idx: number
        ) => number[] = (acc, topicId, idx) =>
          topicId === topic.id ? [...acc, idx] : acc;
        let idcs = task.topics.reduce(reduceFn, []);
        if (!task.topicViewIndices) {
          task.topicViewIndices = new Array();
        }
        idcs.forEach((idx) => {
          task.topicViewIndices[idx] = nextOrderVal;
          nextOrderVal += 1;
        });
      });
    }
    return newTasks;
  };

  // Recurse through all topics+tasks and fix the order.
  let nextOrderVal = 1;
  newTasks = sanitize_r(topics, tasks);
  console.log(newTasks);
  setTasks(newTasks);
};

////////////////////////
//// Fix Week Order Indices
///////////////////////////

const checkValidWeekOrderIndex = (tasks: V1_Task[]) => {
  // Check if there are undefined values
  const getWrongTasks = tasks.filter(
    (task) => task.weekOrderIndex == undefined
  );
  if (getWrongTasks.length > 0) {
    return false;
  }
  // Check if the values are not 0 for tasks where task.thisWeek=false
  const getWrongTasks2 = tasks.filter(
    (task) => !task.thisWeek && task.weekOrderIndex != 0
  );
  if (getWrongTasks2.length > 0) {
    return false;
  }
  // TODO: sdf
  // Check if the values are not exactly 1,2,3,4,....
  const getWrongTasks3 = tasks.filter(
    (task) => task.thisWeek && task.weekOrderIndex < 1
  );
  if (getWrongTasks3.length > 0) {
    return false;
  }
  // Check if there are duplicate weekOrderIndices
  const getWrongTasks4 = tasks
    .filter((task) => task.thisWeek)
    .map((task) => task.weekOrderIndex);
  if (new Set(getWrongTasks4).size !== getWrongTasks4.length) {
    return false;
  }
  // TODO:

  return true;
};

const sanitizeWeekOrderIndex2 = (tasks: V1_Task[]) => {
  let newTasks = [...tasks];
  if (checkValidWeekOrderIndex(tasks)) {
    return newTasks;
  }

  //gather all the tasks with and without a weekOrderIndex
  // if thisWeek=false: weekOrderIndex = 0
  // if thisWeek=true: weekOrderIndex = value
  let nextVal = 1;
  newTasks = newTasks.map((task) => {
    if (!task.thisWeek) {
      task.weekOrderIndex = 0;
    } else {
      task.weekOrderIndex = nextVal;
      nextVal += 1;
    }
    return task;
  });

  return newTasks;
};

const sanitizeWeekOrderIndex = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[]
) => {
  let newTasks = [...tasks];
  if (checkValidWeekOrderIndex(tasks)) {
    return;
  }
  console.warn("Found invalid weekOrderIndex. Reordering...");
  //gather all the tasks with and without a weekOrderIndex
  // if thisWeek=false: weekOrderIndex = 0
  // if thisWeek=true: weekOrderIndex = value
  let nextVal = 1;
  newTasks = newTasks.map((task) => {
    if (!task.thisWeek) {
      task.weekOrderIndex = 0;
    } else {
      task.weekOrderIndex = nextVal;
      nextVal += 1;
    }
    return task;
  });

  setTasks(newTasks);
};

// TODO: make this way nicer. This feels wacked.
const getChangeWeekOrderIndex = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[]
) => {
  const changeWeekOrderIndex = (
    taskIds: number[],
    sourceWeekOrderIndices: number[],
    targetWeekOrderIndex: number
  ) => {
    console.log(taskIds, sourceWeekOrderIndices, targetWeekOrderIndex);

    if (!Array.isArray(taskIds)) {
      taskIds = [taskIds];
    }
    if (!Array.isArray(sourceWeekOrderIndices)) {
      sourceWeekOrderIndices = [sourceWeekOrderIndices];
    }
    console.log(taskIds, sourceWeekOrderIndices, targetWeekOrderIndex);

    // Sort the tasks and sourceWeekOrderIndices by their sourceWeekOrderIndex
    let zipped = taskIds.map((el, idx) => [el, sourceWeekOrderIndices[idx]]);
    zipped = zipped.sort((a, b) => a[1] - b[1]);
    // Remove duplicate task Ids
    zipped = zipped.filter(
      (el, idx, self) => self.findIndex((t) => t[0] === el[0]) === idx
    );
    // Exclude any tasks that are the target
    zipped = zipped.filter((el) => el[1] !== targetWeekOrderIndex);
    taskIds = zipped.map((el) => el[0]);
    sourceWeekOrderIndices = zipped.map((el) => el[1]);
    console.log(taskIds, sourceWeekOrderIndices, targetWeekOrderIndex);

    let newTasks = [...tasks];
    console.log(
      newTasks.filter((t) => t.thisWeek).map((t) => [t.name, t.weekOrderIndex])
    );

    let tasksBeforeTarget = sourceWeekOrderIndices.filter(
      (idx) => idx < targetWeekOrderIndex
    ).length;
    let direction = 0;

    // If the target task is before the source task, move all tasks between source tasks and target task up
    // Includes target task
    if (targetWeekOrderIndex < sourceWeekOrderIndices[0]) {
      // Reorder all tasks squeezed between the source tasks and the target task
      newTasks = newTasks.map((task) => {
        // Count the number of tasks that are marked to move that are  this task
        let tasksBefore = sourceWeekOrderIndices.filter(
          (idx) => idx < task.weekOrderIndex
        ).length;
        let tasksAfter = sourceWeekOrderIndices.filter(
          (idx) => idx > task.weekOrderIndex
        ).length;
        // Move all tasks squeezed, which aren't marked to move
        if (task.thisWeek && !taskIds.includes(task.id)) {
          if (task.weekOrderIndex >= targetWeekOrderIndex) {
            task.weekOrderIndex += tasksAfter;
          } else {
            task.weekOrderIndex -= tasksBefore;
          }
        }
        return task;
      });

      // If the target task is after the first source task, move all tasks between source tasks and target task down
    } else if (targetWeekOrderIndex > sourceWeekOrderIndices[0]) {
      // move all indices behind this target task
      newTasks = newTasks.map((task) => {
        // Count the number of tasks that are marked to move that are before this task
        let tasksBefore = sourceWeekOrderIndices.filter(
          (idx) => idx <= task.weekOrderIndex
        ).length;
        let tasksAfter = sourceWeekOrderIndices.filter(
          (idx) => idx > task.weekOrderIndex
        ).length;
        if (task.thisWeek && !taskIds.includes(task.id)) {
          if (task.weekOrderIndex <= targetWeekOrderIndex) {
            task.weekOrderIndex -= tasksBefore;
          } else {
            task.weekOrderIndex += tasksAfter;
          }
        }
        return task;
      });
      direction = -tasksBeforeTarget + 1;
    }
    console.log(
      newTasks.filter((t) => t.thisWeek).map((t) => [t.name, t.weekOrderIndex])
    );

    const tasks_to_change = newTasks.filter((task) =>
      taskIds.includes(task.id)
    );
    const tasks_to_change_indices = tasks_to_change.map((task, idx) => idx);

    // Change the weekOrderIndex of the tasks to change
    tasks_to_change.forEach((task) => {
      task.weekOrderIndex =
        targetWeekOrderIndex +
        tasks_to_change_indices[taskIds.indexOf(task.id)] +
        direction;
    });

    console.log(
      newTasks.filter((t) => t.thisWeek).map((t) => [t.name, t.weekOrderIndex])
    );

    setTasks(newTasks);
  };
  return changeWeekOrderIndex;
};

////////////////////////////////
/// Changing both topics and tasks
///////////////////////////////
const findAllSubtopicIds_r = (
  topics: V1_Topic[],
  topicId: number,
  inside: boolean
) => {
  let idList: number[] = [];
  topics.forEach((topic) => {
    // If this is inside the hierarchy, return this topic id and all subtopics
    if (inside || topicId === topic.id) {
      idList.push(topic.id);
      idList = idList.concat(
        findAllSubtopicIds_r(topic.subtopics, topicId, true)
      );
    } else {
      // Or go deeper to find it
      idList = idList.concat(
        findAllSubtopicIds_r(topic.subtopics, topicId, false)
      );
    }
  });
  return idList;
};

const findAllSubtopicIds = (topics: V1_Topic[], topicId: number) => {
  return findAllSubtopicIds_r(topics, topicId, false);
};

// For v1 data
const getDeleteTopic = (
  setAppData: (appData: AppDataV1) => void,
  appData: AppDataV1,
  topicId: number
) => {
  const deleteTopic = () => {
    let newTopics = [...appData.topics];
    // 1. Find all topic ids that will be removed
    // 2. Remove topic id and its subtopics from topics
    // 3. Remove the topic ids from all relevant tasks
    // 4. Remove empty tasks

    // Find all topic ids that will be removed
    let idList = findAllSubtopicIds(newTopics, topicId);
    // Filter out any topic that is a subtopic of topicId, recursively
    newTopics = disconnectTopicsByIdV1_r(newTopics, topicId);
    // Removing task instances
    let newTasks = [...appData.tasks];
    // Filter tasks that have overlap in idList and task.topics
    let tasksToRemove = newTasks.filter((task) =>
      task.topics.some((taskTopicId) => idList.includes(taskTopicId))
    );

    // For every task, find the task instances that are to be removed
    // and remove them
    tasksToRemove.forEach((task) => {
      let overlappingIdList = idList.filter((topicIdToRemove) =>
        task.topics.includes(topicIdToRemove)
      );
      overlappingIdList.forEach((id) => {
        removeTaskInstanceFromTopicV1(newTasks, task.id, id);
      });
    });

    // Filter out tasks without instances (not inside any topic OR in any supertask)
    let subTaskIds = newTasks.reduce<number[]>(
      (acc, curr) => acc.concat(curr.subTaskIds),
      []
    );
    newTasks = newTasks.filter(
      (task) => task.topics.length > 0 || subTaskIds.includes(task.id)
    );
    console.info(
      "Length of tasks before deletion/length of tasks after deletion"
    );
    console.info(appData.tasks.length + " -> " + newTasks.length);

    setAppData({ ...appData, topics: newTopics, tasks: newTasks });
  };
  return deleteTopic;
};

const getSpawnNewTask = (
  setTasks: (tasks: V1_Task[]) => void,
  tasks: V1_Task[],
  sourceTask: V1_Task
) => {
  const spawnNewTask = () => {
    // From the source task
    // Spawn a new task in the same topics
    // Just below the old source task in Topic View
    // And below the old source task in the Planned View
    let newTasks = [...tasks];
    let spawnedTask = generateEmptyTaskV1(tasks);
    spawnedTask.name = sourceTask.name + " spawn";
    newTasks = addOrphanTasktoTaskListV1(newTasks, spawnedTask);
    sourceTask.topics.forEach((val, idx) => {
      insertTaskInstanceIntoTopicV1(
        newTasks,
        spawnedTask.id,
        sourceTask.topics[idx],
        sourceTask.topicViewIndices[idx]
      );
    });

    newTasks = newTasks.map((task) => {
      if (task.thisWeek) {
        task.weekOrderIndex += 1;
      }
      return task;
    });
    spawnedTask.thisWeek = true;
    spawnedTask.weekOrderIndex = 1;
    // console.log(newTasks.map((task) => {
    //     if (task.thisWeek) { return [task.name, task.weekOrderIndex] }
    // }))
    setTasks(newTasks);

    // setTasks(newTasks)
  };
  return spawnNewTask;
};

export { getDeleteTask };
export { getDeleteTopic };
export { getDuplicateTask };
export { getMoveTopic };
export { getAddTask };
export { getAddTopic };
export { getAddSubtopic };
export { getChangeWeekOrderIndex };
export { sanitizeWeekOrderIndex };
export { sanitizeWeekOrderIndex2 };
export { sanitizeTopicOrderIndex };
export { getMoveTasks };
export { getSpawnNewTask };
export { getAddNewSubTask };
export { getAddTaskWithoutTopic };
