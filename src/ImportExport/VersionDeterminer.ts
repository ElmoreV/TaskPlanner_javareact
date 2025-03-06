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
