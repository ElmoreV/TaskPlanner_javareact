import ViewSelector from './ViewSelector';
import TaskList from './TaskList';
import PlannedList from './PlannedList'
import { useState } from 'react'
import ImportExport from './ImportExport';
import Theme from "./Theme";

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

  //v0
  // const [topics, setTopics] = useState([
  //   {
  //     title: "Onderhoud", id: 1, unfolded: false, subtopics: [
  //       { title: "Vervangen", id: 11, unfolded: false, subtopics: [] },
  //       { title: "Repareren", id: 12, unfolded: false, subtopics: [] },

  //     ]
  //   },
  //   {
  //     title: "Ontspanning", id: 2, unfolded: false, subtopics: [
  //       { title: "Gamen", id: 21, unfolded: false, subtopics: [] }
  //     ]
  //   }

  // ]);

  // v1
  const [tasks, setTasks] = useState([
    { name: "Fiets repareren", id: 0, topics: [12], completed: true, thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 1 },
    { name: "Outer Wilds", id: 1, topics: [21, 1], completed: false, thisWeek: false, repeated: false, scheduled: false, weekOrderIndex: 0 },
    { name: "Badkamer", id: 2, topics: [1], completed: false, thisWeek: true, repeated: false, scheduled: true, weekOrderIndex: 2 },
    { name: "Backup opruimen", id: 5, topics: [1], completed: false, thisWeek: false, repeated: true, scheduled: false, weekOrderIndex: 0 },
  ])

  // Note: this wouldn't work if we could duplicate topics as well
  // and if we had subtasks, because the supertasks could be 
  // duplicated as well...... Let's do this for now.
  // Anyway, these are all global indices.
  const [topicViewIndices, setTopicViewIndices] = useState([
    new TopicViewIndex(1, 12, 0),
    new TopicViewIndex(2, 21, 1),
    new TopicViewIndex(3, 1, 2),
    new TopicViewIndex(4, 1, 5),
    new TopicViewIndex(5, 1, 1),
    new TopicViewIndex(6, 12, null) // A topic view index
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
