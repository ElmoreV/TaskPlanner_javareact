import ViewSelector from './ViewSelector';
import TaskList from './TaskList';
import PlannedList from './PlannedList'
import { useState } from 'react'
import ImportExport from './ImportExport';
import Theme from "./Theme";
import { FinishedState } from './TaskInterfaces.tsx';

// 1. Go through all tasks and search if their .supertasks list contains [task.id] N*E(M) , E(M) is avg of supertasks per task
// 2. Go through all tasks and search if the ids match one of the .subtasks List N*P P is # of subtasks in task


function App() {
  console.debug("Rendering App")

  const VIEW_ALL_TASKS = 1
  const VIEW_PLANNED_TASKS = 2
  const VIEW_DAILY_PLANNING = 3
  const VIEW_ADD_TASKS = 4
  const VIEW_COMPLETE_TASKS = 5

  const [debugMode, setDebugMode] = useState(false)

  //v1
  const [topics, setTopics] = useState([
    {
      name: "Maintenance", id: 1, unfolded: false, subtopics: [
        { name: "Replace", id: 11, unfolded: false, subtopics: [] },
        { name: "Repair", id: 12, unfolded: false, subtopics: [] },
        { name: "Document", id: 13, unfolded: true, subtopics: [] }

      ]
    },
    {
      name: "Creativity", id: 2, unfolded: false, subtopics: [
        { name: "Writing", id: 21, unfolded: false, subtopics: [] }
      ]
    }

  ]);

  // const  [tasks, setTasks] = useState([])
  // Should use generation functions here, to make it immediately issueless

  // const [topics,setTopics] = useState([])
  // createNewRootTopic(topics,...)
  // should up generation functions here

  const [tasks, setTasks] = useState([
    {
      name: "Repair bicycle", id: 0, topics: [12], topicViewIndices: [1], completed: true,
      finishStatus: FinishedState.Completed,
      thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 1,
      subTaskIds: [], unfolded: true
    },
    {
      name: "Write Cover Letter", id: 1, topics: [21, 13], topicViewIndices: [1, 1], completed: false,
      finishStatus: FinishedState.NotFinished,
      thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 0,
      subTaskIds: [0], unfolded: true
    },
    {
      name: "Check tax return", id: 2, topics: [1], topicViewIndices: [3], completed: false,
      finishStatus: FinishedState.NotFinished,
      thisWeek: true, repeated: false, scheduled: true, weekOrderIndex: 2,
      subTaskIds: [1], unfolded: true
    },
    {
      name: "Create a NASS server", id: 5, topics: [1], topicViewIndices: [2], completed: false,
      finishStatus: FinishedState.NotFinished,
      thisWeek: false, repeated: true, scheduled: false, weekOrderIndex: 0,
      subTaskIds: [2], unfolded: true
    },
  ])

  const [view, setView] = useState(VIEW_ALL_TASKS)
  const [fancy, setFancy] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const onMakeFancyChange = () => {
    setFancy(!fancy)
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
            tasks={tasks}
            topics={topics}
            setTasks={setTasks}
            setTopics={setTopics} />
          <ViewSelector
            viewSetter={setView} />
          {view === VIEW_ADD_TASKS}
          {view === VIEW_ALL_TASKS && <TaskList
            tasks={tasks}
            setTasks={setTasks}
            topics={topics}
            setTopics={setTopics}
            fancy={fancy}
          />}
          {view === VIEW_PLANNED_TASKS && <PlannedList
            tasks={tasks}
            setTasks={setTasks}
            topics={topics}
            setTopics={setTopics}
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
      </div>
    </Theme>
  );
}

export default App; 
