import YAML from "yaml";
export const parseYAML = (YAMLstr: string) => {
  // Expected:
  // - Name: '
  console.log("Parsing YAML");
  console.info(YAMLstr);
  let res = YAML.parse(YAMLstr);
  console.info(res);
  let parsedTasks = [];
  let importedTopics = [];
  const getFreeImportedTaskKey = () => {
    return (
      1 + parsedTasks.reduce((max_key, task) => Math.max(max_key, task.key), 0)
    );
  };
  let usedKeys = [0];

  const getFreeImportedTopicKey = () => {
    let max_id = 1 + Math.max(...usedKeys);
    usedKeys = usedKeys.concat(max_id);
    // console.log(max_id)
    return max_id;
  };
  const importNewTask = (name, superTopic) => {
    // TODO: check if a taskName already exists
    // And duplicates will be fused (add topics together)
    let newTask = {
      taskName: name,
      key: getFreeImportedTaskKey(),
      topics: [superTopic],
      complete: false,
    };
    parsedTasks = parsedTasks.concat(newTask);
  };
  const importNewTopic_r = (node) => {
    // Go through all objects in list
    // if mapping: is subtopic
    // if scalar/item: is tasks
    console.debug("New call of import");
    console.debug(node);
    let newTopics = [];
    // let newTopic = {
    //     id:getFreeImportedTopicKey(),
    //     title:'Hello',
    //     unfolded:true,
    //     subtopics:[]
    // }
    // let importedTopics = []
    console.debug("Enumerate properties");
    for (var key in node) {
      let newTopic = {
        id: getFreeImportedTopicKey(),
        title: "Hello",
        unfolded: true,
        subtopics: [],
      };
      let importedTopics = [];
      console.debug("Key: ");
      console.debug(key);
      newTopic.title = key;
      let val = node[key];
      console.debug("Val:");
      console.debug(val);
      if (typeof val === "string") {
        // Add new tasks
        console.debug("New task found head" + val);
        importNewTask(val, key);
      } else {
        if (val instanceof Array) {
          // It's an empty task list, ignore
          console.debug("List found head");
          for (let i = 0; i < val.length; i++) {
            let subnode = val[i];
            console.debug("Subnode is");
            console.debug(subnode);
            if (typeof subnode === "string") {
              // Add new tasks
              console.debug("New task found loop" + subnode);
              importNewTask(subnode, key);
            } else if (subnode instanceof Array) {
              // It's an empty task list, ignore
              console.debug("Empty list found  loop");
            } else {
              // It's an object/subtopic
              console.debug(typeof subnode);
              console.debug(subnode + "  loop");
              importedTopics = importedTopics.concat(importNewTopic_r(subnode));
              console.debug("End recurse loop");
            }
          }
        } else {
          // It's an object/subtopic
          console.debug(typeof val);
          console.debug(val + " head");
          importedTopics = importedTopics.concat(importNewTopic_r(val));
          console.debug("End recurse head");
        }
      }
      newTopic.subtopics = importedTopics;
      console.debug("new topic:");
      console.debug(newTopic);

      newTopics = newTopics.concat(newTopic);
    }
    console.debug("new topics/ret_obj:");
    console.debug(newTopics);
    return newTopics;

    // newTopic.subtopics = importedTopics
    // console.log(newTopic)
    // return newTopic
  };
  let parsedTopics = importNewTopic_r(res);
  console.debug("Result");
  console.debug(parsedTopics);
  console.debug(parsedTasks);
  // Extract topics?
  // Go through the YAML tree

  // Extract tasks
  return { parsedTopics, parsedTasks };
};
