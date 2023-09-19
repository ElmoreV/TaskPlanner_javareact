import ViewSelector from './ViewSelector';
import TaskList from './TaskList';

function App() {
  return (
    <div className="App">
      <div className="contents">
        <ViewSelector/>
        <TaskList/>
      </div>
    </div>
  );
}

export default App;
