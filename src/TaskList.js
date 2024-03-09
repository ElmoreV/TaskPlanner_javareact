import { useState } from 'react';
import Task from './Task'
import Topic from './Topic';
// import Checkbox from './Checkbox'
import {
    convert_old_topic_tasks_to_new_topic_tasks,
    convert_topic_tasks_to_relational,
    convert_new_topic_tasks_to_old_topic_tasks
} from './Converter';
import ImportExport from './ImportExport';
import {
    find_topic_by_key,
    getFreeTaskKey,
    getFreeTopicKey,
    isTaskInAnyTopic,
    filter_by_name_r,
    find_supertopic_by_id
} from './TopicHelper';


const TaskList = (props) => {
    const { tasks, setTasks, topics, setTopics } = props;

    const [hideCompletedItems, setHideCompletedItems] = useState(false)

    // Below
    // Function generators

    // Can be used for v1 mode. 
    const getChangeTaskTopicById = () => {
        // Key here is the key of the task
        // oldTopic is the topic-object where the task came from
        // newTopic is the topic-object where the task is going to

        const changeTaskTopic = (key, oldTopicId, newTopicId) => {
            console.debug('Inside change task topic (by id)')
            const newTasks = tasks.map((task) => {
                if (task.id == key) //cannot be ===?
                {
                    if (task.topics.includes(oldTopicId)) {
                        return {
                            ...task,
                            topics: task.topics.map((topic) => topic == oldTopicId ? newTopicId : topic)
                        }
                    }
                }
                return task;
            });
            setTasks(newTasks);
        }

        return changeTaskTopic

    }

    // Below
    // Function generators
    // For v0 data
    const getChangeTaskTopic = () => {
        // Key here is the key of the task
        // oldTopic is the topic-object where the task came from
        // newTopic is the topic-object where the task is going to

        const changeTaskTopic = (key, oldTopicName, newTopicName) => {
            console.debug('Inside change task topic')
            console.debug(key)
            const newTasks = tasks.map((task) => {
                if (task.key == key) //cannot be ===?
                {
                    console.debug('relevant task')
                    console.debug(task)
                    if (task.topics.includes(oldTopicName)) {
                        return {
                            ...task,
                            topics: task.topics.map((topic) => topic == oldTopicName ? newTopicName : topic)
                        }
                    }
                    console.debug(task)
                }
                return task;
            });
            setTasks(newTasks);
        }

        return changeTaskTopic

    }
    // Both for v0 and v1 data
    const getMoveTopic = () => {
        const moveTopic = (source_id, target_id) => {
            console.info(`Moving topic ${source_id} to ${target_id}`)
            // Cannot move a topic into one of its sub(sub)topics
            let source_topic = find_topic_by_key(topics, source_id)
            console.info(source_topic)
            let is_sub_topic = find_topic_by_key(source_topic.subtopics, target_id)
            if (is_sub_topic) {
                console.log("Cannot move a topic to its own subtopic")
                return
            }
            // If the target topic is the sources topic direct supertopic, also don't do it
            // Find the super topic of the source topic
            const newTopics = [...topics];
            let source_supertopic = find_supertopic_by_id(newTopics, source_id)
            if (source_supertopic.id == target_id) {
                console.log("Will not move a topic to its direct supertopic. It does nothing")
                return

            }
            let target_topic = find_topic_by_key(newTopics, target_id)
            console.info(target_topic)
            console.info(source_supertopic)
            // Copy the topic into the new topic
            target_topic.subtopics.push(source_topic)
            // Delete the topic out of its current spot
            source_supertopic.subtopics = source_supertopic.subtopics.filter((t) => t.id != source_topic.id)
            setTopics(newTopics)
        }
        return moveTopic
    }

    // For v1 data
    const getSetTaskNameFuncV1 = (id) => {
        const setTaskName = (newTaskName) => {
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.id === id);
            task_to_change.taskName = newTaskName;
            setTasks(newTasks);
        }
        return setTaskName;
    }

    // For v0 data
    const getSetTaskNameFunc = (key) => {
        const setTaskName = (newTaskName) => {
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.key === key);
            task_to_change.taskName = newTaskName;
            setTasks(newTasks);
        }
        return setTaskName;
    }

    // For v1 data
    const getSetTopicNameFuncV1 = (id) => {
        const setTopicName = (newTopicName) => {
            const newTopics = [...topics];
            const topic_to_change = find_topic_by_key(topics, id);
            topic_to_change.name = newTopicName;
            setTopics(newTopics);
        }
        return setTopicName;
    }

    // For v0 data
    const getSetTopicNameFunc = (id) => {
        const setTopicName = (newTopicName) => {
            const newTopics = [...topics];
            const topic_to_change = find_topic_by_key(topics, id);
            topic_to_change.title = newTopicName;
            setTopics(newTopics);
        }
        return setTopicName;
    }

    // For v1 data
    const getUpdateTaskTopicsV1 = (topic_id) => {
        const updateTaskTopics = (newTopicId) => {
            const newTasks = tasks.map((task) => {
                if (task.topics.includes(topic_id)) {
                    return {
                        ...task,
                        topics: task.topics.map((topic) => topic === topic_id ? newTopicId : topic_id)
                    }
                }
                return task;
            });
            setTasks(newTasks);
        }
        return updateTaskTopics;
    }

    // For v0 data
    const getUpdateTaskTopics = (topic_name) => {
        const updateTaskTopics = (newTopicName) => {
            const newTasks = tasks.map((task) => {
                if (task.topics.includes(topic_name)) {
                    return {
                        ...task,
                        topics: task.topics.map((topic) => topic === topic_name ? newTopicName : topic)
                    }
                }
                return task;
            });
            setTasks(newTasks);
        }
        return updateTaskTopics;
    }


    //    const collectTopics (topic,task)
    // For v1 data
    const getDuplicateTaskV1 = () => {
        const duplicateTask = (task_id, topic_id) => {
            // Copy tasks
            let newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.id == task_id);
            console.debug(task_to_change)
            const topic_to_add = find_topic_by_key(topics, topic_id)
            if (task_to_change.topics.includes(topic_to_add.title)) {
                console.info("Task is already in topic")
                return;
            }
            task_to_change.topics.push(topic_to_add.title)
            setTasks(newTasks)
        }
        return duplicateTask
    }


    // For v0 data
    const getDuplicateTask = () => {
        const duplicateTask = (task_id, topic_id) => {
            // Copy tasks
            let newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.key == task_id);
            console.debug(task_to_change)
            const topic_to_add = find_topic_by_key(topics, topic_id)
            if (task_to_change.topics.includes(topic_to_add.title)) {
                console.info("Task is already in topic")
                return;
            }
            task_to_change.topics.push(topic_to_add.title)
            setTasks(newTasks)
        }
        return duplicateTask
    }

    // For v1 data
    const getDeleteTopicV1 = (id) => {
        // console.debug('Creating delete topic thingy')
        const deleteTopic = () => {

            let newTopics = [...topics]
            // filter recursively
            // TODO: create filter_by_id
            // newTopics = filter_by_id(newTopics, id);
            newTopics = filter_by_name_r(newTopics, id);
            // Find any orphan tasks (tasks without a topic)
            // and filter them
            // TODO: this is slow and not scalable. Fix when necessary.
            let newTasks = [...tasks]
            // all_subtopics = newTopics.
            newTasks = newTasks.filter((task) => isTaskInAnyTopic(task, newTopics))
            console.info('Length of tasks before deletion/length of tasks after deletion')
            console.info(tasks.length + ' / ' + newTasks.length)

            setTopics(newTopics);
            setTasks(newTasks);
        }
        return deleteTopic;
    }

    // For v0 data
    const getDeleteTopic = (name) => {
        // console.debug('Creating delete topic thingy')
        const deleteTopic = () => {

            let newTopics = [...topics]
            // filter recursively
            newTopics = filter_by_name_r(newTopics, name);
            // Find any orphan tasks (tasks without a topic)
            // and filter them
            // TODO: this is slow and not scalable. Fix when necessary.
            let newTasks = [...tasks]
            // all_subtopics = newTopics.
            newTasks = newTasks.filter((task) => isTaskInAnyTopic(task, newTopics))
            console.info('Length of tasks before deletion/length of tasks after deletion')
            console.info(tasks.length + ' / ' + newTasks.length)

            setTopics(newTopics);
            setTasks(newTasks);
        }
        return deleteTopic;
    }

    // For v1 data
    const getDeleteTaskV1 = (id) => {
        const deleteTask = () => {
            let newTasks = [...tasks]
            newTasks = newTasks.filter((task) => task.id !== id);
            setTasks(newTasks);

        }
        return deleteTask;
    }


    // For v0 data    
    const getDeleteTask = (key) => {
        const deleteTask = () => {
            let newTasks = [...tasks]
            newTasks = newTasks.filter((task) => task.key !== key);
            setTasks(newTasks);

        }
        return deleteTask;
    }

    // For v1 data
    const getCompleteTaskV1 = (id) => {
        const completeTask = () => {
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.id === id);
            task_to_change.completed = !task_to_change.completed;
            setTasks(newTasks);
        }
        return completeTask;
    }

    // For v0 data
    const getCompleteTask = (key) => {
        const completeTask = () => {
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.key === key);
            task_to_change.completed = !task_to_change.completed;
            setTasks(newTasks);
        }
        return completeTask;
    }

    // For v1 data
    const getPlanTaskForWeekV1 = (id) => {
        const planTaskForWeek = () => {
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.id === id);
            task_to_change.thisWeek = true;
            setTasks(newTasks);
        }
        return planTaskForWeek
    }

    // For v0 data
    const getPlanTaskForWeek = (id) => {
        const planTaskForWeek = () => {
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.key === id);
            task_to_change.thisWeek = true;
            setTasks(newTasks);
        }
        return planTaskForWeek
    }

    const getUnplanTask = (id) => {
        const unplanTask = () => {
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task) => task.key === id);
            task_to_change.thisWeek = false;
            setTasks(newTasks);
        }
        return unplanTask
    }


    const addTopic = () => {
        let newTopics = [...topics];
        const addedTopic = { title: `New Topic ${getFreeTopicKey(topics)}`, id: getFreeTopicKey(topics), unfolded: true, subtopics: [] }
        newTopics.push(addedTopic);
        console.debug(newTopics);
        setTopics(newTopics);
    }

    // This one might be separated
    const addSubtopic_r = (topic, superTopic, newSubTopic) => {
        if (topic.id == superTopic.id) {
            //Add subtopic here
            topic.subtopics = [...topic.subtopics,
                newSubTopic];
            return topic;
        } else {
            //recurse through all subtopics
            return {
                ...topic,
                subtopics: topic.subtopics.map((topic) => addSubtopic_r(topic, superTopic, newSubTopic))
            }
        }
    }
    const addSubtopic = (topic) => {
        console.log('In AddSubTopic')
        console.log(topic);
        let newTopics = [...topics]
        const addedTopic = { title: `New Topic ${getFreeTopicKey(topics)}`, id: getFreeTopicKey(topics), unfolded: false, subtopics: [] }
        console.log(addedTopic)
        console.log('start recursion')
        // now add this topic at the exact right spot
        // recurse through newTopics
        // and return the changed topic if it is the right topic
        newTopics = newTopics.map((topic_r) => addSubtopic_r(topic_r, topic, addedTopic));

        setTopics(newTopics);
    }

    const addTask = (topic_key) => {
        let newTasks = [...tasks];
        console.log(topic_key);
        const topic = find_topic_by_key(topics, topic_key);
        if (topic) {
            const addedTask = { taskName: `New Task ${getFreeTaskKey(tasks)}!`, key: getFreeTaskKey(tasks), topics: [topic.title] }
            newTasks.push(addedTask);
            console.log(newTasks);
            setTasks(newTasks);

        }

    }

    //Recursive function to handle all toggles
    const toggleFold_r = (topics, id) => {
        for (let topic of topics) {
            if (topic.id === id) { topic.unfolded = !topic.unfolded; return true; }
            if (toggleFold_r(topic.subtopics, id)) { return true; }
        }
        return false;
    }

    const toggleFold = (id) => {
        const newTopics = [...topics];
        if (toggleFold_r(newTopics, id)) {
            setTopics(newTopics);
        }
    }



    const converter_callback = () => {
        let [topics2, tasks2] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
        let [topics3, tasks3] = convert_new_topic_tasks_to_old_topic_tasks(topics2, tasks2)
        console.log(tasks, tasks3)
        console.log('Boy oh boy')
        for (let i = 0; i < tasks.length; i++) {
            console.log(tasks[i])
            console.log(tasks2[i])
            console.log(tasks3[i])
        }
        // let tables = convert_topic_tasks_to_relational(topics2,tasks2)
        // console.log('res')
        // console.log(topics2)
        // console.log(tasks2)
        // console.log(tables)
    }

    const recursiveShowTopic = (topic, tasks) => {
        // 1. Show topic
        // 2. Show all subtopics (and their subtopics and tasks)
        // 3. Show all tasks

        // Do not show subtopics when Topic is folded
        // console.debug('Hello2')
        // console.debug(topics)
        // console.debug(topic)


        return (<div><li key={topic.id}>
            <Topic title={topic.name}
                setTopicName={getSetTopicNameFunc(topic.id)}
                updateTaskTopics={getUpdateTaskTopics(topic.name)}
                id={topic.id}
                toggleFold={toggleFold}
                unfolded={topic.unfolded}
                addTask={() => (addTask(topic.id))}
                addSubTopic={() => (addSubtopic(topic))}
                deleteTopic={getDeleteTopic(topic.name)}
                changeTopic={getChangeTaskTopic()}
                moveTopic={getMoveTopic()}
                duplicateTask={getDuplicateTask()}
            />
        </li>
            <ul key={topic.id + '_topics'}>{topic.unfolded && topic.subtopics.map((subtopic) => (
                recursiveShowTopic(subtopic, tasks)
            ))}</ul>
            <ul key={topic.id + '_tasks'}>
                {topic.unfolded && tasks.map((task) => (
                    (!(task.completed && hideCompletedItems) && task.topics.includes(topic.id)) ?
                        <li key={topic.id + ' - ' + task.id}>
                            <Task taskName={task.name}
                                taskKey={task.id}
                                completed={task.completed}
                                currentTopicName={topic.name}
                                currentTopicId={topic.id}
                                setTaskName={getSetTaskNameFunc(task.id)}
                                deleteTask={getDeleteTask(task.id)}
                                completeTask={getCompleteTask(task.id)}
                                plan={getPlanTaskForWeek(task.id)}
                                unplan={getUnplanTask(task.id)}
                                planned={task.thisWeek}
                                changeTopic={getChangeTaskTopic()}
                                duplicateTask={getDuplicateTask()}

                            />
                        </li> : null))}
            </ul></div>
        )
    }


    const onHideCompletedItemsChange = () => {
        setHideCompletedItems(!hideCompletedItems)
    }

    const showTopics = () => {
        console.info('Re-rendering task list')
        let [topics2, tasks2] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks);
        return topics2.map((topic) => (recursiveShowTopic(topic, tasks2)))
    }
    return (
        // <div>
        <div className='task-list'>
            <button onClick={addTopic}> Add New Root topic</button><br />
            <label><input
                type="checkbox"
                name='HideCompletedItems'
                onChange={onHideCompletedItemsChange}
                className="form-check-input"
            />Hide completed tasks</label>
            <ul key='root_topics'>
                {showTopics()}
            </ul>
            <ImportExport
                tasks={tasks}
                topics={topics}
                setTasks={setTasks}
                setTopics={setTopics} />
            <button onClick={converter_callback}>Test Converter</button>

        </div>

    );
}

export default TaskList;