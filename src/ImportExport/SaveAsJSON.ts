import { saveFile } from "./LoadFile.ts";

export const exportJSON = (topics, tasks, fileNameRef) => {
  let [new_topics, new_tasks] = [topics, tasks];
  // Check if v0 format, or v1 format
  // if (inputVersion(new_topics, new_tasks) == 'v0') {
  //     console.log('Converting internal v0 format to v1');
  //     [new_topics, new_tasks] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
  // }
  // Pretty print json (with 2 spaces as space parameter)

  const jsonContent = JSON.stringify(
    { topics: new_topics, tasks: new_tasks },
    null,
    2
  );
  saveFile(jsonContent, "application/json", fileNameRef.current, ".json");
};
