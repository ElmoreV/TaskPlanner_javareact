import { useState, useRef, useEffect } from "react";
import {
  calculateHash,
  calculateTaskHash,
  calculateTopicHash,
  isChanged,
  mutatedSince,
} from "./DataMutationChecks.ts";
import { exportYAML } from "./FormatAsYAML.ts";
import { buildMarkdownRecursive, exportMarkdown } from "./FormatAsMarkdown.ts";
import { parseJSON } from "./ParseJSON.ts";
import { parseYAML } from "./ParseYAML.ts";
import { exportJSON } from "./SaveAsJSON.ts";
import {
  getVersionOfAppData,
  Version,
  versionToString,
} from "./VersionDeterminer.ts";

const ImportExport = (props) => {
  console.debug("Rendering ImportExport");
  const { appData, setAppData, preferredVersion } = props;
  // This value will be used to determine the version of the exported data
  let curPreferredVersion =
    preferredVersion === undefined ? Version.V1 : preferredVersion;
  let curVersion = getVersionOfAppData(appData);
  console.log("Current version is " + versionToString(curVersion));
  console.log("Preferred version is " + versionToString(curPreferredVersion));
  const { topics, tasks } = appData;
  const [taskHash, setTaskHash] = useState(null);
  const [topicHash, setTopicHash] = useState(null);
  const [loadedTaskHash, setLoadedTaskHash] = useState(null);
  const [loadedTopicHash, setLoadedTopicHash] = useState(null);
  const [savedTaskHash, setSavedTaskHash] = useState(null);
  const [savedTopicHash, setSavedTopicHash] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const fileInputRef = useRef(null); // reference to the file input element
  const fileNameRef = useRef(""); // filename without extension (after the last "." it's removed)
  const fileNameRefComplete = useRef(""); // complete file name

  const handleExportYAMLClick = () => {
    exportYAML(topics, tasks, fileNameRef);
  };

  const handleExportMarkdownClick = () => {
    exportMarkdown(topics, tasks, fileNameRef);
  };

  const handleSaveAsJSONClick = () => {
    setSavedTaskHash(calculateTaskHash(tasks));
    setSavedTopicHash(calculateTopicHash(topics));
    setTaskHash(calculateTaskHash(tasks));
    setTopicHash(calculateTopicHash(topics));
    exportJSON(topics, tasks, fileNameRef);
  };

  const importjson = (jsonStr) => {
    const { old_topics: topics, old_tasks: tasks } = parseJSON(jsonStr);
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

  const parseFile = (fileContent, fileType, fileName) => {
    console.log("file loaded now parsing");
    console.log(fileType);
    if (fileType == "application/json") {
      // JSON
      try {
        console.info(importjson(fileContent));
      } catch (e) {
        console.error("Uploaded file is not JSON enough.", e);
      }
    } else if (fileName.split(".").at(-1) == "yaml") {
      // YAML
      try {
        const YAMLstr = fileContent;
        const { parsedTopics, parsedTasks } = parseYAML(YAMLstr);
        console.log("Parsed tasks,topics from YAML");
        console.log(parsedTopics);
        console.log(parsedTasks);
        setAppData({ topics: parsedTopics, tasks: parsedTasks });
      } catch (e) {
        console.error("Uploaded file is not YAML enough.", e);
      }
    } else {
      // OTHER
      console.warn("File Type not recognized");
      console.warn(fileName.split(".").at(-1));
    }
  };

  const handleFileToUpload = (e) => {
    console.log("upload start");
    if (e.target.files) {
      var file = e.target.files[0];
    }
    if (file) {
      console.log(`Loading file / name ${file.name} / type ${file.type}.`);
      fileNameRef.current = file.name.substring(0, file.name.lastIndexOf("."));
      fileNameRefComplete.current = file.name;

      const reader = new FileReader();
      reader.onload = (evt) => {
        if (!evt.target) {
          console.error("File reader didn't load");
          return;
        } else if (evt.target.result == null) {
          console.error("File reader has empty contents");
          return;
        }
        parseFile(evt.target.result, file.type, file.name);
      };
      console.log("start reading");

      reader.readAsText(file); // This runs onload
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
      console.log("Recaclculated");
      console.log(newTaskHash, newTopicHash);
      let hasChanges = isChanged(
        newTaskHash,
        newTopicHash,
        loadedTaskHash,
        loadedTopicHash,
        savedTaskHash,
        savedTopicHash
      );
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
  const { mutatedSinceLoad, mutatedSinceSave } = mutatedSince(
    taskHash,
    topicHash,
    loadedTaskHash,
    loadedTopicHash,
    savedTaskHash,
    savedTopicHash
  );
  return (
    <div className="importExport">
      <button onClick={handleSaveAsJSONClick}>Save as JSON</button>
      <br />
      {savedTaskHash
        ? mutatedSinceSave
          ? "Unsaved changes"
          : "Unchanged"
        : "Not saved yet"}

      {/* <button onClick={handleExportYAMLClick}>Export as YAML</button> */}
      <button onClick={handleExportMarkdownClick}> Export as Markdown</button>
      <br />
      <button onClick={exportAll}> Export All [JSON+Markdown]</button>
      <br />
      <button
        onClick={() => {
          const { taskHash, topicHash } = calculateHash(tasks, topics);
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
