export const buildMarkdownRecursive = (subtopics, tasks, indent_level) => {
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
        buildMarkdownRecursive(topic.subtopics, tasks, indent_level + 1)
      );
    }
  }

  return MarkdownStr;
};
