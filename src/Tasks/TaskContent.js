// These are the contents of the TaskBar
// Leave any logic out of the contents component
// Instead, make it a prop of the TaskContent

import React, { useState } from "react";
import fancyStyles from "./TaskContentFancy.module.css";
import simpleStyles from "./TaskContentSimple.module.css";
import splitButtonStyles from "./SplitButton.module.css";
import { FinishedState } from "../Structure/TaskInterfaces.tsx";

const captureClick = (func) => {
  const wrapper = (e) => {
    e.stopPropagation();
    return func();
  };
  return wrapper;
};

const TaskContent = (props) => {
  const {
    classStr,
    selectStyle,
    selectHandlers,
    dragHandlers,
    dropHandlers,
    duplicateDragHandlers,
    name,
    textEditHandlers,
    inputRef,
    isEditing,
    toggleEdit,
    topicPath,
    textBarWidth,
    deleteTask,
    addSubTask,
    completeTask,
    markTaskIrrelevant,
    markTaskImpossible,
    taskFinishStatus,
    planned,
    plan,
    unplan,
    repeated,
    toggleRepeatTask,
    scheduled,
    scheduleTask,
    spawnNewTask,
    toggleFold,
    foldingSymbol,
    fancy,
    topicCount,
    onDueDateChange,
    currentDueDateStr,
  } = props;
  console.debug(`Rendering TaskContent ${name}`);
  // let taskFinishStatus = FinishedState.Irrelevant;
  // let completed = (taskFinishStatus == Finished.Completed)
  let styles = fancy ? fancyStyles : simpleStyles;

  // Applying dynamic class names based on the classStr prop
  const taskClassNames = [styles.task, styles[classStr]]
    .filter(Boolean)
    .join(" ");
  return (
    // <div className={styles.task}>
    <div className={styles.taskContent}>
      <div
        className={taskClassNames}
        style={selectStyle}
        onDoubleClick={toggleEdit}
        {...selectHandlers}
        {...dragHandlers}
        {...dropHandlers}
      >
        {toggleFold && (
          <span
            className={styles.foldingButton}
            onClick={captureClick(toggleFold)}
          >
            {foldingSymbol}
          </span>
        )}
        <div
          className={styles.textBar}
          // style={{ width: textBarWidth }}
        >
          <span className={styles.taskText}>
            {isEditing ? (
              <input
                type="text"
                value={name}
                {...textEditHandlers}
                ref={inputRef}
              />
            ) : (
              <span>{name}</span>
            )}
          </span>
          {topicPath && <span className={styles.topicPath}>{topicPath}</span>}
        </div>
        <div className={styles.buttonList}>
          {topicCount > 1 && <span>+{topicCount - 1} more</span>}
          {/* {topicCount>1 && (<button className={styles.taskComplete} onClick={()=>{}}>Delete copy</button>)} */}
          {duplicateDragHandlers && (
            <span className={styles.buttonDuplicate} {...duplicateDragHandlers}>
              + Duplicate +
            </span>
          )}

          {deleteTask && (
            <button
              className={styles.taskDelete}
              onClick={captureClick(deleteTask)}
            >
              Delete task
            </button>
          )}
          <FinishTaskSplitButton
            completeTask={completeTask}
            markTaskIrrelevant={markTaskIrrelevant}
            markTaskImpossible={markTaskImpossible}
            taskFinishStatus={taskFinishStatus}
          />
          {taskFinishStatus == FinishedState.NotFinished &&
            unplan &&
            planned && (
              <button
                className={styles.moveToWeek}
                onClick={captureClick(unplan)}
              >
                {" "}
                Unplan{" "}
              </button>
            )}
          {taskFinishStatus == FinishedState.NotFinished &&
            plan &&
            !planned && (
              <button
                className={styles.moveToWeek}
                onClick={captureClick(plan)}
              >
                {" "}
                Plan{" "}
              </button>
            )}

          {toggleRepeatTask && repeated && (
            <button
              className={styles.makeRepeated}
              onClick={captureClick(toggleRepeatTask)}
            >
              {" "}
              Repeat{" "}
            </button>
          )}
          {toggleRepeatTask && !repeated && (
            <button
              className={styles.makeRepeated}
              onClick={captureClick(toggleRepeatTask)}
            >
              {" "}
              <s>Repeat</s>{" "}
            </button>
          )}
          {taskFinishStatus == FinishedState.NotFinished &&
            scheduled &&
            scheduleTask && (
              <button
                className={styles.taskSchedule}
                onClick={captureClick(scheduleTask)}
              >
                Scheduled!
              </button>
            )}
          {taskFinishStatus == FinishedState.NotFinished &&
            !scheduled &&
            scheduleTask && (
              <button
                className={styles.taskSchedule}
                onClick={captureClick(scheduleTask)}
              >
                Unscheduled
              </button>
            )}
          {spawnNewTask && (
            <button
              className={styles.taskSpawn}
              onClick={captureClick(spawnNewTask)}
            >
              Spawn
            </button>
          )}
          {addSubTask && (
            <button
              className={styles.taskSpawn}
              onClick={captureClick(addSubTask)}
            >
              Add subtask
            </button>
          )}
          {onDueDateChange && (
            <select
              id="select_due_date"
              name="due_date"
              onChange={onDueDateChange}
            >
              {currentDueDateStr && (
                <option value="default">{currentDueDateStr}</option>
              )}
              <option value="none">Due in:</option>
              <option value="2hrs">In 2 hours</option>
              <option value="8hrs">In 8 hours</option>
              <option value="1day">In 1 day</option>
              <option value="4day">In 4 day</option>
              <option value="1week">In 1 week</option>
              <option value="2week">In 2 weeks</option>
              <option value="4week">In 4 weeks</option>
              <option value="1month">In 1 month</option>
              <option value="2month">In 2 months</option>
              <option value="3month">In 3 months</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

const FinishTaskSplitButton = (props) => {
  // props
  const {
    completeTask,
    markTaskIrrelevant,
    markTaskImpossible,
    taskFinishStatus,
  } = props;
  // open and close dropdown
  const [open, setOpen] = useState(false);
  const toggleDropdown = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  let defaultAction;
  let defaultText;
  switch (taskFinishStatus) {
    case FinishedState.Completed:
      defaultAction = completeTask;
      defaultText = "Decomplete";
      break;

    case FinishedState.Irrelevant:
      defaultAction = markTaskIrrelevant;
      defaultText = "Relevant";
      break;

    case FinishedState.Impossible:
      defaultAction = markTaskImpossible;
      defaultText = "Possible";
      break;

    default:
      defaultAction = completeTask;
      defaultText = "Complete";
      break;
  }

  // Final dom structure
  // <default (complete) button>
  // <dropdown button>
  //   <dropdown menu>
  return (
    <div className={splitButtonStyles.splitButtonContainer}>
      <div className={splitButtonStyles.splitButton}>
        <button
          onClick={captureClick(defaultAction)}
          className={splitButtonStyles.splitButtonDefault}
        >
          {defaultText}
        </button>
        <button
          onClick={toggleDropdown}
          className={splitButtonStyles.splitButtonDropdown}
        >
          ▼
        </button>
      </div>
      {open && (
        <ul className={splitButtonStyles.dropdownMenu}>
          {taskFinishStatus !== FinishedState.Completed &&
            taskFinishStatus !== FinishedState.NotFinished &&
            completeTask && (
              <li onClick={captureClick(completeTask)}>Complete</li>
            )}
          {taskFinishStatus !== FinishedState.Irrelevant &&
            markTaskIrrelevant && (
              <li onClick={captureClick(markTaskIrrelevant)}>Irrelevant</li>
            )}
          {taskFinishStatus !== FinishedState.Impossible &&
            markTaskImpossible && (
              <li onClick={captureClick(markTaskImpossible)}>Impossible</li>
            )}
        </ul>
      )}
    </div>
  );
};

export default TaskContent;
