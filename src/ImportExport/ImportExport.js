import { useState, useRef, useEffect } from "react";
import YAML from "yaml";
import {
  calculateHash,
  calculateTaskHash,
  calculateTopicHash,
  isChanged,
  mutatedSince,
} from "./DataMutationChecks.ts";
import { buildYAML_r } from "./FormatAsYAML.ts";
import { buildMarkdownRecursive } from "./FormatAsMarkdown.ts";
import { parseJSON } from "./ParseJSON.ts";
import { parseYAML } from "./ParseYAML.ts";

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
    const [parsedTopics, parsedTasks] = parseYAML(YAMLstr);
    setAppData({ topics: parsedTopics, tasks: parsedTasks });
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
    const [topics, tasks] = parseJSON(jsonStr);
    let newTaskHash = calculateTaskHash(tasks);
    let newTopicHash = calculateTopicHash(topics);
    setTaskHash(newTaskHash);
    setTopicHash(newTopicHash);
    setLoadedTaskHash(newTaskHash);
    setLoadedTopicHash(newTopicHash);
    setSavedTaskHash(null);
    setSavedTopicHash(null);
    setAppData({ topics: topics, tasks: tasks });
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

  let hasChanges = isChanged(
    taskHash,
    topicHash,
    loadedTaskHash,
    loadedTopicHash,
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
  const [mutatedSinceLoad, mutatedSinceSave] = mutatedSince(
    taskHash,
    topicHash,
    loadedTaskHash,
    loadedTopicHash,
    savedTaskHash,
    savedTopicHash
  );
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
