
const Topic = (props) => {
    const title = props.title;
    const id = props.id;
    const toggleFold = props.toggleFold;
    const unfold = props.unfold;
    const addTask = props.addTask;
    const folded_symbol = '>';
    const unfolded_symbol = 'v';
/*onClick={()=>(toggleCollapse(id))}*/
    return ( <div className='topic' onClick={()=>toggleFold(id)}>
        {unfold?unfolded_symbol:folded_symbol} {title}
        
        <button className='topicAddTask'
        onClick={(e)=>(e.stopPropagation(),addTask())}>Add task</button>
         </div>);
}
 
export default Topic;