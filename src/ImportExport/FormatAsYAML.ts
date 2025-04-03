import { AppData, AppDataV1 } from "../Structure/AppDataTypes.ts";
import { saveFile } from "./LoadFile.ts";
import { Version } from "../Structure/Versions.ts";
import { versionToString } from "./VersionDeterminer.ts";

export const exportYAML = (appData: AppData, fileNameRef, version: Version) => {
  if (version === Version.V1) {
    const appDataV1: AppDataV1 = appData as AppDataV1;
    const YAMLcontent = buildYAMLfromV1(appDataV1.topics, appDataV1.tasks);
    saveFile(YAMLcontent, "text/yaml", fileNameRef.current, ".yaml");
  } else {
    console.error(
      "Cannot export YAML with this version: " + versionToString(version)
    );
  }
};

export const buildYAMLFromV1_r = (subtopics, tasks, indent_level) => {
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
        buildYAMLFromV1_r(topic.subtopics, tasks, indent_level + 1)
      );
    }
  }

  return YAMLstr;
};

export const buildYAMLfromV1 = (topics, tasks) => {
  // '''
  // Export as
  // - Topic:
  //     - SubTopic:
  //         - Task1
  //         - Task2
  //         - Task3
  // '''
  const YAMLcontent = buildYAMLFromV1_r(topics, tasks, 0);
  return YAMLcontent;
};
