// These are the contents of the TaskBar
// Leave any logic out of the contents component
// Instead, make it a prop of the TaskContent
// 


const TaskContent = (props) => {

    console.debug("Rendering TaskUI")
    const { classStr,
        selectStyle, selectHandlers,
        dragHandlers, dropHandlers, duplicateDragHandlers,
        name, textEditHandlers, inputRef, isEditing, toggleEdit,
        topicPath,
        color,
        deleteTask,
        completed, completeTask,
        planned, plan, unplan,
        repeated, toggleRepeatTask,
        scheduled, scheduleTask,
    } = props;

    const captureClick = (func) => {
        const wrapper = (e) => {
            e.stopPropagation()
            return func()
        }
        return wrapper
    }

    return (<div className={classStr}
        style={selectStyle}
        onDoubleClick={toggleEdit}
        {...selectHandlers}
        {...dragHandlers}
        {...dropHandlers}>
        <div className="textBar"
            style={{ width: topicPath ? "570px" : "425px" }}>
            <span className="taskText">
                {isEditing ?
                    <input type='text'
                        value={name}
                        width="430px"
                        {...textEditHandlers}
                        ref={inputRef}
                    /> :
                    //  <span style={{color : color}}>{name}</span>
                    <span style={{
                        color: color,
                    }}>{name}</span>

                }
            </span>
            {topicPath && <span className="topicPath">{topicPath}</span>}
        </div>
        <>
            {deleteTask && (<button className='taskDelete' onClick={captureClick(deleteTask)}>Delete</button>)}
            {!completed && completeTask && (<button className='taskComplete' onClick={captureClick(completeTask)}>Complete</button>)}
            {completed && completeTask && (<button className='taskComplete' onClick={captureClick(completeTask)}>Decomplete</button>)}
            {unplan && planned && (<button className='moveToWeek' onClick={captureClick(unplan)}> Unplan </button>)}
            {plan && !planned && (<button className='moveToWeek' onClick={captureClick(plan)}> Plan </button>)}
            {toggleRepeatTask && repeated && (<button className='makeRepeated' onClick={captureClick(toggleRepeatTask)}> Repeated </button>)}
            {toggleRepeatTask && !repeated && (<button className='makeRepeated' onClick={captureClick(toggleRepeatTask)}> Not repeated </button>)}
            {scheduled && scheduleTask && (<button className='taskSchedule' onClick={captureClick(scheduleTask)}>Scheduled!</button>)}
            {!scheduled && scheduleTask && (<button className='taskSchedule' onClick={captureClick(scheduleTask)}>Unscheduled</button>)}
            {duplicateDragHandlers && <span className='buttonDuplicate' {...duplicateDragHandlers}>+ Duplicate +</span>}
        </>
    </div>);
}

export default TaskUI;