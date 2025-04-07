import { useState, useRef, useEffect, memo } from "react";
import PropTypes from "prop-types";
import TaskContent from "../Tasks/TaskContent.js";
import React from "react";
import { FinishedState } from "../Structure/TaskInterfaces.tsx";
import {
  translateLastCompletedDatetime,
  translateTimeDifference,
} from "../Tasks/TaskHelperFuncs.js";
import { convertDueDateNameToSeconds, getFutureDate } from "../Timing.ts";

const Task = (props) => {
  const {
    id,
    name,
    setTaskName,
    deleteTask,
    completed,
    completeTask,
    toggleFold,
    unfolded,
    taskFinishStatus,
    setTaskFinishStatus,
    currentTopicName,
    currentTopicId,
    moveTasks,
    currentTopicViewIndex,
    planned,
    plan,
    unplan,
    currentSuperTaskId,
    repeated,
    toggleRepeatTask,
    taskLastCompletion,
    selectedTasks,
    addToSelection,
    deleteFromSelection,
    selected,
    duplicateTask,
    taskTopics,
    addSubTask,
    hasSubTasks,
    fancy,
    setDueTime,
    currentDueTime,
  } = props;
  // console.debug("Rendering Task: " + name)
  const folded_symbol = ">";
  const unfolded_symbol = "v";

  if (taskFinishStatus === undefined) {
  }

  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);
  let isDuplicateDragging = false;

  // let repeated = true
  const markTaskIrrelevant = () => {
    if (taskFinishStatus == FinishedState.Irrelevant) {
      setTaskFinishStatus(id, FinishedState.NotFinished);
    } else {
      setTaskFinishStatus(id, FinishedState.Irrelevant);
    }
  };

  const markTaskImpossible = () => {
    if (taskFinishStatus == FinishedState.Impossible) {
      setTaskFinishStatus(id, FinishedState.NotFinished);
    } else {
      setTaskFinishStatus(id, FinishedState.Impossible);
    }
  };

  const handleChange = (e) => {
    console.info(e.target.value);
    setTaskName(id, e.target.value);
  };

  const handleDragStart = (e) => {
    if (isDuplicateDragging) {
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData("Type", "Task");
    e.dataTransfer.setData("TaskId", id);
    e.dataTransfer.setData("TopicName", currentTopicName);
    e.dataTransfer.setData("TopicId", currentTopicId);
    e.dataTransfer.setData("SuperTaskId", currentSuperTaskId);
    console.info("Dragging task");
    console.log("Inside dragging task");
    // console.log(tasks)
  };
  const handleDragEnd = () => {
    //TODO: how is this event still called when dropping duplicate?
    if (isDuplicateDragging) {
      return;
    }
    console.info("Stop dragging task");
    setIsDragging(false);
  };

  const handleDuplicateDragStart = (e) => {
    // How to prevent the normal drag to happen?
    setIsDragging(true);
    isDuplicateDragging = true;
    e.dataTransfer.setData("Type", "TaskDuplicate");
    e.dataTransfer.setData("TaskId", id);
    console.info("Duplicate dragging task");
  };

  const handleDuplicateDragEnd = () => {
    isDuplicateDragging = false;
    console.info("Stop duplicate dragging task");
    setIsDragging(false);
  };

  const handleToggleFold = () => {
    if (!isEditing) {
      toggleFold(id);
    }
  };

  const handleTaskDrop = (e) => {
    if (!moveTasks) {
      return;
    }
    var task_id = Number(e.dataTransfer.getData("TaskId"));
    var oldTopicId = Number(e.dataTransfer.getData("TopicId"));
    var oldSuperTaskId = Number(e.dataTransfer.getData("SuperTaskId"));
    console.info(
      `Dropped task with id ${task_id} with old topic id ${oldTopicId} on task (id:${id}) within topic with id ${currentTopicId}`
    );
    // console.info(changeTopic)
    let taskIds = [];
    let oldTopicIds = [];
    let oldSuperTaskIds = [];
    taskIds.push(task_id);
    oldTopicIds.push(oldTopicId);
    oldSuperTaskIds.push(oldSuperTaskId);
    console.info(selectedTasks);
    if (selectedTasks && selectedTasks.length > 0) {
      selectedTasks.forEach((st) => {
        console.info(
          `Changing topic of task with id ${st.taskId} from topic with id ${st.topicId} to topic with id ${currentTopicId}`
        );
        taskIds.push(st.taskId);
        oldTopicIds.push(st.topicId);
        oldSuperTaskIds.push(st.superTaskId);
      });
    }

    if (moveTasks) {
      moveTasks(
        taskIds,
        oldTopicIds,
        oldSuperTaskIds,
        currentTopicId,
        currentTopicViewIndex,
        currentSuperTaskId
      );
    }
  };

  const handleTaskDuplicateDrop = (e) => {
    if (!duplicateTask) {
      return;
    }
    var taskId = Number(e.dataTransfer.getData("TaskId"));
    console.info(
      `Duplicate dropped task with id ${taskId} on this topic with id ${currentTopicId}`
    );
    let taskIds = [];
    taskIds.push(taskId);
    if (selectedTasks && selectedTasks.length > 0) {
      selectedTasks.forEach((st) => {
        console.info(
          `Duplicating task with id ${st.taskId} to topic with id ${currentTopicId}`
        );
        taskIds.push(st.taskId);
      });
    }
    duplicateTask(taskIds, currentTopicId, currentTopicViewIndex);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.target.setAttribute("draggedOver", false);
    console.info("Dropping on a task");
    var type = e.dataTransfer.getData("Type");

    if (type == "Task") {
      handleTaskDrop(e);
    } else if (type == "TaskDuplicate") {
      handleTaskDuplicateDrop(e);
    } else {
      console.info("On a task, you can only drop another task (not a topic)");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    // this is not perfect, because I always want the <div class='task'> to be the target..
    e.target.setAttribute("draggedOver", true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.target.setAttribute("draggedOver", false);
  };

  const onDueDateChange = (event) => {
    let dueDateName = event.target.value;
    console.log("Setting due date");
    if (dueDateName === "noChange") {
      return;
    }
    setDueTime(id, getFutureDate(convertDueDateNameToSeconds(dueDateName)));
  };

  let class_str = "task";
  // Completion has precedence over planned
  if (completed || taskFinishStatus === FinishedState.Completed) {
    class_str = "taskCompleted";
  } else if (taskFinishStatus === FinishedState.Irrelevant) {
    class_str = "taskIrrelevant";
  } else if (taskFinishStatus === FinishedState.Impossible) {
    class_str = "taskImpossible";
  } else if (planned) {
    class_str = "taskPlanned";
  } else if (repeated) {
    class_str = "taskRepeated";
  }

  let selectStyle = {};
  if (selected) {
    selectStyle = {
      borderStyle: "dashed",
      borderWidth: "2px",
      margin: "0px",
    };
  }
  let dueTimeStr: String | undefined = undefined;
  if (currentDueTime) {
    dueTimeStr = translateTimeDifference(currentDueTime);
    console.log("Due time str");
    console.log(currentDueTime);
    console.log(dueTimeStr);
  }

  const toggleEdit = () => {
    setIsEditing(true);
    // TODO: Should actually clear the entire selection maybe?
    if (selected) {
      deleteFromSelection(id, currentTopicId, currentSuperTaskId);
    }
    setIsDraggingAllowed(false);
    // inputRef.current.focus()
    // TODO: set focus on text edit box
  };

  const handleKeyDown = (event) => {
    // Check if the Enter key was pressed
    if (event.key === "Enter") {
      // Call handleBlur or directly implement logic to finish editing
      handleBlur();
      // Prevents the form from being submitted if your input is part of one
      event.preventDefault();
    }
  };

  const handleBlur = () => {
    setIsDraggingAllowed(true);
    setIsEditing(false);
  };
  const inputRef = useRef(null);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]); // Dependency array ensures this runs only when isEditing changes

  const captureClick = (func) => {
    const wrapper = (e) => {
      if (func) {
        e.stopPropagation();
        return func();
      }
    };
    return wrapper;
  };
  const unselect = (func) => {
    const wrapper = (e) => {
      if (selected) {
        deleteFromSelection(id, currentTopicId, currentSuperTaskId);
      }
      return func();
    };
    return wrapper;
  };

  const dragHandlers = isDraggingAllowed
    ? {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
      }
    : {};
  const dropHandlers = isDragging
    ? {}
    : {
        onDrop: handleDrop,
        onDragOver: handleDragOver,
        onDragLeave: handleDragLeave,
      };
  const textEditHandlers = {
    onChange: handleChange,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onClick: captureClick(() => {}),
  };
  const selectHandlers = selected
    ? {
        onClick: captureClick(() =>
          deleteFromSelection(id, currentTopicId, currentSuperTaskId)
        ),
      }
    : {
        onClick: captureClick(() =>
          addToSelection(
            id,
            currentTopicId,
            currentTopicViewIndex,
            currentSuperTaskId
          )
        ),
      };
  let fullName = name;
  if (
    (taskFinishStatus !== FinishedState.Impossible ||
      taskFinishStatus !== FinishedState.Irrelevant) &&
    taskLastCompletion &&
    !isEditing
  ) {
    fullName += " / " + translateLastCompletedDatetime(taskLastCompletion);
  }
  const duplicateDragHandlers = isDraggingAllowed
    ? {
        draggable: true,
        onDragStart: handleDuplicateDragStart,
        onDragEnd: handleDuplicateDragEnd,
      }
    : {};

  return (
    <TaskContent
      classStr={class_str}
      selectStyle={selectStyle}
      selectHandlers={selectHandlers}
      dragHandlers={dragHandlers}
      dropHandlers={dropHandlers}
      name={fullName}
      foldingSymbol={
        hasSubTasks ? (unfolded ? unfolded_symbol : folded_symbol) : null
      }
      toggleFold={hasSubTasks ? handleToggleFold : null}
      textEditHandlers={textEditHandlers}
      inputRef={inputRef}
      isEditing={isEditing}
      toggleEdit={toggleEdit}
      deleteTask={deleteTask && unselect(() => deleteTask(id))}
      addSubTask={addSubTask && unselect(() => addSubTask(id))}
      completeTask={completeTask && (() => completeTask(id))}
      markTaskIrrelevant={markTaskIrrelevant}
      markTaskImpossible={markTaskImpossible}
      taskFinishStatus={
        taskFinishStatus
          ? taskFinishStatus
          : completed
            ? FinishedState.Completed
            : FinishedState.NotFinished
      }
      planned={planned}
      plan={() => {
        plan(id);
      }}
      unplan={() => {
        unplan(id);
      }}
      repeated={repeated}
      toggleRepeatTask={() => {
        toggleRepeatTask(id);
      }}
      duplicateDragHandlers={duplicateDragHandlers}
      fancy={fancy}
      topicCount={taskTopics.length}
      onDueDateChange={onDueDateChange}
      currentDueDateStr={dueTimeStr}
    />
  );
};

Task.propTypes = {
  name: PropTypes.string.isRequired,
  setTaskName: PropTypes.func,
  deleteTask: PropTypes.func,
  completed: PropTypes.bool.isRequired,
  completeTask: PropTypes.func,
  id: PropTypes.number,
  currentTopicId: PropTypes.number,
  currentViewIdx: PropTypes.number,
};

export default memo(Task);
