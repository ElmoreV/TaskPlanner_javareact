// Format definitions
// Old topic-tasks
//  topics =  [
//    {title:"str",id:num,unfolded:bool,subtopics:[
// list of topics , ....
//     ]}
//     ]
// tasks = [
//      {taskName:"str",key:num,topics:["str=topic.title",...],completed:bool},
//       ...
// ]
// }
// 25.02.2024 Topic Tasks (choice between id and key is not important
// let's use id, because they're internal)
// topics =  [
//     {name:"str",id:num,unfolded:bool,
//      subtopics:[list of topics , ...]}
//     ]
// tasks = [
//      {name:"str",id:num,topics:[topic_id1, topic_id2,...],completed:bool},
//       ...
// ]
// }

// Relational 25.02.2024
// Normalized
// topics
// + id [PK] : int
// + name : str
// - unfolded : bool

// topic_subtopics
// + topic_id [FK] : int
// + subtopic_id [FK] : int

// tasks
// + id [PK] : int
// + name : str
// - completed : bool

// topic_tasks
// + topic_id [FK]
// + task_id [FK]
// Hierarchical 25.02.2024
//topic_hierarchy
// topic_obj = [name, id, subtopics=[subtopic_obj_1,subtopic_obj_2], tasks = [task_id_1, task_id_2]]
// tasks = [{id,name,completed},...]
const convert_old_topic_tasks_to_new_topic_tasks = (topics, tasks) => {

    console.log('Old to new conversion')
    let new_topics = []
    let new_tasks = []
    let topics_table = { name: [], id: [] }
    /*
    // Recurse through topics
    // for every topic, save it in the topics_table (topic_name, topic_id)
    // copy over topic.title to topic.name
    // copy over topic.id and topic.unfolded
    */
    const recurse_topics = (subtopic) => {
        var new_topic = {
            name: subtopic.title,
            id: subtopic.id,
            unfolded: subtopic.unfolded,
            subtopics: []
        }
        topics_table.name = topics_table.name.concat(subtopic.title)
        topics_table.id = topics_table.id.concat(subtopic.id)
        new_topic.subtopics = subtopic.subtopics.map((t) => { return recurse_topics(t) })
        return new_topic
    }
    new_topics = topics.map((t) => { return recurse_topics(t) })

    /*
    // every task:
    // copy over taskName to name
    // copy over key to id
    // copy over completed
    // find the topic_id for every topic_name in topics 
    */
    const get_topic_id = (tt) => {
        //idx= topics_table.name.findIndex(tt)
        let idx = topics_table.name.findIndex((ttt) => ttt == tt)
        return topics_table.id[idx]
        // return topics_table.id[idx]
    }
    const handle_task = (t) => {
        let new_t = {
            name: t.taskName,
            id: t.key,
            completed: t.completed,
            thisWeek: t.thisWeek,
            topics: t.topics.map((tt) => get_topic_id(tt))
        }
        // console.debug(new_t)
        // console.debug(t)
        return new_t
    }
    new_tasks = tasks.map((t) => (handle_task(t)))
    // console.debug(new_tasks)
    return [new_topics, new_tasks]
}

