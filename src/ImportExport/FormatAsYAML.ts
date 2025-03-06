import { saveFile } from "./LoadFile.ts";

export const buildYAML_r = (subtopics, tasks, indent_level) => {
  // '''
  // Export as
  // - Topic:
  //     - SubTopic:
  //         - Task1
  //         - Task2
  //         - Task3
  // '''
  let YAMLstr = "";
  console.debug(YAMLstr);
  // console.log(subtopics)
  for (let i = 0; i < subtopics.length; i++) {
    // Add topic name as key
    let topic = subtopics[i];
    if (indent_level == 0) {
      // console.log(subtopics)
      // console.log('@ indent level 0')
      YAMLstr = YAMLstr.concat(
        " ".repeat(4 * indent_level),
        `'${topic.name}':\n`
      );
    } else {
      YAMLstr = YAMLstr.concat(
        " ".repeat(4 * indent_level),
        "- ",
        `'${topic.name}':\n`
      );
    }
    // Add all tasks in this subtopic to the YAML
    let relevant_tasks = tasks.filter((t) => t.topics.includes(topic.id));
    for (let j = 0; j < relevant_tasks.length; j++) {
      let task = relevant_tasks[j];
      YAMLstr = YAMLstr.concat(
        " ".repeat(4 * (indent_level + 1)),
        `- '${task.name}'\n`
      );
    }
    // Do the same for all the subtopics
    // Add
    if (topic.subtopics.length > 0) {
      YAMLstr = YAMLstr.concat(
        buildYAML_r(topic.subtopics, tasks, indent_level + 1)
      );
    }
  }

  return YAMLstr;
};

export const exportYAML = (topics, tasks, fileNameRef) => {
  // '''
  // Export as
  // - Topic:
  //     - SubTopic:
  //         - Task1
  //         - Task2
  //         - Task3
  // '''
  const YAMLcontent = buildYAML_r(topics, tasks, 0);
  saveFile(YAMLcontent, "text/yaml", fileNameRef.current, ".yaml");
};
