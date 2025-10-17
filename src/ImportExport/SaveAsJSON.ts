import { AppData, AppDataV1, AppDataV2 } from "../Structure/AppDataTypes.ts";
import { saveFile } from "./LoadFile.ts";
import { Version } from "../Structure/Versions.ts";
import { versionToString } from "./VersionDeterminer.ts";
import { convertAppdata } from "../Converters/VersionConversion.ts";

export const exportJSON = (
  appData: AppData,
  fileNameRef,
  asVersion: Version
) => {
  let appDataConverted = convertAppdata(appData, asVersion);

  if (asVersion === Version.V1) {
    const appDataV1: AppDataV1 = appDataConverted as AppDataV1;
    const jsonContent = formatJSONfromV1(appDataV1.topics, appDataV1.tasks);
    saveFile(jsonContent, "application/json", fileNameRef.current, ".json");
  } else if (asVersion === Version.V2) {
    const appDataV2: AppDataV2 = appDataConverted as AppDataV2;
    const jsonContent = JSON.stringify(
      {
        version: Version.V2,
        taskMap: appDataV2.taskMap,
        tagMap: appDataV2.tagMap,
        tagTasksMap: appDataV2.tagTasksMap,
        plannedTaskIdList: appDataV2.plannedTaskIdList,
      },
      null,
      2
    );
    saveFile(jsonContent, "application/json", fileNameRef.current, ".json");
  } else {
    console.error(
      "Cannot export JSON with this version: " + versionToString(asVersion)
    );
  }
};

export const formatJSONfromV1 = (topics, tasks): string => {
  let [new_topics, new_tasks] = [topics, tasks];
  // Check if v0 format, or v1 format
  // if (inputVersion(new_topics, new_tasks) == 'v0') {
  //     console.log('Converting internal v0 format to v1');
  //     [new_topics, new_tasks] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
  // }
  // Pretty print json (with 2 spaces as space parameter)

  return JSON.stringify(
    { version: Version.V1, topics: new_topics, tasks: new_tasks },
    null,
    2
  );
};
