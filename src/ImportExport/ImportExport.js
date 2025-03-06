import { useState, useRef, useEffect } from "react";
import YAML from "yaml";
import {
  convert_old_topic_tasks_to_new_topic_tasks,
  convert_new_topic_tasks_to_old_topic_tasks,
} from "../Converter";
import {
  checkVersionV0orV1,
  versionToString,
  Version,
} from "./VersionDeterminer.ts";
import {
  calculateHash,
  calculateTaskHash,
  calculateTopicHash,
} from "./DataMutationChecks.ts";
import { buildYAML_r } from "./FormatAsYAML.ts";
import { buildMarkdownRecursive } from "./FormatAsMarkdown.ts";

const ImportExport = (props) => {
  console.debug("Rendering ImportExport");
  const { appData, setAppData } = props;
  const { topics, tasks } = appData;

  const [taskHash, setTaskHash] = useState(null);
  const [topicHash, setTopicHash] = useState(null);
  const [loadedTaskHash, setLoadedTaskHash] = useState(null);
  const [loadedTopicHash, setLoadedTopicHash] = useState(null);
  const [savedTaskHash, setSavedTaskHash] = useState(null);
  const [savedTopicHash, setSavedTopicHash] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fileInputRef = useRef(null);
  const fileNameRef = useRef("");
  const fileNameRefComplete = useRef("");

  /*
    /////////////
    ///// YAML
    ////////////////////
    */

  const exportYAML = () => {
    // '''
    // Export as
    // - Topic:
    //     - SubTopic:
    //         - Task1
    //         - Task2
    //         - Task3
    // '''
    // const YAML =
    // console.log('Starting Yaml building')
    const YAMLcontent = buildYAML_r(topics, tasks, 0);
    const blob = new Blob([YAMLcontent], { type: "text/yaml" });
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    if (fileNameRef.current.length > 0) {
      console.log(fileNameRef.current);
      // a.download = fileInputRef.split(".")[0]
      a.download = fileNameRef.current + ".yaml";
    } else {
      a.download = "tasks_topics.yaml";
    }
    a.click();
  };

  const importYAML = (YAMLstr) => {
    // Expected:
    // - Name: '
    console.log("Parsing YAML");
    console.info(YAMLstr);
    let res = YAML.parse(YAMLstr);
    console.info(res);
    let importedTasks = [];
    let importedTopics = [];
    const getFreeImportedTaskKey = () => {
      return (
        1 +
        importedTasks.reduce((max_key, task) => Math.max(max_key, task.key), 0)
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
      importedTasks = importedTasks.concat(newTask);
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
                importedTopics = importedTopics.concat(
                  importNewTopic_r(subnode)
                );
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
    let res2 = importNewTopic_r(res);
    console.debug("Result");
    console.debug(res2);
    console.debug(importedTasks);
    // Extract topics?
    // Go through the YAML tree

    // Extract tasks

    setAppData({ topics: res2, tasks: importedTasks });
  };

  /*
    /////////////////////////////////////
    //////////// Markdown
    ////////////////////////////////////
    */

  const exportMarkdown = () => {
    let [new_topics, new_tasks] = [topics, tasks];
    const MarkdownContent = buildMarkdownRecursive(topics, tasks, 0);
    const blob = new Blob([MarkdownContent], { type: "text/markdown" });
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    if (fileNameRef.current.length > 0) {
      console.log(fileNameRef.current);
      // a.download = fileInputRef.split(".")[0]
      a.download = fileNameRef.current + ".md";
    } else {
      a.download = "tasks_topics.md";
    }
    a.click();
  };

  /*
    ///////////////////////////////////
    ///////////// JSON
    //////////////////////////////////////
    */
  const exportjson = () => {
    let [new_topics, new_tasks] = [topics, tasks];
    // Check if v0 format, or v1 format
    // if (inputVersion(new_topics, new_tasks) == 'v0') {
    //     console.log('Converting internal v0 format to v1');
    //     [new_topics, new_tasks] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
    // }
    // Pretty print json (with 2 spaces as space parameter)
    setSavedTaskHash(calculateTaskHash(tasks));
    setSavedTopicHash(calculateTopicHash(topics));
    setTaskHash(calculateTaskHash(tasks));
    setTopicHash(calculateTopicHash(topics));

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

  // console.log(tasks[0].topics.includes(topics[0].title))
  const importjson = (jsonStr) => {
    const uploadedData = JSON.parse(jsonStr);
    // As loaded (may be new format, may be old format)
    // setTopics(uploadedData.topics);
    // setTasks(uploadedData.tasks);
    let [old_topics, old_tasks] = [uploadedData.topics, uploadedData.tasks];
    // Sanitize input

    // Version rectification
    let version = checkVersionV0orV1(old_tasks, old_topics);
    console.log("Version of input is " + versionToString(version));
    if (version === Version.V1) {
      console.log("converting imported v0 to v1 format");
      [old_topics, old_tasks] = convert_old_topic_tasks_to_new_topic_tasks(
        uploadedData.topics,
        uploadedData.tasks
      );
    }
    let newTaskHash = calculateTaskHash(tasks);
    let newTopicHash = calculateTopicHash(topics);
    setTaskHash(newTaskHash);
    setTopicHash(newTopicHash);
    setLoadedTaskHash(newTaskHash);
    setLoadedTopicHash(newTopicHash);
    setSavedTaskHash(null);
    setSavedTopicHash(null);
    setAppData({ topics: old_topics, tasks: old_tasks });
    console.log("Loading etc");

    return "succesful import";
  };
  // const [file,setFile] = useState(null);

  const handleFileToUpload = (e) => {
    console.log("upload start");
    if (e.target.files) {
      // setFile(e.target.files[0]);
      var file = e.target.files[0];
    }
    console.log("file?");
    console.log();
    if (file) {
      fileNameRef.current = file.name.substring(0, file.name.lastIndexOf("."));
      fileNameRefComplete.current = file.name;
      console.log(fileNameRef.current);
      const reader = new FileReader();
      reader.onload = (evt) => {
        console.log("file loaded now parsing");
        console.log(file.type);
        if (file.type == "application/json") {
          try {
            console.info(importjson(evt.target.result));
          } catch (e) {
            console.error("Uploaded file is not JSON enough.", e);
          }
        } else if (file.name.split(".").at(-1) == "yaml") {
          try {
            console.log(importYAML(evt.target.result));
          } catch (e) {
            console.error("Uploaded file is not YAML enough.", e);
          }
        } else {
          console.warning("File Type not recognized");
          console.warning(file.name.split(".").at(-1));
        }
      };
      console.log("start reading");

      reader.readAsText(file);
    }
  };

  const getFilename = (extension) => {
    if (fileNameRef.current.length > 0) {
      console.log(fileNameRef.current);
      return fileNameRef.current + extension;
    } else {
      return "tasks_topics" + extension;
    }
  };
  const exportAll = () => {
    console.log("Test");

    let [new_topics, new_tasks] = [topics, tasks];
    // Check if v0 format, or v1 format
    // if (inputVersion(new_topics, new_tasks) == 'v0') {
    //     console.log('Converting internal v0 format to v1');
    //     [new_topics, new_tasks] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
    // }
    // Pretty print json (with 2 spaces as space parameter)

    setSavedTaskHash(calculateTaskHash(tasks));
    setSavedTopicHash(calculateTopicHash(topics));
    setTaskHash(calculateTaskHash(tasks));
    setTopicHash(calculateTopicHash(topics));

    const jsonContent = JSON.stringify(
      { topics: new_topics, tasks: new_tasks },
      null,
      2
    );
    const jsonBlob = new Blob([jsonContent], { type: "application/json" });
    const MarkdownContent = buildMarkdownRecursive(topics, tasks, 0);
    const markdownBlob = new Blob([MarkdownContent], { type: "text/markdown" });
    // const YAMLcontent = buildYAML_r(topics, tasks, 0)
    // const yamlBlob = new Blob([YAMLcontent], { type: "text/yaml" });
    // const blobs = [jsonBlob, markdownBlob, yamlBlob]
    // const extensions = ['.json', '.md', '.yaml']
    const blobs = [jsonBlob, markdownBlob];
    const extensions = [".json", ".md"];
    var a = document.createElement("a");
    a.setAttribute("download", null);
    a.style.display = "none";
    document.body.appendChild(a);
    for (var i = 0; i < blobs.length; i++) {
      a.download = getFilename(extensions[i]);
      a.href = URL.createObjectURL(blobs[i]);
      a.click();
    }
    document.body.removeChild(a);
  };

  if (taskHash == null) {
    setTaskHash(calculateTaskHash(tasks));
    setTopicHash(calculateTopicHash(topics));
  }

  let mutatedSinceLoad = false;
  let mutatedSinceSave = false;
  if (
    (loadedTaskHash && taskHash !== loadedTaskHash) ||
    (loadedTopicHash && topicHash !== loadedTopicHash)
  ) {
    mutatedSinceLoad = true;
  }
  // Check only if the file has been saved before
  if (
    savedTaskHash &&
    taskHash !== savedTaskHash &&
    savedTopicHash &&
    topicHash !== savedTopicHash
  ) {
    mutatedSinceSave = true;
  }

  const isChanged = (taskHash, topicHash) => {
    let mutatedSinceLoad = false;
    let mutatedSinceSave = false;
    if (
      (loadedTaskHash && taskHash !== loadedTaskHash) ||
      (loadedTopicHash && topicHash !== loadedTopicHash)
    ) {
      mutatedSinceLoad = true;
    }
    // Check only if the file has been saved before
    if (
      savedTaskHash &&
      taskHash !== savedTaskHash &&
      savedTopicHash &&
      topicHash !== savedTopicHash
    ) {
      mutatedSinceSave = true;
    }
    console.log("Mutated since load and save");
    console.log(mutatedSinceLoad);
    console.log(mutatedSinceSave);
    console.log(savedTaskHash);
    console.log(savedTopicHash);
    console.log(loadedTaskHash);
    console.log(loadedTopicHash);
    console.log(taskHash);
    console.log(topicHash);

    if (!savedTaskHash && mutatedSinceLoad) {
      return true;
    } else if (savedTaskHash && mutatedSinceSave) {
      return true;
    } else {
      return false;
    }
  };

  let hasChanges = isChanged(
    loadedTaskHash,
    taskHash,
    loadedTopicHash,
    topicHash,
    savedTaskHash,
    savedTopicHash
  );
  if (!hasUnsavedChanges && hasChanges) {
    setHasUnsavedChanges(true);
  } else if (hasUnsavedChanges && !hasChanges) {
    setHasUnsavedChanges(false);
  }


  useEffect(() => {
    const handleBeforeUnload = (event) => {
      console.log("beforeunload");
      console.log("Mutated since load and save");
      console.log(savedTaskHash);
      console.log(savedTopicHash);
      console.log(loadedTaskHash);
      console.log(loadedTopicHash);
      console.log(taskHash, topicHash);
      let newTaskHash = calculateTaskHash(tasks);
      let newTopicHash = calculateTopicHash(topics);
      console.log("Recaclucalted");
      console.log(newTaskHash, newTopicHash);
      let hasChanges = isChanged(newTaskHash, newTopicHash);
      console.log(hasChanges);
      if (hasChanges) {
        console.log("Changes");
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      } else {
        console.log("No changes?");
        const message = "The checking didn't work";
        event.returnValue = message;
        return message;
      }
    };
    console.log("adding listener");
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  const handleBrowseClick = () => {
    // The browse button is visible, and the file input is hidden
    // So we need to trigger the file input click ourselves
    fileInputRef.current.click();
  };

  return (
    <div className="importExport">
      <button onClick={exportjson}>Save as JSON</button>
      <br />
      {savedTaskHash
        ? mutatedSinceSave
          ? "Unsaved changes"
          : "Unchanged"
        : "Not saved yet"}

      {/* <button onClick={exportYAML}>Export as YAML</button> */}
      <button onClick={exportMarkdown}> Export as Markdown</button>
      <br />
      <button onClick={exportAll}> Export All [JSON+Markdown]</button>
      <br />
      <button
        onClick={() => {
          const [taskHash, topicHash] = calculateHash(tasks, topics);
          setTaskHash(taskHash);
          setTopicHash(topicHash);
        }}
      >
        {" "}
        Calc Hash{" "}
      </button>
      <br />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileToUpload}
      />
      <button onClick={handleBrowseClick}>Load file</button>
      <br />
      <input type="text" value={fileNameRefComplete.current} readOnly />
      <br />
      {loadedTaskHash
        ? mutatedSinceLoad
          ? "Changed since load"
          : "Unchanged since load"
        : "Nothing loaded yet"}
    </div>
  );
};

export default ImportExport;
