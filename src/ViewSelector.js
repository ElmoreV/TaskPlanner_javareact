

const VIEW_ALL_TASKS = 1
const VIEW_PLANNED_TASKS = 2
const VIEW_DAILY_PLANNING = 3
const VIEW_ADD_TASKS = 4
const VIEW_COMPLETE_TASKS = 5

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
        <h3 onClick={handleClick(VIEW_ADD_TASKS)}>Add</h3>
        <h3 onClick={handleClick(VIEW_ALL_TASKS)}>Categorize</h3>
        <h3 onClick={handleClick(VIEW_PLANNED_TASKS)}>Prioritize</h3>
        <h3 onClick={handleClick(VIEW_DAILY_PLANNING)}>Schedule</h3>
        <h3 onClick={handleClick(VIEW_COMPLETE_TASKS)}>Update/complete</h3>

    </div>);
}

export default ViewSelector;