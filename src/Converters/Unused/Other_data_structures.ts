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

const convert_relational_to_topic_tasks = (
  topic_table,
  topic_subtopic_table,
  task_table,
  topic_task_interaction_table
) => {
  // relational to new topic tasks
  return;
};

const convert_topic_tasks_to_relational = (topics, tasks) => {
  //     // new_topic_tasks to relational

  let topic_table = { id: [], name: [], unfolded: [] };
  let topic_subtopic_table = { topic_id: [], subtopic_id: [] };
  let task_table = { id: [], name: [], completed: [] }; //Done
  let topic_task_table = { topic_id: [], task_id: [] };
  tasks.map((t) => {
    task_table.id = task_table.id.concat(t.id);
    task_table.name = task_table.name.concat(t.name);
    task_table.completed = task_table.completed.concat(t.completed);
  });

  const recurse_topics = (subtopic) => {
    var new_topic = {
      name: subtopic.name,
      id: subtopic.id,
      // unfolded:subtopic.unfolded,
      // subtopics:[]
    };
    topic_table.name = topic_table.name.concat(subtopic.name);
    topic_table.id = topic_table.id.concat(subtopic.id);
    topic_table.unfolded = topic_table.unfolded.concat(subtopic.unfolded);
    let subtopics = subtopic.subtopics.map((t) => {
      return recurse_topics(t);
    });
    console.log(subtopics);
    subtopics.map((st) => {
      console.log(st);
      topic_subtopic_table.topic_id = topic_subtopic_table.topic_id.concat(
        subtopic.id
      );
      topic_subtopic_table.subtopic_id =
        topic_subtopic_table.subtopic_id.concat(st.id);
    });
    return new_topic;
  };
  topics.map((t) => recurse_topics(t));
  const get_topic_id = (topic_name) => {
    //idx= topics_table.name.findIndex(tt)
    console.debug(topic_name);
    console.debug(topic_table.name);
    let idx = topic_table.name.findIndex((ttt) => ttt == topic_name);
    return topic_table.id[idx];
    // return topics_table.id[idx]
  };
  tasks.map((task) => {
    // go through t.topics
    // find relevant topic_id
    // add task_id:topic_id
    task.topics.map((topic_id) => {
      topic_task_table.topic_id = topic_task_table.topic_id.concat(topic_id);
      topic_task_table.task_id = topic_task_table.task_id.concat(task.id);
    });
  });

  //     const parse_topics_r=()=>{
  //         // add topic to system
  //         // if tasks have this topic: add topic and task to topic_task
  //         //
  //     }

  return [topic_table, topic_subtopic_table, task_table, topic_task_table];
};

// const convert_topic_tasks_to_hierarchical=(topic,tasks)=>{
//     // new_topic_tasks to hierarchical

//     return [topic_hierarchy, tasks]
// }

// const convert_hierarchical_to_topic_tasks= (topic_hierarchy, tasks)=>{

//     return [topics,tasks]
// }

// export default Converter
export { convert_topic_tasks_to_relational };