const convert_new_topic_tasks_to_old_topic_tasks = (topics, tasks) => {

    console.log('New to old conversion')
    let old_topics = []
    let old_tasks = []
    let topics_table = { name: [], id: [] }
    /*
    // Recurse through topics
    // for every topic, save it in the topics_table (topic_name, topic_id)
    // copy over topic.title to topic.name
    // copy over topic.id and topic.unfolded
    */
    const recurse_topics = (subtopic) => {
        var old_topic = {
            title: subtopic.name,
            id: subtopic.id,
            unfolded: subtopic.unfolded,
            subtopics: []
        }
        topics_table.name = topics_table.name.concat(subtopic.name)
        topics_table.id = topics_table.id.concat(subtopic.id)
        old_topic.subtopics = subtopic.subtopics.map((t) => { return recurse_topics(t) })
        return old_topic
    }
    old_topics = topics.map((t) => { return recurse_topics(t) })

    /*
    // every task:
    // copy over taskName to name
    // copy over key to id
    // copy over completed
    // find the topic_id for every topic_name in topics 
    */
    const get_topic_name = (tt) => {
        //idx= topics_table.name.findIndex(tt)
        let idx = topics_table.id.findIndex((ttt) => ttt == tt)
        return topics_table.name[idx]
        // return topics_table.id[idx]
    }
    const handle_task = (t) => {
        let old_t = {
            taskName: t.name,
            key: t.id,
            completed: t.completed,
            thisWeek: t.thisWeek,
            topics: t.topics.map((tt) => get_topic_name(tt))
        }
        // console.debug(old_t)
        // console.debug(t)
        return old_t
    }
    old_tasks = tasks.map((t) => (handle_task(t)))
    // console.debug(old_tasks)
    return [old_topics, old_tasks]
}

const convert_relational_to_topic_tasks = (topic_table, topic_subtopic_table,
    task_table, topic_task_interaction_table) => {
    // relational to new topic tasks
    return
}


const convert_topic_tasks_to_relational = (topics, tasks) => {
    //     // new_topic_tasks to relational

    let topic_table = { id: [], name: [], unfolded: [] }
    let topic_subtopic_table = { topic_id: [], subtopic_id: [] };
    let task_table = { id: [], name: [], completed: [] } //Done
    let topic_task_table = { topic_id: [], task_id: [] };
    tasks.map((t) => {
        task_table.id = task_table.id.concat(t.id)
        task_table.name = task_table.name.concat(t.name)
        task_table.completed = task_table.completed.concat(t.completed)
    })

    const recurse_topics = (subtopic) => {
        var new_topic = {
            name: subtopic.name,
            id: subtopic.id,
            // unfolded:subtopic.unfolded,
            // subtopics:[]
        }
        topic_table.name = topic_table.name.concat(subtopic.name)
        topic_table.id = topic_table.id.concat(subtopic.id)
        topic_table.unfolded = topic_table.unfolded.concat(subtopic.unfolded)
        let subtopics = subtopic.subtopics.map((t) => { return recurse_topics(t) })
        console.log(subtopics)
        subtopics.map((st) => {
            console.log(st)
            topic_subtopic_table.topic_id = topic_subtopic_table.topic_id.concat(subtopic.id);
            topic_subtopic_table.subtopic_id = topic_subtopic_table.subtopic_id.concat(st.id);
        })
        return new_topic
    }
    topics.map((t) => recurse_topics(t))
    const get_topic_id = (topic_name) => {
        //idx= topics_table.name.findIndex(tt)
        console.debug(topic_name)
        console.debug(topic_table.name)
        let idx = topic_table.name.findIndex((ttt) => ttt == topic_name)
        return topic_table.id[idx]
        // return topics_table.id[idx]
    }
    tasks.map((task) => {
        // go through t.topics
        // find relevant topic_id
        // add task_id:topic_id
        task.topics.map((topic_id) => {
            topic_task_table.topic_id = topic_task_table.topic_id.concat(topic_id)
            topic_task_table.task_id = topic_task_table.task_id.concat(task.id)
        })




    })

    //     const parse_topics_r=()=>{
    //         // add topic to system
    //         // if tasks have this topic: add topic and task to topic_task
    //         // 
    //     }



    return [topic_table, topic_subtopic_table, task_table, topic_task_table]

}

// const convert_topic_tasks_to_hierarchical=(topic,tasks)=>{
//     // new_topic_tasks to hierarchical


//     return [topic_hierarchy, tasks]
// }

// const convert_hierarchical_to_topic_tasks= (topic_hierarchy, tasks)=>{

//     return [topics,tasks]
// }

// export default Converter
export default convert_old_topic_tasks_to_new_topic_tasks;
export { convert_topic_tasks_to_relational };
export { convert_old_topic_tasks_to_new_topic_tasks };
export { convert_new_topic_tasks_to_old_topic_tasks };
