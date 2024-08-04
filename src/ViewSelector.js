

const VIEW_ALL_TASKS = 1
const VIEW_PLANNED_TASKS = 2
const VIEW_DAILY_PLANNING = 3
const VIEW_ADD_TASKS = 4
const VIEW_COMPLETE_TASKS = 5
const VIEW_PLAN_TASKS = 6

const ViewSelector = (props) => {
    const { viewSetter } = props;
    console.debug("Rendering ViewSelector")

    const handleClick = (new_view) => {
        const handleClicker = (e) => {
            viewSetter(new_view)
        }
        return handleClicker
    }


    return (<div className="view-select">
        <h3 onClick={handleClick(VIEW_ADD_TASKS)}>1. Add</h3>
        <h3 onClick={handleClick(VIEW_ALL_TASKS)}>2. Categorize</h3>
        <h3 onClick={handleClick(VIEW_PLAN_TASKS)}>3. Plan</h3>
        <h3 onClick={handleClick(VIEW_PLANNED_TASKS)}>4. Prioritize</h3>
        <h3 onClick={handleClick(VIEW_DAILY_PLANNING)}>5. Schedule</h3>
        <h3 onClick={handleClick(VIEW_COMPLETE_TASKS)}>6. Check</h3>

    </div>);
}

export default ViewSelector;