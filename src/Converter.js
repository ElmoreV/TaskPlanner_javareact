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
const convert_old_topic_tasks_to_new_topic_tasks=(topic,tasks)=>{
    // const find_topic_by_name=(name)=>{}
    // const find_topic_by_id = (id)=>{}
    let new_topics = []
    let new_tasks = []
    let topics_table ={names:[],id:[]}
    /*
    // Recurse through topics
    // for every topic, save it in the topics_table (topic_name, topic_id)
    // copy over topic.title to topic.name
    // copy over topic.id
    // copy over topic.unfolded
    */
    const recurse_topics =(subtopic)=>{
        let new_topic = {name:subtopic.title,
                id:subtopic.id,
                unfolded:subtopic.unfolded}
        topics_table.name = topics_table.name.concat(subtopic.title)
        topics_table.id = topics_table.id.concat(subtopic.id)
   }
    /*
    // every task:
    // copy over taskName to name
    // copy over key to id
    // copy over completed
    // find the topic_id for every topic_name in topics 


    */

}

const convert_new_topic_tasks_to_old_topic_tasks=(topic,tasks)=>{
    return
}

const convert_relational_to_topic_tasks=(topic_table,topic_subtopic_table,
    task_table,topic_task_interaction_table)=>{
    // relational to new topic tasks
    return
}


// const convert_topic_tasks_to_relational=(topic,tasks)=>{
//     // new_topic_tasks to relational

//     topic_table = new Array();
//     topic_subtopic_table = new Array();
//     task_table = {id:[],name:[],completed:[]}
//     tasks.map((t)=>{
//         task_table.id = task_table.id.concat(t.id)
//         task_table.name = task_table.id.concat(t.name)
//         task_table.completed = task_table.id.concat(t.completed)
//     })

//     topic_task_table = new Array();

//     const parse_topics_r=()=>{
//         // add topic to system
//         // if tasks have this topic: add topic and task to topic_task
//         // 
//     }

    

//     return [topic_table,topic_subtopic_table,task_table,topic_task_interaction_table]

// }

// const convert_topic_tasks_to_hierarchical=(topic,tasks)=>{
//     // new_topic_tasks to hierarchical


//     return [topic_hierarchy, tasks]
// }

// const convert_hierarchical_to_topic_tasks= (topic_hierarchy, tasks)=>{

//     return [topics,tasks]
// }

// export default Converter
export default convert_old_topic_tasks_to_new_topic_tasks;