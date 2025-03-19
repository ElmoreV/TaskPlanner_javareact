import {
  convert_v1_to_v2,
  convert_v2_to_v1,
} from "../Converters/Migration_V1_V2/UpdateV1ToV2.ts";
import { AppData, AppDataV1, AppDataV2 } from "./DataMutationChecks.ts";
import { saveFile } from "./LoadFile.ts";
import {
  getVersionOfAppData,
  Version,
  versionToString,
} from "./VersionDeterminer.ts";

export const exportJSON = (
  appData: AppData,
  fileNameRef,
  asVersion: Version
) => {
  const curVersion = getVersionOfAppData(appData);
  let appDataConverted: AppData = appData;
  if (curVersion !== asVersion) {
    if (curVersion === Version.V1 && asVersion === Version.V2) {
      const appDataV1: AppDataV1 = appData as AppDataV1;
      appDataConverted = convert_v1_to_v2(appDataV1.tasks, appDataV1.topics);
    } else if (curVersion === Version.V2 && asVersion === Version.V1) {
      const appDataV2: AppDataV2 = appData as AppDataV2;
      appDataConverted = convert_v2_to_v1(
        appDataV2.taskMap,
        appDataV2.tagMap,
        appDataV2.tagTasksMap,
        appDataV2.plannedTaskIdList
      );
    }
  }
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
