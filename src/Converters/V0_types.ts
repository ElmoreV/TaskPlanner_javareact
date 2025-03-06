import { FinishedState } from "../Tasks/TaskInterfaces";

interface V0_Topic {
  title: string;
  id: number;
  unfolded: boolean;
  subtopics: V0_Topic[];
}

interface V0_Task {
  taskName: string;
  key: number;
  topics: string[]; // matched to topic.title
  completed: boolean;
  thisWeek: boolean;
}

export { V0_Topic, V0_Task };
