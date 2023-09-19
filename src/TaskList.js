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


    
    const [tasks,setTasks] = useState([
        {taskName:"Fiets repareren",key:0,topics:["Repareren"]},
        {taskName:"Outer Wilds",key:1, topics:["Gamen","Onderhoud"]},
        {taskName:"Badkamer",key:2,topics:["Onderhoud"]},
        {taskName:"Backup opruimen",key:3,topics:["Onderhoud"]},
    ])

    const getSetTaskNameFunc= (key)=>{
        const setTaskName = (newTaskName)=>{
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task)=>task.key==key);
            task_to_change.taskName = newTaskName;
            setTasks(newTasks);
        }
        return setTaskName;

    }
    //Recursive function to handle all toggles
    const toggleFold_r = (topics,id)=>{
        for (let topic of topics){
            if (topic.id == id)
            {   
                topic.unfold = !topic.unfold;
                return true;
            }
            
            if (toggleFold_r(topic.subtopics,id))
            {
                return true;
            }
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
        // 2. Show all subtopics
        // 3. Show all tasks

        return (<div><li><Topic title={topic.title} id={topic.id} toggleFold = {toggleFold} unfold={topic.unfold} /></li>
        <ul>{topic.unfold && topic.subtopics.map((subtopic)=>(
            recursiveShowTopic(subtopic)
            ))}</ul>
            <ul>                
                {topic.unfold && tasks.map((task)=>(
                (task.topics.includes(topic.title))?
                <li><Task taskName={task.taskName} setTaskName={getSetTaskNameFunc(task.key)}/></li>:null))}
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