import { View } from "./Structure/View";

const ViewSelector = (props) => {
  const { viewSetter } = props;
  console.debug("Rendering ViewSelector");

  const handleClick = (newView: View) => {
    const handleClicker = () => {
      viewSetter(newView);
    };
    return handleClicker;
  };

  return (
    <div className="view-select">
      <h3 onClick={handleClick(View.VIEW_ADD_TASKS)}>1. Add</h3>
      <h3 onClick={handleClick(View.VIEW_ALL_TASKS)}>2. Categorize</h3>
      <h3 onClick={handleClick(View.VIEW_PLAN_TASKS)}>3. Plan</h3>
      <h3 onClick={handleClick(View.VIEW_PLANNED_TASKS)}>4. Prioritize</h3>
      <h3 onClick={handleClick(View.VIEW_DAILY_PLANNING)}>5. Schedule</h3>
      <h3 onClick={handleClick(View.VIEW_COMPLETE_TASKS)}>6. Check</h3>
      <h3 onClick={handleClick(View.VIEW_TAG_ALL_TASKS)}>All tasks</h3>
      {/* Review the below monstrosity */}
      <h3>
        <button
          type="button"
          onClick={handleClick(View.VIEW_TASK_GRAPH)}
          style={{
            border: 0,
            padding: 0,
            background: "transparent",
            color: "inherit",
            font: "inherit",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Task graph
        </button>
      </h3>
    </div>
  );
};

export default ViewSelector;
