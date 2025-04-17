import { V0_Task, V0_Topic } from "../Structure/V0_types.ts";
import { V1_Task, V1_Topic } from "../Structure/V1_types.ts";
import { TaskMap, TagMap, TagTasksMap } from "../Structure/V2_types.ts";
import { Version } from "../Structure/Versions.ts";

interface AppDataV0 {
  version: Version | undefined;
  tasks: V0_Task[];
  topics: V0_Topic[];
}
export interface AppDataV1 {
  version: Version | undefined;
  tasks: V1_Task[];
  topics: V1_Topic[];
}

export interface AppDataV2 {
  version: Version | undefined;
  taskMap: TaskMap;
  tagMap: TagMap;
  tagTasksMap: TagTasksMap;
  plannedTaskIdList: number[];
}

export type AppData = AppDataV0 | AppDataV1 | AppDataV2;
