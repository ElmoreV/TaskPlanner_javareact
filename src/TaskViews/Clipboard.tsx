// Clipboard.tsx

import { useState } from "react";
import {
  V1_ClippedItem,
  V1_ClipboardItemType,
  V1_Task,
  V1_Topic,
} from "../Structure/V1_types.ts";

interface ClipboardColumnProps {
  clipboard: V1_ClippedItem[];
  setClipboard: React.Dispatch<React.SetStateAction<V1_ClippedItem[]>>;
  appData: { tasks: V1_Task[]; topics: V1_Topic[] };
  setAppData: Function; // kept generic for now
  fancy: boolean;
}

const findTopicById = (
  id: number,
  topics: V1_Topic[]
): V1_Topic | undefined => {
  for (const tp of topics) {
    if (tp.id === id) return tp;
    const nested = findTopicById(id, tp.subtopics);
    if (nested) return nested;
  }
  return undefined;
};

const findTaskById = (id: number, tasks: V1_Task[]): V1_Task | undefined =>
  tasks.find((t) => t.id === id);

const arrowFolded = "▶";
const arrowUnfolded = "▼";

const ClipboardColumn = (props: ClipboardColumnProps) => {
  const { clipboard, appData } = props;
  const { tasks, topics } = appData;

  const [foldedNodes, setFoldedNodes] = useState<Set<string>>(new Set());

  const isFolded = (key: string) => foldedNodes.has(key);

  const toggleFold = (key: string) => {
    setFoldedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderTaskNode = (
    task: V1_Task,
    depth: number,
    fromClipboard: boolean = false
  ): JSX.Element[] => {
    const key = `task-${task.id}`;
    const folded = isFolded(key);
    const row = (
      <li
        key={key}
        style={{ marginLeft: depth * 14 }}
        data-type="task"
        data-id={task.id}
      >
        {task.subTaskIds.length > 0 && (
          <span
            onClick={() => toggleFold(key)}
            style={{ cursor: "pointer", marginRight: 4 }}
          >
            {folded ? arrowFolded : arrowUnfolded}
          </span>
        )}
        <span>🗒️ {task.name}</span>
      </li>
    );

    if (folded || task.subTaskIds.length === 0) return [row];

    const children = task.subTaskIds
      .map((subId) => findTaskById(subId, tasks))
      .filter(Boolean)
      .flatMap((sub) => renderTaskNode(sub as V1_Task, depth + 1));

    return [row, ...children];
  };

  const renderTopicNode = (topic: V1_Topic, depth: number): JSX.Element[] => {
    const key = `topic-${topic.id}`;
    const folded = isFolded(key);

    const row = (
      <li
        key={key}
        style={{ marginLeft: depth * 14 }}
        data-type="topic"
        data-id={topic.id}
      >
        {(topic.subtopics.length > 0 ||
          tasks.some((t) => t.topics.includes(topic.id))) && (
          <span
            onClick={() => toggleFold(key)}
            style={{ cursor: "pointer", marginRight: 4 }}
          >
            {folded ? arrowFolded : arrowUnfolded}
          </span>
        )}
        <span>📂 {topic.name}</span>
      </li>
    );

    if (folded) return [row];

    /* sub‑topics */
    const subTopicEls = topic.subtopics.flatMap((st) =>
      renderTopicNode(st, depth + 1)
    );

    /* tasks directly under this topic */
    const taskEls = tasks
      .filter((t) => t.topics.includes(topic.id))
      .flatMap((t) => renderTaskNode(t, depth + 1));

    return [row, ...subTopicEls, ...taskEls];
  };

  /* -------------- render clipboard roots -------------- */

  const renderClipboardItem = (clip: V1_ClippedItem) => {
    if (clip.type === V1_ClipboardItemType.Task) {
      const task = findTaskById(clip.id, tasks);
      return task ? renderTaskNode(task, 0) : null;
    } else {
      const topic = findTopicById(clip.id, topics);
      return topic ? renderTopicNode(topic, 0) : null;
    }
  };

  return (
    <div
      className="clipboard-column"
      style={{
        width: 260,
        borderLeft: "1px solid #d0d0d0",
        padding: "0.5rem",
        overflowY: "auto",
        flex: "0 0 260px",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Clipboard</h3>
      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {clipboard.flatMap(renderClipboardItem)}
      </ul>
    </div>
  );
};

export default ClipboardColumn;
