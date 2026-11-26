// TODO: needs full review
import { getTagPaths } from "../Tags/TagHelpers";
import { getTopicRecordsV1 } from "../Topics/TopicHelperV1";

// Prepare names and immediate parents for the task tag popup, using shared paths.
export const getSelectableTags = (topics) => {
  const records = getTopicRecordsV1(topics);
  const pathsById = new Map(getTagPaths(records).map(({ id, path }) => [id, path]));
  const parentIds = new Map();
  records.forEach((topic) => {
    topic.childIds.forEach((id) => parentIds.set(id, topic.id));
  });
  return records.map((topic) => ({
    id: topic.id,
    name: topic.name,
    path: pathsById.get(topic.id),
    parentId: parentIds.get(topic.id) ?? null,
  }));
};

