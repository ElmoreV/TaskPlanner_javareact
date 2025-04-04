import {
  convert_v1_to_v0,
  convert_v0_to_v1,
} from "../Converters/Migration_V0_V1/UpdateV0ToV1.ts";
import { convert_v2_to_v1 } from "../Converters/Migration_V1_V2/UpdateV1ToV2.ts";
import { AppDataV1 } from "../Structure/AppDataTypes.ts";
import { Version } from "../Structure/Versions.ts";
import {
  checkVersionV0orV1,
  getVersionOfAppData,
  versionToString,
} from "./VersionDeterminer.ts";

export const parseJSON = (jsonStr): AppDataV1 => {
  let importedData = JSON.parse(jsonStr);

  let importedVersion = getVersionOfAppData(importedData);
  console.log(
    "Version of imported data is " + versionToString(importedVersion)
  );
  if (importedVersion === Version.V0) {
    importedData = convert_v0_to_v1(importedData.topics, importedData.tasks);
    console.log(
      "Version of converted data is " + versionToString(importedVersion)
    );
  } else if (importedVersion === Version.V1) {
    // no conversion needed
  } else if (importedVersion === Version.V2) {
    importedData = convert_v2_to_v1(
      importedData.taskMap,
      importedData.tagMap,
      importedData.tagTasksMap,
      importedData.plannedTaskIdList
    );
    console.log(
      "Version of converted data is " + versionToString(importedVersion)
    );
  }
  // As loaded (may be new format, may be old format)
  // setTopics(uploadedData.topics);
  // setTasks(uploadedData.tasks);
  // Sanitize input

  // Version rectification
  importedData.version = Version.V1;
  return importedData;
};
