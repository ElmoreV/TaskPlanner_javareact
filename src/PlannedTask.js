import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTopicPathByTopicId } from './TopicHelper';
import TaskContent from './TaskContent'
import { FinishedState } from './TaskInterfaces.tsx';
import { translateLastCompletedDatetime } from './TaskHelperFuncs.js';

const PlannedTask = (props) => {
    const { taskKey, taskName, setTaskName, deleteTask,
        completed, completeTask,
        taskFinishStatus, setTaskFinishStatus,
        scheduled, scheduleTask,
        planned, unplan, topics, taskTopics,
        selectedTasks, addToSelection, deleteFromSelection, selected, clearSelection,
        changeWeekOrderIndex, currentWeekOrderIndex,
        fancy, taskLastCompletion,
        spawnNewTask,
        hasSubTasks, toggleFold, unfolded,
    } = props;

    console.debug("Rendering PlannedTask")
    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);

    const folded_symbol = '>';
    const unfolded_symbol = 'v';

    // let repeated = true
    const markTaskIrrelevant = () => {
        if (taskFinishStatus == FinishedState.Irrelevant) { setTaskFinishStatus(FinishedState.NotFinished) }
        else {
            setTaskFinishStatus(FinishedState.Irrelevant)
        }
    }

    const markTaskImpossible = () => {
        if (taskFinishStatus == FinishedState.Impossible) { setTaskFinishStatus(FinishedState.NotFinished) }
        else {
            setTaskFinishStatus(FinishedState.Impossible)
        }
    }


    const handleChange = (e) => {
        console.info(e.target.value);
        if (setTaskName) { setTaskName(e.target.value); }
    }

    const toggleEdit = () => {
        setIsEditing(true);
        // TODO: Should actually clear the entire selection maybe?
        clearSelection()
        setIsDraggingAllowed(false);
        // TODO: set focus on text edit box

    }

    const handleDragStart = (e) => {
        setIsDragging(true)
        e.dataTransfer.setData('taskId', taskKey)
        e.dataTransfer.setData('sourceWeekOrderIndex', currentWeekOrderIndex)
    }
    const handleDragEnd = () => {
        setIsDragging(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.target.setAttribute('draggedOver', false)
        console.info('drop')
        var sourceTaskIds = []
        var sourceWeekOrderIndidces = []

        var sourceTaskId = Number(e.dataTransfer.getData("taskId"))
        var sourceWeekOrderIndex = Number(e.dataTransfer.getData("sourceWeekOrderIndex"))
        console.log(`Dropping from task with id=${sourceTaskId} with weekIndex=${sourceWeekOrderIndex} on task with id=${taskKey} with weekIndex=${currentWeekOrderIndex}`)
        sourceTaskIds.push(sourceTaskId)
        sourceWeekOrderIndidces.push(sourceWeekOrderIndex)
        if (selectedTasks && selectedTasks.length > 0) {
            selectedTasks.forEach((st) => {
                console.info(`Changing weekOrderIdx of task with id ${st.taskId} from wOrderIdx ${st.weekOrderIndex} to wOrderIdx ${currentWeekOrderIndex}`)
                sourceTaskIds.push(st.taskId)
                sourceWeekOrderIndidces.push(st.weekOrderIndex)
            })
        }
        if (changeWeekOrderIndex) {
            changeWeekOrderIndex(sourceTaskIds,
                sourceWeekOrderIndidces,
                currentWeekOrderIndex)
        }
        clearSelection()
    }
    const handleDragOver = (e) => {
        e.preventDefault();
        // this is not perfect, because I always want the <div class='task'> to be the target..
        e.target.setAttribute('draggedOver', true);
    }
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.target.setAttribute('draggedOver', false);
    }

    const moveToWeek = () => {
        if (unplan) { unplan() }
    }

    const handleKeyDown = (event) => {
        // Check if the Enter key was pressed
        if (event.key === 'Enter') {
            // Call handleBlur or directly implement logic to finish editing
            handleBlur();
            // Prevents the form from being submitted if your input is part of one
            event.preventDefault();
        }
    };
    const handleToggleFold = () => {
        if (!isEditing) {
            toggleFold(taskKey);
        }
    };
    const handleBlur = () => {
        setIsDraggingAllowed(true);
        setIsEditing(false);

    }

    const captureClick = (func) => {
        const wrapper = (e) => {
            e.stopPropagation()
            return func()
        }
        return wrapper
    }

    let class_str = 'task'
    // Completion has precedence over planned
    if (completed || taskFinishStatus === FinishedState.Completed) { class_str = 'taskCompleted' }
    else if (taskFinishStatus === FinishedState.Irrelevant) { class_str = "taskIrrelevant" }
    else if (taskFinishStatus === FinishedState.Impossible) { class_str = "taskImpossible" }
    else if (scheduled) { class_str = 'taskPlanned' }



    let selectStyle = {}
    if (selected) {
        selectStyle = {
            borderStyle: "dashed",
            borderWidth: "2px",
            margin: "0px"
        }
    }
    const dragHandlers = isDraggingAllowed ? { draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd } : {};
    const dropHandlers = isDragging ? {} : { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave };

    const selectHandlers = selected ? { onClick: captureClick(deleteFromSelection) } : { onClick: captureClick(addToSelection) }
    const textEditHandlers = {
        onChange: handleChange, onBlur: handleBlur, onKeyDown: handleKeyDown, onClick: captureClick(() => { })
    }

    let fullName = taskName
    if (
        (taskFinishStatus !== FinishedState.Impossible || taskFinishStatus !== FinishedState.Irrelevant) &&
        taskLastCompletion &&
        !isEditing
    ) {
        console.warn("taskLastCompletion", taskLastCompletion)
        fullName += " / " + translateLastCompletedDatetime(taskLastCompletion)
    }

    let topicPath = getTopicPathByTopicId(topics, taskTopics[0])

    // Put focus on text editor when editing is enabled
    const inputRef = useRef(null);
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]); // Dependency array ensures this runs only when isEditing changes

    return (<>
        <TaskContent classStr={class_str}
            selectStyle={selectStyle}
            selectHandlers={selectHandlers}
            dragHandlers={dragHandlers}
            dropHandlers={dropHandlers}
            name={fullName}
            textEditHandlers={textEditHandlers}
            inputRef={inputRef}
            isEditing={isEditing}
            toggleEdit={toggleEdit}
            topicPath={topicPath}
            deleteTask={deleteTask}
            markTaskIrrelevant={markTaskIrrelevant}
            markTaskImpossible={markTaskImpossible}
            taskFinishStatus={(taskFinishStatus ? taskFinishStatus : (completed ? FinishedState.Completed : FinishedState.NotFinished))}
            completeTask={completeTask}
            planned={true}
            unplan={unplan}
            scheduled={scheduled}
            scheduleTask={scheduleTask}
            textBarWidth="570px"
            fancy={fancy}
            spawnNewTask={spawnNewTask}

            foldingSymbol={hasSubTasks ? (unfolded ? unfolded_symbol : folded_symbol) : null}
            toggleFold={hasSubTasks ? handleToggleFold : null}

        />

    </>)

}

PlannedTask.propTypes = {
    taskName: PropTypes.string.isRequired,
    setTaskName: PropTypes.func,
    deleteTask: PropTypes.func,
    completed: PropTypes.bool.isRequired,
    completeTask: PropTypes.func
};


export default PlannedTask;