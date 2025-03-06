import {
  convert_old_topic_tasks_to_new_topic_tasks,
  convert_new_topic_tasks_to_old_topic_tasks,
} from "../Converter";
import {
  checkVersionV0orV1,
  Version,
  versionToString,
} from "./VersionDeterminer.ts";

export const parseJSON = (jsonStr) => {
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
};
