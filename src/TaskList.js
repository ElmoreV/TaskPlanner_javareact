import { useState, useRef} from 'react';
import Task from './Task'
import Topic from './Topic';



const TaskList = () => {
    const [topics,setTopics] = useState([
        {title:"Onderhoud",id:1,unfolded:false,subtopics:[
            {title:"Vervangen",id:11,unfolded:false,subtopics:[]},
            {title:"Repareren",id:12,unfolded:false,subtopics:[]},
            
        ]},
        {title:"Ontspanning",id:2,unfolded:false,subtopics:[
            {title:"Gamen",id:21,unfolded:false,subtopics:[]}
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
        {taskName:"Fiets repareren",key:0,topics:["Repareren"],completed:true},
        {taskName:"Outer Wilds",key:1, topics:["Gamen","Onderhoud"],completed:false},
        {taskName:"Badkamer",key:2,topics:["Onderhoud"],completed:true},
        {taskName:"Backup opruimen",key:5,topics:["Onderhoud"],completed:false},
    ])

    const getFreeTaskKey=()=>{
        return 1+tasks.reduce((max_key,task)=>Math.max(max_key,task.key),0);
    }

    const getLargestTopicKey=(topic)=>{
        let max_id  = Math.max(topic.id,
            topic.subtopics.reduce((max_key,topic)=>Math.max(max_key,getLargestTopicKey(topic)),0)); 
        console.log(max_id,topic.title)
        return max_id;
    }
    const getFreeTopicKey=()=>{
        let max_id = 1+topics.reduce((max_key,topic)=>Math.max(max_key,getLargestTopicKey(topic)),0);
        console.log(max_id)
        return max_id;
    }

    const getChangeTaskTopic = ()=>{
        const changeTaskTopic = (key,oldTopic,newTopic)=>{
            const newTasks = tasks.map((task) => {
                if (task.key == key) //cannot be ===?
                {
                    if (task.topics.includes(oldTopic)){
                    return{
                        ...task,
                        topics: task.topics.map((topic) => topic == oldTopic ? newTopic : topic)
                    }
                }}
                return task;
            });
            setTasks(newTasks);
        }

        return changeTaskTopic

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

    const getSetTopicNameFunc= (id)=>{
        const setTopicName = (newTopicName)=>{
            const newTopics = [...topics];
            const topic_to_change = find_topic_by_key(id);
            topic_to_change.title = newTopicName;
            setTopics(newTopics);
        }
        return setTopicName;

    }

    const getUpdateTaskTopics = (topic_name)=>{
        const updateTaskTopics = (newTopicName)=>{

            const newTasks = tasks.map((task) => {
                if (task.topics.includes(topic_name)){
                    return{
                        ...task,
                        topics: task.topics.map((topic) => topic === topic_name ? newTopicName : topic)
                    }
                }
                console.log(task);
                return task;
            });

            console.log(newTasks);
            setTasks(newTasks);
        }
        return updateTaskTopics;
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

    const getCompleteTask = (key)=>{
        const completeTask = ()=>{
            const newTasks = [...tasks]
            const task_to_change = newTasks.find((task)=>task.key===key);
            task_to_change.completed = !task_to_change.completed;
            setTasks(newTasks);
        }
        return completeTask;
    }

    const addTopic = ()=>
    {
        let newTopics = [...topics];
        const addedTopic = {title:`New Topic ${getFreeTopicKey()}`,id:getFreeTopicKey(),unfolded:false,subtopics:[]}
        newTopics.push(addedTopic);
        console.log(newTopics);
        setTopics(newTopics);
    }

    const addSubtopic_r = (topic,superTopic,newSubTopic)=>{
        if (topic.id==superTopic.id)
        {
            //Add subtopic here
            topic.subtopics =[...topic.subtopics,
            newSubTopic];
            return topic;
        }else{
            //recurse through all subtopics
            return {...topic,
                subtopics:topic.subtopics.map((topic)=>addSubtopic_r(topic,superTopic,newSubTopic))}
        }
    }
    const addSubtopic = (topic)=>
    {
        console.log('In AddSubTopic')
        console.log(topic);
        let newTopics = [...topics]
        const addedTopic = {title:`New Topic ${getFreeTopicKey()}`,id:getFreeTopicKey(),unfolded:false,subtopics:[]}
        console.log(addedTopic)
        console.log('start recursion')
        // now add this topic at the exact right spot
        // recurse through newTopics
        // and return the changed topic if it is the right topic
        newTopics= newTopics.map((topic_r)=>addSubtopic_r(topic_r,topic,addedTopic));

        setTopics(newTopics);
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
            {topic.unfolded = !topic.unfolded; return true;}
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
                            setTopicName = {getSetTopicNameFunc(topic.id)}
                            updateTaskTopics = {getUpdateTaskTopics(topic.title)}
                            id={topic.id} 
                            toggleFold = {toggleFold} 
                            unfolded={topic.unfolded}
                            addTask = {()=>(addTask(topic.id))}
                            addSubTopic = {()=>(addSubtopic(topic))} /></li>
        <ul>{topic.unfolded && topic.subtopics.map((subtopic)=>(
            recursiveShowTopic(subtopic)
            ))}</ul>
            <ul>                
                {topic.unfolded && tasks.map((task)=>(
                (task.topics.includes(topic.title))?
                <li><Task taskName={task.taskName} 
                taskKey = {task.key}
                setTaskName={getSetTaskNameFunc(task.key)}
                deleteTask = {getDeleteTask(task.key)}
                completed = {task.completed} 
                completeTask = {getCompleteTask(task.key)}
                currentTopic = {topic.title}
                changeTopic = {getChangeTaskTopic()}/></li>:null))}
            </ul></div>
        )
    }


    const exportjson=()=>{
        const jsonContent = JSON.stringify({topics,tasks});
        const blob = new Blob([jsonContent], {type: "application/json"});
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = "tasks_topics.json";
        a.click();
    }
    // console.log(tasks[0].topics.includes(topics[0].title))
    const importjson=(file)=>{

    };
    // const [file,setFile] = useState(null);
    const fileInputRef = useRef(null);


    const handleFileToUpload=(e)=>{
        console.log('upload start')
        if (e.target.files) {
            // setFile(e.target.files[0]);
            var file = e.target.files[0];
          }
          console.log('file?')
          console.log()
          if (file){
            const reader = new FileReader();
            reader.onload = (evt)=>{
                console.log('file loaded now parsing')
                try{
                    const uploadedData = JSON.parse(evt.target.result);
                    console.log(uploadedData.topics);
                    console.log(uploadedData.tasks);
                    
                    setTopics(uploadedData.topics);
                    setTasks(uploadedData.tasks);
                }catch(e){
                    console.error('Uploaded file is not JSON enough.',e);
                }
            }
            console.log('start reading')

            reader.readAsText(file);
        }
    }

    

    return ( 
    // <div>
        <div className='task-list'>
        <button onClick = {addTopic}> Add New Root topic</button>
        <ul>
        {topics.map((topic)=>(recursiveShowTopic(topic)))}
        </ul>
        <button onClick = {exportjson}>Export Tasks</button>
         <input type="file" 
                 ref={fileInputRef}
         onChange={handleFileToUpload}/>

    </div>
    
    );
}
 
export default TaskList;