import { useState } from 'react';
import Task from './Task'
import Topic from './Topic';



const TaskList = () => {
    const [topics,setTopics] = useState([
        {title:"Onderhoud",id:1,unfold:false,subtopics:[
            {title:"Vervangen",id:11,unfold:false,subtopics:[]},
            {title:"Repareren",id:12,unfold:false,subtopics:[]},
            
        ]},
        {title:"Ontspanning",id:2,unfold:false,subtopics:[
            {title:"Gamen",id:21,unfold:false,subtopics:[]}
        ]}

    ]);
    const find_topic_by_key_r=(topics,topic_key)=>
    {
        console.log(topics);
        for (let topic of topics)
        {
            console.log(topic.id);
            if (topic.id === topic_key)
            {console.log('Fount it!');
                return topic;}
            let topic_res =  find_topic_by_key_r(topic.subtopics,topic_key);
            if (topic_res)
                {console.log('Bubble up');return topic_res;}
        }
        return null;
    }
    const find_topic_by_key=(topic_key)=>
    {
        return find_topic_by_key_r(topics,topic_key);
    }

    
    const [tasks,setTasks] = useState([
        {taskName:"Fiets repareren",key:0,topics:["Repareren"]},
        {taskName:"Outer Wilds",key:1, topics:["Gamen","Onderhoud"]},
        {taskName:"Badkamer",key:2,topics:["Onderhoud"]},
        {taskName:"Backup opruimen",key:3,topics:["Onderhoud"]},
    ])

    const getFreeTaskKey=()=>{
        let max_key = 0;
        tasks.map(t=>max_key=Math.max(max_key,t.key));
        return max_key+1;
    }

    const getSetTaskNameFunc= (key)=>{
        const setTaskName = (newTaskName)=>{
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task)=>task.key===key);
            task_to_change.taskName = newTaskName;
            setTasks(newTasks);
        }
        return setTaskName;

    }

    const getDeleteTask = (key)=>{
        const deleteTask = ()=>
        {
            let newTasks = [...tasks]
            newTasks = newTasks.filter((task)=>task.key!==key);
            setTasks(newTasks);

        }
        return deleteTask;
    }




    const addTask = (topic_key)=>{
        let newTasks = [...tasks];
        console.log(topic_key);
        const topic = find_topic_by_key(topic_key);
        if (topic)
        {
            const addedTask = {taskName:`New Task ${getFreeTaskKey()}!`,key:getFreeTaskKey(),topics:[topic.title]}
            newTasks.push(addedTask);
            console.log(newTasks);
            setTasks(newTasks);

        }

    }

    //Recursive function to handle all toggles
    const toggleFold_r = (topics,id)=>{
        for (let topic of topics){
            if (topic.id === id)
            {topic.unfold = !topic.unfold; return true;}
            if (toggleFold_r(topic.subtopics,id))
            {return true;}
        }
        return false;           
    }

    const toggleFold = (id)=>{
        const newTopics =[...topics];
        if (toggleFold_r(newTopics,id))
        {
            setTopics(newTopics);
        }
    }

    const recursiveShowTopic = (topic)=>
    {
        // 1. Show topic
        // 2. Show all subtopics (and their subtopics and tasks)
        // 3. Show all tasks

        // Do not show subtopics when Topic is folded

        return (<div><li><Topic title={topic.title} 
                            id={topic.id} 
                            toggleFold = {toggleFold} 
                            unfold={topic.unfold}
                            addTask = {()=>(addTask(topic.id))} /></li>
        <ul>{topic.unfold && topic.subtopics.map((subtopic)=>(
            recursiveShowTopic(subtopic)
            ))}</ul>
            <ul>                
                {topic.unfold && tasks.map((task)=>(
                (task.topics.includes(topic.title))?
                <li><Task taskName={task.taskName} 
                setTaskName={getSetTaskNameFunc(task.key)}
                deleteTask = {getDeleteTask(task.key)}/></li>:null))}
            </ul></div>
        )
    }



    // console.log(tasks[0].topics.includes(topics[0].title))



    return ( <div className='task-list'>
        <ul>
        {topics.map((topic)=>(recursiveShowTopic(topic)))}
        </ul>
    </div> );
}
 
export default TaskList;