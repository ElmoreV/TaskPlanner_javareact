import { V0_Task, V0_Topic } from "../V0_types";
import { V1_Task, V1_Topic } from "../V1_types";

// 25.02.2024 Topic Tasks (choice between id and key is not important
// let's use id, because they're internal)

export const convert_v0_to_v1 = (
  topics: V0_Topic[],
  tasks: V0_Task[]
): [V1_Topic[], V1_Task[]] => {
  console.log("Old to new conversion");
  let new_topics = [];
  let new_tasks = [];
  let topics_table = { name: [], id: [] };
  /*
      // Recurse through topics
      // for every topic, save it in the topics_table (topic_name, topic_id)
      // copy over topic.title to topic.name
      // copy over topic.id and topic.unfolded
      */
  const recurse_topics = (subtopic: V0_Topic) => {
    var new_topic = {
      name: subtopic.title,
      id: subtopic.id,
      unfolded: subtopic.unfolded,
      subtopics: [],
    };
    topics_table.name = topics_table.name.concat(subtopic.title);
    topics_table.id = topics_table.id.concat(subtopic.id);
    new_topic.subtopics = subtopic.subtopics.map((t) => {
      return recurse_topics(t);
    });
    return new_topic;
  };
  new_topics = topics.map((t) => {
    return recurse_topics(t);
  });

  /*
      // every task:
      // copy over taskName to name
      // copy over key to id
      // copy over completed
      // find the topic_id for every topic_name in topics 
      */
  const get_topic_id = (tt) => {
    //idx= topics_table.name.findIndex(tt)
    let idx = topics_table.name.findIndex((ttt) => ttt == tt);
    return topics_table.id[idx];
    // return topics_table.id[idx]
  };
  const handle_task = (t) => {
    let new_t = {
      name: t.taskName,
      id: t.key,
      completed: t.completed,
      thisWeek: t.thisWeek,
      topics: t.topics.map((tt) => get_topic_id(tt)),
    };
    // console.debug(new_t)
    // console.debug(t)
    return new_t;
  };
  new_tasks = tasks.map((t) => handle_task(t));
  // console.debug(new_tasks)
  return [new_topics, new_tasks];
};

export const convert_v1_to_v0 = (
  topics: V1_Topic[],
  tasks: V1_Task[]
): [V0_Topic[], V0_Task[]] => {
  console.log("New to old conversion");
  let old_topics = [];
  let old_tasks = [];
  let topics_table = { name: [], id: [] };
  /*
      // Recurse through topics
      // for every topic, save it in the topics_table (topic_name, topic_id)
      // copy over topic.title to topic.name
      // copy over topic.id and topic.unfolded
      */
  const recurse_topics = (subtopic: V1_Topic) => {
    var old_topic = {
      title: subtopic.name,
      id: subtopic.id,
      unfolded: subtopic.unfolded,
      subtopics: [],
    };
    topics_table.name = topics_table.name.concat(subtopic.name);
    topics_table.id = topics_table.id.concat(subtopic.id);
    old_topic.subtopics = subtopic.subtopics.map((t) => {
      return recurse_topics(t);
    });
    return old_topic;
  };
  old_topics = topics.map((t) => {
    return recurse_topics(t);
  });

  /*
      // every task:
      // copy over taskName to name
      // copy over key to id
      // copy over completed
      // find the topic_id for every topic_name in topics 
      */
  const get_topic_name = (tt) => {
    //idx= topics_table.name.findIndex(tt)
    let idx = topics_table.id.findIndex((ttt) => ttt == tt);
    return topics_table.name[idx];
    // return topics_table.id[idx]
  };
  const handle_task = (t) => {
    let old_t = {
      taskName: t.name,
      key: t.id,
      completed: t.completed,
      thisWeek: t.thisWeek,
      topics: t.topics.map((tt) => get_topic_name(tt)),
    };
    // console.debug(old_t)
    // console.debug(t)
    return old_t;
  };
  old_tasks = tasks.map((t) => handle_task(t));
  // console.debug(old_tasks)
  return [old_topics, old_tasks];
};
