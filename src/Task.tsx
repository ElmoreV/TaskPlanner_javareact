import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import TaskContent from './TaskContent'
import React from 'react';
import { FinishedState } from './TaskInterfaces.tsx';

const Task = (props) => {
    const { id, name, setTaskName, deleteTask,
        completed, completeTask,
        toggleFold, unfolded,
        taskFinishStatus, setTaskFinishStatus,
        currentTopicName, currentTopicId, moveTasks, currentTopicViewIndex,
        planned, plan, unplan,
        repeated, toggleRepeatTask, taskLastCompletion,
        selectedTasks, addToSelection, deleteFromSelection, selected,
        duplicateTask, setTasks, tasks,
        addSubTask, hasSubTasks,
        fancy,
    } = props;
    console.debug("Rendering Task")
    const folded_symbol = '>';
    const unfolded_symbol = 'v';



    if (taskFinishStatus === undefined) { }

    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingAllowed, setIsDraggingAllowed] = useState(true);
    let isDuplicateDragging = false;

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
        setTaskName(e.target.value);
    }


    const handleDragStart = (e) => {
        if (isDuplicateDragging) { return; }
        setIsDragging(true)
        e.dataTransfer.setData('Type', "Task")
        e.dataTransfer.setData('TaskId', id)
        e.dataTransfer.setData('TopicName', currentTopicName)
        e.dataTransfer.setData('TopicId', currentTopicId)
        console.info('Dragging task')
    }
    const handleDragEnd = () => {
        //TODO: how is this event still called when dropping duplicate?
        if (isDuplicateDragging) { return; }
        console.info("Stop dragging task")
        setIsDragging(false)
    }

    const handleDuplicateDragStart = (e) => {
        // How to prevent the normal drag to happen?
        setIsDragging(true)
        isDuplicateDragging = true;
        e.dataTransfer.setData("Type", "TaskDuplicate")
        e.dataTransfer.setData('TaskId', id)
        console.info('Duplicate dragging task')
    }
    const handleDuplicateDragEnd = () => {
        isDuplicateDragging = false;
        console.info("Stop duplicate dragging task")
        setIsDragging(false)
    }
    const handleToggleFold = () => {
        if (!isEditing) {
            toggleFold(id);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault()
        e.target.setAttribute('draggedOver', false)
        console.info('drop')
        var type = e.dataTransfer.getData("Type")
        if (type == "Task") {
            var task_id = Number(e.dataTransfer.getData("TaskId"))
            var oldTopicId = Number(e.dataTransfer.getData("TopicId"))
            console.info(`Dropped task with id ${task_id} with old topic id ${oldTopicId} on task (id:${id}) within topic with id ${currentTopicId}`)
            // console.info(changeTopic)
            let taskIds = []
            let oldTopicIds = []
            taskIds.push(task_id)
            oldTopicIds.push(oldTopicId)
            console.info(selectedTasks)
            if (selectedTasks && selectedTasks.length > 0) {
                selectedTasks.forEach((st) => {
                    console.info(`Changing topic of task with id ${st.taskId} from topic with id ${st.topicId} to topic with id ${currentTopicId}`)
                    taskIds.push(st.taskId)
                    oldTopicIds.push(st.topicId)
                })
            }

            if (moveTasks) {
                moveTasks(taskIds, oldTopicIds, currentTopicId, currentTopicViewIndex)
            }
        } else if (type == "TaskDuplicate") {
            var taskId = Number(e.dataTransfer.getData("TaskId"))
            console.info(`Duplicate dropped task with id ${taskId} on this topic with id ${currentTopicId}`)
            let taskIds = []
            taskIds.push(taskId)
            if (selectedTasks && selectedTasks.length > 0) {
                selectedTasks.forEach((st) => {
                    console.info(`Duplicating task with id ${st.taskId} to topic with id ${currentTopicId}`)
                    taskIds.push(st.taskId)
                })
            }
            duplicateTask(taskIds, currentTopicId, currentTopicViewIndex)
        } else {
            console.info("On a task, you can only drop another task (not a topic)")
        }
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
        plan()
    }
    const moveOutOfWeek = () => {
        unplan()
    }


    let class_str = 'task'
    // Completion has precedence over planned
    if (completed || taskFinishStatus === FinishedState.Completed) { class_str = 'taskCompleted' }
    else if (taskFinishStatus === FinishedState.Irrelevant) { class_str = "taskIrrelevant" }
    else if (taskFinishStatus === FinishedState.Impossible) { class_str = "taskImpossible" }
    else if (planned) { class_str = 'taskPlanned' }
    else if (repeated) { class_str = 'taskRepeated' }

    let selectStyle = {}
    if (selected) {
        selectStyle = {
            borderStyle: "dashed",
            borderWidth: "2px",
            margin: "0px"
        }
    }

    const toggleEdit = () => {
        setIsEditing(true);
        // TODO: Should actually clear the entire selection maybe?
        if (selected) { deleteFromSelection() }
        setIsDraggingAllowed(false);
        // inputRef.current.focus()
        // TODO: set focus on text edit box

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

    const handleBlur = () => {
        setIsDraggingAllowed(true);
        setIsEditing(false);
    }
    const inputRef = useRef(null);
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]); // Dependency array ensures this runs only when isEditing changes

    const captureClick = (func) => {
        const wrapper = (e) => {
            e.stopPropagation()
            return func()
        }
        return wrapper
    }
    const unselect = (func) => {
        const wrapper = (e) => {
            if (selected) { deleteFromSelection() }
            return func()

        }
        return wrapper
    }


    const dragHandlers = isDraggingAllowed ? { draggable: true, onDragStart: handleDragStart, onDragEnd: handleDragEnd } : {};
    const dropHandlers = isDragging ? {} : { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave };
    const textEditHandlers = { onChange: handleChange, onBlur: handleBlur, onKeyDown: handleKeyDown, onClick: captureClick(() => { }) }
    const selectHandlers = selected ? { onClick: captureClick(deleteFromSelection) } : { onClick: captureClick(addToSelection) }
    let fullName = name
    if (repeated && taskFinishStatus !== FinishedState.NotFinished &&
        taskLastCompletion
    ) {
        fullName += " / " + taskLastCompletion
    }
    const duplicateDragHandlers = isDraggingAllowed ? {
        draggable: true,
        onDragStart: handleDuplicateDragStart,
        onDragEnd: handleDuplicateDragEnd
    } : {}

    return (<TaskContent classStr={class_str}
        selectStyle={selectStyle}
        selectHandlers={selectHandlers}
        dragHandlers={dragHandlers}
        dropHandlers={dropHandlers}
        name={fullName}
        foldingSymbol={hasSubTasks ? (unfolded ? unfolded_symbol : folded_symbol) : null}
        toggleFold={hasSubTasks ? handleToggleFold : null}
        textEditHandlers={textEditHandlers}
        inputRef={inputRef}
        isEditing={isEditing}
        toggleEdit={toggleEdit}
        deleteTask={unselect(deleteTask)}
        addSubTask={unselect(addSubTask)}
        completeTask={completeTask}
        markTaskIrrelevant={markTaskIrrelevant}
        markTaskImpossible={markTaskImpossible}
        taskFinishStatus={(taskFinishStatus ? taskFinishStatus : (completed ? FinishedState.Completed : FinishedState.NotFinished))}
        planned={planned}
        plan={moveToWeek}
        unplan={moveOutOfWeek}
        repeated={repeated}
        toggleRepeatTask={toggleRepeatTask}
        duplicateDragHandlers={duplicateDragHandlers}
        fancy={fancy}
    />);
}

Task.propTypes = {
    name: PropTypes.string.isRequired,
    setTaskName: PropTypes.func,
    deleteTask: PropTypes.func,
    completed: PropTypes.bool.isRequired,
    completeTask: PropTypes.func,
    id: PropTypes.number,
    currentTopicId: PropTypes.number,
    currentViewIdx: PropTypes.number,
};


export default Task;