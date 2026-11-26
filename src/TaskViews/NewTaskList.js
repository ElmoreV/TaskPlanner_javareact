import { useState, useEffect } from "react";
import PlannedTask from "../Tasks/PlannedTask.js";
import { getSetTaskNameFuncV1 } from "../Tasks/TaskModifyFuncGensV1.ts";
import { getAddTaskWithoutTopic } from "../ADG/ModifyFuncGeneratorsV1.ts";
import FilterBar from "../Filters/FilterBar";
import { useTaskFilter } from "../Filters/useTaskFilter";
import { View } from "../Structure/View";

class SelectedNewTask {
  constructor(taskId, weekOrderIndex) {
    this.taskId = taskId;
  }
}

const AddTaskView = (props) => {
  const { appData, setAppData, fancy, filterSettings, setFilterSettings } =
    props;
  const taskFilter = useTaskFilter(
    appData,
    View.VIEW_ADD_TASKS,
    filterSettings,
    setFilterSettings
  );
  const { topics, tasks } = appData;
  const setTasks = (newTasks) => {
    setAppData({ tasks: newTasks, ...appData });
  };
  console.debug("Rendering AddTaskView");

  const [selectedTasks, setSelectedTasks] = useState([]);

  const clearSelection = () => {
    console.log("Clearing selection");
    setSelectedTasks([]);
  };
  useEffect(() => {
    // Function to clear selection
    // Add global click listener
    document.addEventListener("click", clearSelection);
    // Remove the event listener on cleanup
    return () => {
      document.removeEventListener("click", clearSelection);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const addTaskToSelection = (taskId, weekOrderIndex) => {
    let newSelectedTasks = [...selectedTasks];
    newSelectedTasks.push(new SelectedNewTask(taskId));
    setSelectedTasks(newSelectedTasks);
  };

  const deleteTaskFromSelection = (taskId, weekOrderIndex) => {
    let newSelectedTasks = [...selectedTasks];
    newSelectedTasks = newSelectedTasks.filter(
      (selTask) =>
        !(selTask.taskId == taskId && selTask.weekOrderIndex == weekOrderIndex)
    );
    setSelectedTasks(newSelectedTasks);
  };

  const isVisible = (task) => {
    // Only show tasks when it has no topics
    // Otherwise, we can assume it's already been categorized and not new
    // Also do not show tasks that are in a subtask
    return task.topics.length == 0 && !allSubTaskIds.includes(task.id);
  };

  let allSuperTasks = tasks.filter(
    (task) => task.subTaskIds && task.subTaskIds.length > 0
  );
  let allSubTaskIds = allSuperTasks.reduce((acc, task) => {
    acc = acc.concat(task.subTaskIds);
    return acc;
  }, []);
  return (
    <div className="task-list">
      <FilterBar taskFilter={taskFilter}>
        <button onClick={getAddTaskWithoutTopic(setTasks, tasks)}>
          Add task
        </button>
      </FilterBar>
      <ul>
        {tasks
          .filter((task) => isVisible(task))
          .filter(taskFilter.isTaskVisible)
          .map((task) => (
            <PlannedTask
              taskName={task.name}
              taskKey={task.id}
              hasSubTasks={task.subTaskIds && task.subTaskIds.length > 0}
              topics={topics}
              taskTopics={task.topics}
              fancy={fancy}
              setTaskName={getSetTaskNameFuncV1(setTasks, tasks, task.id)}
              clearSelection={clearSelection}
              selected={
                selectedTasks.find(
                  (st) =>
                    st.taskId == task.id &&
                    st.weekOrderIndex == task.weekOrderIndex
                )
                  ? true
                  : false
              }
              selectedTasks={selectedTasks}
            />
          ))}
      </ul>
      <button onClick={getAddTaskWithoutTopic(setTasks, tasks)}>
        Add task
      </button>
    </div>
  );
};

export default AddTaskView;
