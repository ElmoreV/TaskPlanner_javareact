import ViewSelector from './ViewSelector';
import TaskList from './TaskList';
import PlannedList from './PlannedList'
import { useState } from 'react'

function App() {
  const VIEW_ALL_TASKS = 1
  const VIEW_PLANNED_TASKS = 2
  const VIEW_DAILY_PLANNING = 3

  //v1
  // const [topics, setTopics] = useState([
  //   {
  //     name: "Onderhoud", id: 1, unfolded: false, subtopics: [
  //       { name: "Vervangen", id: 11, unfolded: false, subtopics: [] },
  //       { name: "Repareren", id: 12, unfolded: false, subtopics: [] },

  //     ]
  //   },
  //   {
  //     name: "Ontspanning", id: 2, unfolded: false, subtopics: [
  //       { name: "Gamen", id: 21, unfolded: false, subtopics: [] }
  //     ]
  //   }

  // ]);

  //v0
  const [topics, setTopics] = useState([
    {
      title: "Onderhoud", id: 1, unfolded: false, subtopics: [
        { title: "Vervangen", id: 11, unfolded: false, subtopics: [] },
        { title: "Repareren", id: 12, unfolded: false, subtopics: [] },

      ]
    },
    {
      title: "Ontspanning", id: 2, unfolded: false, subtopics: [
        { title: "Gamen", id: 21, unfolded: false, subtopics: [] }
      ]
    }

  ]);

  // v1
  // const [tasks, setTasks] = useState([
  //   { name: "Fiets repareren", id: 0, topics: [12], completed: true, thisWeek: false },
  //   { name: "Outer Wilds", id: 1, topics: [21, 1], completed: false, thisWeek: false },
  //   { name: "Badkamer", id: 2, topics: [1], completed: true, thisWeek: false },
  //   { name: "Backup opruimen", id: 5, topics: [1], completed: false, thisWeek: false },
  // ])

  //v0
  const [tasks, setTasks] = useState([
    { taskName: "Fiets repareren", key: 0, topics: ["Repareren"], completed: true, thisWeek: false },
    { taskName: "Outer Wilds", key: 1, topics: ["Gamen", "Onderhoud"], completed: false, thisWeek: false },
    { taskName: "Badkamer", key: 2, topics: ["Onderhoud"], completed: true, thisWeek: false },
    { taskName: "Backup opruimen", key: 5, topics: ["Onderhoud"], completed: false, thisWeek: false },
  ])


  const [view, setView] = useState(VIEW_ALL_TASKS)


  return (
    <div className="App">
      <div className="contents">
        <ViewSelector
          viewSetter={setView} />
        {view === VIEW_ALL_TASKS && <TaskList
          tasks={tasks}
          setTasks={setTasks}
          topics={topics}
          setTopics={setTopics}

        />}
        {view === VIEW_PLANNED_TASKS && <PlannedList
          tasks={tasks}
          setTasks={setTasks}
          topics={topics}
          setTopics={setTopics}
        />}
        {view === VIEW_DAILY_PLANNING}

      </div>
    </div>
  );
}

export default App;
