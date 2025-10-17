// ImportExport.tsx

import { useState, useRef, useEffect } from "react";
import {
  calculateAppDataHash,
  isAppDataChanged,
  mutatedAppDataSince,
} from "./DataMutationChecks.ts";
import { exportYAML } from "./FormatAsYAML.ts";
import { buildMarkdownfromV1, exportMarkdown } from "./FormatAsMarkdown.ts";
import { parseJSON } from "./ParseJSON.ts";
import { parseYAML } from "./ParseYAML.ts";
import { exportJSON } from "./SaveAsJSON.ts";
import { getVersionOfAppData, versionToString } from "./VersionDeterminer.ts";
import { Version } from "../Structure/Versions.ts";

const ImportExport = (props) => {
  console.debug("Rendering ImportExport");
  const { appData, setAppData } = props;

  let curVersion = getVersionOfAppData(appData);
  console.log("Loaded version is " + versionToString(curVersion));

  const [selectedExportVersion, setSelectedExportVersion] = useState<Version>(
    Version.V2
  );
  const [appDataHash, setAppDataHash] = useState<string | null>(null);
  const [loadedAppDataHash, setLoadedAppDataHash] = useState<string | null>(
    null
  );
  const [savedAppDataHash, setSavedAppDataHash] = useState<string | null>(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fileInputRef = useRef(null); // reference to the file input element
  const fileNameRef = useRef(""); // filename without extension (after the last "." it's removed)
  const fileNameRefComplete = useRef(""); // complete file name

  const handleExportYAMLClick = () => {
    exportYAML(appData, fileNameRef, Version.V1);
  };

  const handleExportMarkdownClick = () => {
    exportMarkdown(appData, fileNameRef, Version.V1);
  };

  const handleSaveAsJSONClick = () => {
    const appDataHash = calculateAppDataHash(appData);
    setSavedAppDataHash(appDataHash);
    setAppDataHash(appDataHash);
    exportJSON(appData, fileNameRef, selectedExportVersion);
  };

  const importjson = (jsonStr: string) => {
    const newAppData = parseJSON(jsonStr);

    const newAppDataHash = calculateAppDataHash(newAppData);

    setAppDataHash(newAppDataHash);
    setLoadedAppDataHash(newAppDataHash);
    setSavedAppDataHash(null);
    setAppData(newAppData);
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

    // Check if v0 format, or v1 format
    // if (inputVersion(new_topics, new_tasks) == 'v0') {
    //     console.log('Converting internal v0 format to v1');
    //     [new_topics, new_tasks] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
    // }
    // Pretty print json (with 2 spaces as space parameter)

    const appDataHash = calculateAppDataHash(appData);
    setAppDataHash(appDataHash);
    setSavedAppDataHash(appDataHash);

    const jsonContent = JSON.stringify(appData, null, 2);
    const jsonBlob = new Blob([jsonContent], { type: "application/json" });
    const MarkdownContent = buildMarkdownfromV1(appData.topics, appData.tasks);
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
  if (appDataHash == null) {
    setAppDataHash(calculateAppDataHash(appData));
  }

  let hasChanges = isAppDataChanged(
    appDataHash,
    loadedAppDataHash,
    savedAppDataHash
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
      console.log(appDataHash);
      console.log(loadedAppDataHash);
      console.log(savedAppDataHash);
      let newAppDataHash = calculateAppDataHash(appData);

      console.log("Recalculated hash");
      console.log(newAppDataHash);
      let hasChanges = isAppDataChanged(
        newAppDataHash,
        loadedAppDataHash,
        savedAppDataHash
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
  });

  const handleBrowseClick = () => {
    // The browse button is visible, and the file input is hidden
    // So we need to trigger the file input click ourselves
    fileInputRef.current.click();
  };
  const { mutatedSinceLoad, mutatedSinceSave } = mutatedAppDataSince(
    appDataHash,
    loadedAppDataHash,
    savedAppDataHash
  );

  const handleVersionChange = (e) => {
    console.log(e.target.value);
    const map = {
      1: Version.V0,
      2: Version.V1,
      3: Version.V2,
    };
    console.log(map[e.target.value]);
    setSelectedExportVersion(map[e.target.value]);
  };

  return (
    <div
      className="importExport"
      style={{ border: "solid 1px", padding: "10px" }}
    >
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ marginBottom: "10px", width: "250px" }}
      >
        {isOpen ? "Import / Export ▲" : "Import / Export ▼"}
      </button>
      {isOpen && (
        <div>
          <div>
            <label htmlFor="exportVersionSelect">Export Version: </label>
            <select
              id="exportVersionSelect"
              onChange={handleVersionChange}
              value={selectedExportVersion}
            >
              <option value={Version.V0}>Version 0</option>
              <option value={Version.V1}>Version 1</option>
              <option value={Version.V2}>Version 2</option>
            </select>
          </div>
          <br />
          <button onClick={handleSaveAsJSONClick}>Save as JSON</button>
          <br />
          {savedAppDataHash
            ? mutatedSinceSave
              ? "Unsaved changes"
              : "Unchanged"
            : "Not saved yet"}

          {/* <button onClick={handleExportYAMLClick}>Export as YAML</button> */}
          <button onClick={handleExportMarkdownClick}>
            {" "}
            Export as Markdown
          </button>
          <br />
          <button onClick={exportAll}> Export All [JSON+Markdown]</button>
          <br />
          <button
            onClick={() => {
              const appDataHash = calculateAppDataHash(appData);
              setAppDataHash(appDataHash);
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
          {loadedAppDataHash
            ? mutatedSinceLoad
              ? "Changed since load"
              : "Unchanged since load"
            : "Nothing loaded yet"}
        </div>
      )}
    </div>
  );
};
export default ImportExport;
