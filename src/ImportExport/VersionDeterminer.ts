export enum Version {
  UNKNOWN,
  V0,
  V1,
  V2,
}

export const versionToString = (version: Version): string => {
  switch (version) {
    case Version.V0:
      return "v0";
    case Version.V1:
      return "v1";
    case Version.V2:
      return "v2";
    default:
      return "unknown";
  }
};

export const getVersionOfAppData = (appData): Version => {
  if ("tasks" in appData && "topics" in appData) {
    // it must be v0 or v1
    const { tasks, topics } = appData;
    return checkVersionV0orV1(tasks, topics);
  } else if ("taskMap" in appData && "tagMap" in appData) {
    return Version.V2;
  }
  return Version.UNKNOWN;
};

export const checkVersionV0orV1 = (tasks, topics): Version => {
  console.debug(tasks.length);
  console.debug("taskName" in tasks[0]);
  console.debug(topics.length);
  console.debug("title" in topics[0]);
  if (
    (tasks.length > 0 && "taskName" in tasks[0]) ||
    (topics.length > 0 && "title" in topics[0])
  ) {
    return Version.V0;
  } else {
    return Version.V1;
  }
};

const getVersionOfImportedJSON = (jsonStr: string): Version => {
  // Not implemented yet
  // will be dependent on some metadata
  // like metadata.version
  // but if that's not there, we need to check it the old way.
  return Version.UNKNOWN;
};
