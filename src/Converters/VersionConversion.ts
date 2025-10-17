import { version } from "react";
import {
  convert_v0_to_v1,
  convert_v1_to_v0,
} from "./Migration_V0_V1/UpdateV0ToV1.ts";
import {
  convert_v1_to_v2,
  convert_v2_to_v1,
} from "./Migration_V1_V2/UpdateV1ToV2.ts";
import {
  AppData,
  AppDataV0,
  AppDataV1,
  AppDataV2,
} from "../Structure/AppDataTypes.ts";
import { Version } from "../Structure/Versions.ts";
import {
  getVersionOfAppData,
  versionToString,
} from "../ImportExport/VersionDeterminer.ts";

// I want to have an ADT that can accept:
// AppDataV0 | AppDataV1 | AppDataV2
// and convert it to AppDataV1

export const convertAppdata = (
  appData: AppData,
  targetVersion: Version | undefined
) => {
  const currentVersion = getVersionOfAppData(appData);
  console.log(
    "Version of unconverted data is " + versionToString(currentVersion)
  );
  if (targetVersion === undefined || targetVersion === Version.UNKNOWN) {
    console.error("Target version is not a valid version");
    console.error("Returning original data");
    return appData;
  }
  if (targetVersion === currentVersion) {
    console.log("Target version is the same as current version");
    console.log("Returning original data");
    appData.version = currentVersion;
    return appData;
  }
  console.log("Trying to convert to " + versionToString(targetVersion));
  if (currentVersion === Version.V0) {
    if (targetVersion === Version.V0) {
      return appData as AppDataV0;
    } else if (targetVersion === Version.V1) {
      const appDataV0 = appData as AppDataV0;
      const convertedData = convert_v0_to_v1(appDataV0.topics, appDataV0.tasks);
      const appDataV1 = {
        version: Version.V1,
        tasks: convertedData[1],
        topics: convertedData[0],
      };
      return appDataV1;
    } else if (targetVersion === Version.V2) {
      const appDataV0 = appData as AppDataV0;
      const convertedData = convert_v0_to_v1(appDataV0.topics, appDataV0.tasks);
      const appDataV2 = convert_v1_to_v2(convertedData[1], convertedData[0]);
      return appDataV2;
    } else {
      console.error(
        "Cannot convert from V0 to " + versionToString(targetVersion)
      );
    }
  } else if (currentVersion === Version.V1) {
    if (targetVersion === Version.V0) {
      const appDataV1 = appData as AppDataV1;
      const convertedData = convert_v1_to_v0(appDataV1.topics, appDataV1.tasks);
      const appDataV0 = {
        version: Version.V0,
        tasks: convertedData[1],
        topics: convertedData[0],
      };
      return appDataV0;
    } else if (targetVersion === Version.V1) {
      return appData as AppDataV1;
    } else if (targetVersion === Version.V2) {
      const appDataV1 = appData as AppDataV1;
      const appDataV2 = convert_v1_to_v2(appDataV1.tasks, appDataV1.topics);
      return appDataV2;
    } else {
      console.error(
        "Cannot convert from V1 to " + versionToString(targetVersion)
      );
    }
  } else if (currentVersion === Version.V2) {
    if (targetVersion === Version.V0) {
      // downgrade to v1
      // downgrade to v0
      const appDataV2 = appData as AppDataV2;
      const appDataV1 = convert_v2_to_v1(
        appDataV2.taskMap,
        appDataV2.tagMap,
        appDataV2.tagTasksMap,
        appDataV2.plannedTaskIdList
      );
      const convertedData = convert_v1_to_v0(appDataV1.topics, appDataV1.tasks);
      const appDataV0 = {
        version: Version.V0,
        tasks: convertedData[1],
        topics: convertedData[0],
      };
      return appDataV0;
    }
    if (targetVersion === Version.V1) {
      // downgrade to v1
      const appDataV2 = appData as AppDataV2;
      const appDataV1 = convert_v2_to_v1(
        appDataV2.taskMap,
        appDataV2.tagMap,
        appDataV2.tagTasksMap,
        appDataV2.plannedTaskIdList
      );
      return appDataV1;
    }
    if (targetVersion === Version.V2) {
      return appData as AppDataV2;
    } else {
      console.error(
        "Cannot convert from V2 to " + versionToString(targetVersion)
      );
    }
  } else {
    console.error(
      "Cannot convert from " +
        versionToString(currentVersion) +
        " to " +
        versionToString(targetVersion)
    );
    return undefined;
  }
};
