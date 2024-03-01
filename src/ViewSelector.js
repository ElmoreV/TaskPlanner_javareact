

const VIEW_ALL_TASKS = 1
const VIEW_PLANNED_TASKS = 2
const VIEW_DAILY_PLANNING = 3

const ViewSelector = (props) => {
    const {viewSetter} = props;


    const handleClick = (new_view)=>{
        const handleClicker = (e)=>{
            viewSetter(new_view)
        }
        return handleClicker
    }
    

    return ( <div className="view-select">
        <h3 onClick={handleClick(VIEW_ALL_TASKS)}>Per topic</h3>
        <h3 onClick={handleClick(VIEW_PLANNED_TASKS)}>Weekly</h3>
        <h3 onClick={handleClick(VIEW_DAILY_PLANNING)}>Daily</h3>
        
    </div> );
}
 
export default ViewSelector;