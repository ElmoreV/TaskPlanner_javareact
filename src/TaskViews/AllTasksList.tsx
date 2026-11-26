import { useMemo, useState } from "react";
import TaskContainer from "../Tasks/TaskContainer.tsx";
import { getSelectableTags } from "../Tasks/TaskTagHelpers.js";
import FilterBar from "../Filters/FilterBar.tsx";
import { useTaskFilter } from "../Filters/useTaskFilter.ts";
import { View } from "../Structure/View.ts";
import { createParentTaskPathLookupV1 } from "../ADG/FindItemsV1.ts";

const AllTasksList = ({
  appData,
  setAppData,
  fancy,
  filterSettings,
  setFilterSettings,
}) => {
  // Review: sure, task filter, good
  const taskFilter = useTaskFilter(
    appData,
    View.VIEW_TAG_ALL_TASKS,
    filterSettings,
    setFilterSettings
  );
  const { tasks, topics } = appData;
  // Review: these are buttons on top header bar, good
  const [showFullTagPaths, setShowFullTagPaths] = useState(false);
  const [showFullParentPaths, setShowFullParentPaths] = useState(false);

  // ? why is this here? 
  // this is used in the taskFilter as well, right?
  const selectableTags = useMemo(() => getSelectableTags(topics), [topics]);

  // {id, {id,name,full_path,[id1,id2]}}
  const tagsById = useMemo(
    () => new Map(selectableTags.map((tag) => [tag.id, tag])),
    [selectableTags]
  );

  // ??
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  
  // new getParentTaskPaths function?
  // Don't we have something like this already?
  // Review: what does this do?
  // Review: needs documentation
  const getParentTaskPaths = useMemo(
    () => createParentTaskPathLookupV1(tasks),
    [tasks]
  );

  // Review: Good
  const { isTaskVisible } = taskFilter;
  const visibleTasks = tasks.filter(isTaskVisible);

  const renderTask = (task, supertasks = []) => {

    const currentPath = [...supertasks, task.id];
    const children = [...new Set(task.subTaskIds || [])].filter(
      (id) =>
        tasksById.has(id) &&
        !currentPath.includes(id) && // current-path cycle prevention
        isTaskVisible(tasksById.get(id))
    );
    const tags = task.topics.map((id) => {
      const tag = tagsById.get(id);
      return {
        id,
        path: tag?.path || `Unknown tag (${id})`,
        label: tag
          ? showFullTagPaths
            ? tag.path
            : tag.name
          : `Unknown tag (${id})`,
      };
    });

    // JSX seems okay
    // and this also shows the subtasks recursively, that is good. Strange that you use tasksById and not the already given tasks.subTaskIds inside of the unit
    // Why are doing something different than the
        //     {task.subTaskIds && task.subTaskIds.length > 0 && task.unfolded && (
        //   <ul>
        //     {task.subTaskIds
        //       .map((subTaskId) => tasks.find((task) => task.id == subTaskId))
        //       .filter((subTask) => subTask !== undefined)
        //       .filter(taskFilter.isTaskVisible)
        //       .map((subTask) => recursiveShowTask(null, task, subTask))}
        //   </ul>
        // )}
      // in TaskList.js ? I mean, you're maybe not wrong, but explain it to me please, since we are using two different methods, and it seems like one method should be better.
    return (
      <li key={task.id}>
        <TaskContainer
          view={View.VIEW_TAG_ALL_TASKS}
          task={task}
          setAppData={setAppData}
          fancy={fancy}
          parentTaskPaths={getParentTaskPaths(task.id, showFullParentPaths)}
          tags={tags}
          selectableTags={selectableTags}
        />
        {task.unfolded && children.length > 0 && (
          <ul>{children.map((id) => renderTask(tasksById.get(id), currentPath))}</ul>
        )}
      </li>
    );
  };

  return (
    <div className="task-list" role="region" aria-label="All tasks">
      <FilterBar taskFilter={taskFilter}>
        <label>
          <input
            type="checkbox"
            checked={showFullTagPaths}
            onChange={(event) => setShowFullTagPaths(event.target.checked)}
          />
          Show full tag paths
        </label>
        <label>
          <input
            type="checkbox"
            checked={showFullParentPaths}
            onChange={(event) => setShowFullParentPaths(event.target.checked)}
          />
          Show full parent paths
        </label>
      </FilterBar>
      {visibleTasks.length ? (
        <ul>{visibleTasks.map((task) => renderTask(task))}</ul>
      ) : (
        <p>{tasks.length ? "No matching tasks." : "No tasks yet."}</p>
      )}
    </div>
  );
};

export default AllTasksList;
