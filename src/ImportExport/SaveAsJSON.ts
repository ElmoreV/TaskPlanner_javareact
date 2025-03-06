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
  const blob = new Blob([jsonContent], { type: "application/json" });
  var a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  if (fileNameRef.current.length > 0) {
    console.log(fileNameRef.current);
    // a.download = fileInputRef.split(".")[0]
    a.download = fileNameRef.current + ".json";
  } else {
    a.download = "tasks_topics.json";
  }
  a.click();
};
