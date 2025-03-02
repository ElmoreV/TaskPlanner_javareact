import ViewSelector from './ViewSelector';
import TaskList from './TaskViews/TaskList.js';
import PlannedList from './TaskViews/PlannedList.js'
import { useState } from 'react'
import ImportExport from './ImportExport';
import Theme from "./Theme";
import AddTaskView from './TaskViews/NewTaskList.js';
import { initialTasksV1, initialTopicsV1 } from './InitialState_V1.ts';
import { convert_v1_to_v2, convert_v2_to_v1, ensureRoundtripStability } from './Converters/Migration_V1_V2/UpdateV1ToV2.ts';
import { initialTags, initialTasks, initialPlannedTaskIdList, initialTagTasks } from './InitialState_V2.ts';

// 1. Go through all tasks and search if their .supertasks list contains [task.id] N*E(M) , E(M) is avg of supertasks per task
// 2. Go through all tasks and search if the ids match one of the .subtasks List N*P P is # of subtasks in task

// type AppData = {
//   topics: V1_Topic[];
//   tasks: V1_Task[];
// }


function App() {
  console.debug("Rendering App")

  const VIEW_ALL_TASKS = 1
  const VIEW_PLANNED_TASKS = 2
  const VIEW_DAILY_PLANNING = 3
  const VIEW_ADD_TASKS = 4
  const VIEW_COMPLETE_TASKS = 5

  const [debugMode, setDebugMode] = useState(false)

  //v1
  const [appData, setAppData] = useState({
    topics: initialTopicsV1,
    tasks: initialTasksV1,
  }
  );

  // const [topics, setTopics] = useState(initialTopicsV1);
  // const [tasks, setTasks] = useState(initialTasksV1)

  // const  [tasks, setTasks] = useState([])
  // Should use generation functions here, to make it immediately issueless

  // const [topics,setTopics] = useState([])
  // createNewRootTopic(topics,...)
  // should up generation functions here


  const [view, setView] = useState(VIEW_ALL_TASKS)
  const [fancy, setFancy] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const onMakeFancyChange = () => {
    setFancy(!fancy)
  }

  const onTest2 = () => {
    ensureRoundtripStability(appData.tasks, appData.topics)
    const { newTaskMap, newTagMap, newTagTaskMap, newPlannedTaskIds } = convert_v1_to_v2(appData.tasks, appData.topics)
    const res2 = convert_v2_to_v1(newTaskMap, newTagMap, newTagTaskMap, newPlannedTaskIds)
    const { topicsV1, tasksV1 } = res2
    setAppData({ topics: topicsV1, tasks: tasksV1 })
  }

  const onDarkModeChange = () => {
    setDarkMode(!darkMode)
  }

  const onDebugModeChange = () => {
    setDebugMode(!debugMode)
  }

  return (
    <Theme darkMode={darkMode}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" />

      <div className="App">
        <div className="contents">

          <ImportExport
            appData={appData}
            setAppData={setAppData} />
          <ViewSelector
            viewSetter={setView} />
          {view === VIEW_ADD_TASKS && <AddTaskView
            appData={appData}
            setAppData={setAppData}
            fancy={fancy}
          />}
          {view === VIEW_ALL_TASKS && <TaskList
            appData = {appData}
            setAppData = {setAppData}
            fancy={fancy}
          />}
          {view === VIEW_PLANNED_TASKS && <PlannedList
            appData={appData}
            setAppData={setAppData}
            fancy={fancy}
          />}
          {view === VIEW_DAILY_PLANNING}
          {view == VIEW_COMPLETE_TASKS}
          <div classStr="settingsUI">
            {/* <label><input
              type="checkbox"
              name='MakeFancy'
              onChange={onMakeFancyChange}
              className="form-check-input"
              defaultChecked={fancy}
            />Fancy layout</label><br /> */}
            <label><input
              type="checkbox"
              name='DarkMode'
              onChange={onDarkModeChange}
              className="form-check-input"
              defaultChecked={darkMode}
            />Dark Mode</label>
          </div>
        </div>
        <a href="https://github.com/ElmoreV/TaskPlanner_javareact" target="_blank"><button> <i className="fa fa-github"></i> GitHub: ElmoreV</button></a><br />
        <label><input
          type="checkbox"
          name='DebugMode'
          onChange={onDebugModeChange}
          className="form-check-input"
          defaultChecked={debugMode}
        />Debug Mode</label>
        <button onClick={onTest2}>Test2</button>
      </div>
    </Theme>
  );
}

export default App; 
