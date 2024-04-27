import ViewSelector from './ViewSelector';
import TaskList from './TaskList';
import PlannedList from './PlannedList'
import { useState } from 'react'
import ImportExport from './ImportExport';
import Theme from "./Theme";
import { FinishedState } from './TaskInterfaces.tsx';

class TopicViewIndex {
  constructor(index, topicId, taskId) {
    this.index = index
    this.topicId = topicId
    this.taskId = taskId
  }
}


function App() {
  console.debug("Rendering App")

  const VIEW_ALL_TASKS = 1
  const VIEW_PLANNED_TASKS = 2
  const VIEW_DAILY_PLANNING = 3

  //v1
  const [topics, setTopics] = useState([
    {
      name: "Onderhoud", id: 1, unfolded: false, subtopics: [
        { name: "Vervangen", id: 11, unfolded: false, subtopics: [] },
        { name: "Repareren", id: 12, unfolded: false, subtopics: [] },

      ]
    },
    {
      name: "Ontspanning", id: 2, unfolded: false, subtopics: [
        { name: "Gamen", id: 21, unfolded: false, subtopics: [] }
      ]
    }

  ]);

  const [tasks, setTasks] = useState([
    {
      name: "Fiets repareren", id: 0, topics: [12], topicViewIndices: [1], completed: true,
      finishStatus: FinishedState.Completed,
      thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 1
    },
    {
      name: "Outer Wilds", id: 1, topics: [21, 1], topicViewIndices: [1, 1], completed: false,
      finishStatus: FinishedState.NotFinished,
      thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 0
    },
    {
      name: "Badkamer", id: 2, topics: [1], topicViewIndices: [3], completed: false,
      finishStatus: FinishedState.NotFinished,
      thisWeek: true, repeated: false, scheduled: true, weekOrderIndex: 2
    },
    {
      name: "Backup opruimen", id: 5, topics: [1], topicViewIndices: [2], completed: false,
      finishStatus: FinishedState.NotFinished,
      thisWeek: false, repeated: true, scheduled: false, weekOrderIndex: 0
    },
  ])

  // Order of Tasks would be inside of the tasks by orderId
  // Order of Topic is just the order of the subtopics



  const [view, setView] = useState(VIEW_ALL_TASKS)
  const [fancy, setFancy] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const onMakeFancyChange = () => {
    setFancy(!fancy)
  }

  const onDarkModeChange = () => {
    setDarkMode(!darkMode)
  }

  return (
    <Theme darkMode={darkMode}>
      <div className="App">
        <div className="contents">
          <ImportExport
            tasks={tasks}
            topics={topics}
            setTasks={setTasks}
            setTopics={setTopics} />
          <ViewSelector
            viewSetter={setView} />
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
          <div classStr="settingsUI">
            <label><input
              type="checkbox"
              name='MakeFancy'
              onChange={onMakeFancyChange}
              className="form-check-input"
              defaultChecked={fancy}
            />Fancy layout</label><br />
            <label><input
              type="checkbox"
              name='DarkMode'
              onChange={onDarkModeChange}
              className="form-check-input"
              defaultChecked={darkMode}
            />Dark Mode</label>
          </div>
        </div>
      </div>
    </Theme>
  );
}

export default App; 
