import {
  convert_v1_to_v0,
  convert_v0_to_v1,
} from "../Converters/Migration_V0_V1/UpdateV0ToV1.ts";
import { AppDataV1 } from "./DataMutationChecks.ts";
import {
  checkVersionV0orV1,
  Version,
  versionToString,
} from "./VersionDeterminer.ts";

export const parseJSON = (jsonStr): AppDataV1 => {
  const uploadedData = JSON.parse(jsonStr);
  // As loaded (may be new format, may be old format)
  // setTopics(uploadedData.topics);
  // setTasks(uploadedData.tasks);
  let [old_topics, old_tasks] = [uploadedData.topics, uploadedData.tasks];
  // Sanitize input

  // Version rectification
  let version = checkVersionV0orV1(old_tasks, old_topics);
  console.log("Version of input is " + versionToString(version));
  if (version === Version.V0) {
    console.log("converting imported v0 to v1 format");
    [old_topics, old_tasks] = convert_v0_to_v1(
      uploadedData.topics,
      uploadedData.tasks
    );
  }
  return { version: Version.V1, topics: old_topics, tasks: old_tasks };
};
