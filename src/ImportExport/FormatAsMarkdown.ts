import { AppData, AppDataV1 } from "./DataMutationChecks.ts";
import { saveFile } from "./LoadFile.ts";
import { Version, versionToString } from "./VersionDeterminer.ts";

export const exportMarkdown = (
  appData: AppData,
  fileNameRef,
  version: Version
) => {
  if (version === Version.V1) {
    const appDataV1: AppDataV1 = appData as AppDataV1;
    const MarkdownContent = buildMarkdownfromV1(
      appDataV1.topics,
      appDataV1.tasks
    );
    saveFile(MarkdownContent, "text/markdown", fileNameRef.current, ".md");
  } else {
    console.error(
      "Cannot export Markdown with this version: " + versionToString(version)
    );
  }
};

export const buildMarkdownFromV1Recursive = (
  subtopics,
  tasks,
  indent_level
) => {
  let MarkdownStr = "";
  console.debug(MarkdownStr);
  // console.log(subtopics)
  for (let i = 0; i < subtopics.length; i++) {
    // Add topic name as key
    let topic = subtopics[i];
    if (indent_level == 0) {
      // console.log(subtopics)
      // console.log('@ indent level 0')
      MarkdownStr = MarkdownStr.concat(
        "\n",
        "#".repeat(indent_level + 1),
        ` ${topic.name}:\n\n`
      );
    } else {
      MarkdownStr = MarkdownStr.concat(
        "\n",
        "#".repeat(indent_level + 1),
        ` ${topic.name}:\n\n`
      );
    }
    // Add all tasks in this subtopic to the Markdown
    let relevant_tasks = tasks.filter((t) => t.topics.includes(topic.id));
    for (let j = 0; j < relevant_tasks.length; j++) {
      let task = relevant_tasks[j];
      let completedSymbol = task.completed ? "[x]" : "[ ]";
      MarkdownStr = MarkdownStr.concat(`- ${completedSymbol} ${task.name}\n`);
    }
    // Do the same for all the subtopics
    // Add
    if (topic.subtopics.length > 0) {
      MarkdownStr = MarkdownStr.concat(
        buildMarkdownFromV1Recursive(topic.subtopics, tasks, indent_level + 1)
      );
    }
  }

  return MarkdownStr;
};

export const buildMarkdownfromV1 = (topics, tasks) => {
  const MarkdownContent = buildMarkdownFromV1Recursive(topics, tasks, 0);
  return MarkdownContent;
};
