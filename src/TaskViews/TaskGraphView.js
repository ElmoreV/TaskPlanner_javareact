// TODO: review entire file, this is all a ticking time bomb

import React, {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  getTaskGraphStatus,
  layoutTaskGraph,
  NODE_HEIGHT,
  NODE_WIDTH,
  TASK_GRAPH_STATUSES,
} from "./taskGraphLayout";
import styles from "./TaskGraphView.module.css";
import FilterBar from "../Filters/FilterBar";
import { useTaskFilter } from "../Filters/useTaskFilter";
import { View } from "../Structure/View";

const INITIAL_CAMERA = { x: 0, y: 0, scale: 1 };

function getFitCamera(viewport, graph) {
  if (!viewport || !graph.width || !graph.height) return null;
  const { width, height } = viewport.getBoundingClientRect();
  if (!width || !height) return null;
  const scale = Math.min(1, width / graph.width, height / graph.height);
  return {
    x: (width - graph.width * scale) / 2,
    y: (height - graph.height * scale) / 2,
    scale,
  };
}

export default function TaskGraphView({
  appData,
  filterSettings,
  setFilterSettings,
}) {
  const taskFilter = useTaskFilter(
    appData,
    View.VIEW_TASK_GRAPH,
    filterSettings,
    setFilterSettings
  );
  const { isTaskVisible } = taskFilter;
  const graph = useMemo(
    () => layoutTaskGraph(appData.tasks.filter(isTaskVisible)),
    [appData.tasks, isTaskVisible]
  );
  const nodesById = useMemo(
    () => new Map(graph.nodes.map((node) => [node.id, node])),
    [graph]
  );
  const [camera, setCamera] = useState(INITIAL_CAMERA);
  const [selectedId, setSelectedId] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const instanceId = useId().replace(/:/g, "");
  const arrowId = `task-graph-arrow-${instanceId}`;
  const highlightedArrowId = `${arrowId}-highlighted`;
  const instructionsId = `task-graph-instructions-${instanceId}`;
  const selectedTask = nodesById.get(selectedId)?.task;
  const connectedIds = new Set([selectedId]);
  graph.edges.forEach(({ source, target }) => {
    if (source === selectedId) connectedIds.add(target);
    if (target === selectedId) connectedIds.add(source);
  });

  const fitGraph = () => {
    const fittedCamera = getFitCamera(viewportRef.current, graph);
    if (fittedCamera) setCamera(fittedCamera);
  };

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    setSelectedId(null);
    dragRef.current = null;
    setIsPanning(false);
    // The graph is immutable for a given tasks array. Refit on replacement data
    // and viewport resizing, rather than on selection or camera changes.
    const fit = () => {
      const fittedCamera = getFitCamera(viewport, graph);
      if (fittedCamera) setCamera(fittedCamera);
    };
    fit();
    if (!viewport) return;
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(fit);
      observer.observe(viewport);
      return () => observer.disconnect();
    }
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [graph]);

  const zoom = (factor) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const { width, height } = viewport.getBoundingClientRect();
    setCamera((previous) => {
      // Allow returning to a fitted view even for a very large graph.
      const minimumScale = Math.min(
        0.1,
        width / graph.width,
        height / graph.height
      );
      const scale = Math.max(
        minimumScale,
        Math.min(2, previous.scale * factor)
      );
      const ratio = scale / previous.scale;
      return {
        x: width / 2 - (width / 2 - previous.x) * ratio,
        y: height / 2 - (height / 2 - previous.y) * ratio,
        scale,
      };
    });
  };

  const startPan = (event) => {
    if (dragRef.current || event.button !== 0 || event.target.closest("button"))
      return;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      camera,
    };
    setIsPanning(true);
    event.preventDefault();
  };

  const pan = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setCamera({
      ...drag.camera,
      x: drag.camera.x + event.clientX - drag.clientX,
      y: drag.camera.y + event.clientY - drag.clientY,
    });
  };

  const stopPan = (event) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const revealFocusedNode = (node) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // Browsers can scroll overflow:hidden containers when tabbing. Keep all
    // navigation in the camera so nodes and SVG edges always stay aligned.
    viewport.scrollLeft = 0;
    viewport.scrollTop = 0;
    const { width, height } = viewport.getBoundingClientRect();
    if (!width || !height) return;
    setCamera((previous) => {
      const left = previous.x + node.x * previous.scale;
      const top = previous.y + node.y * previous.scale;
      const right = left + NODE_WIDTH * previous.scale;
      const bottom = top + NODE_HEIGHT * previous.scale;
      const dx =
        left < 16 ? 16 - left : right > width - 16 ? width - 16 - right : 0;
      const dy =
        top < 16 ? 16 - top : bottom > height - 16 ? height - 16 - bottom : 0;
      return dx || dy
        ? { ...previous, x: previous.x + dx, y: previous.y + dy }
        : previous;
    });
  };

  const hasGraph = graph.nodes.length > 0;
  return (
    <section
      className={styles.root}
      aria-label="Task graph"
      onKeyDown={(event) => {
        if (event.key === "Escape") setSelectedId(null);
      }}
    >
      <FilterBar taskFilter={taskFilter} />
      <div className={styles.toolbar}>
        <h2>Task graph</h2>
        <div className={styles.controls}>
          <button
            type="button"
            disabled={!hasGraph}
            onClick={() => zoom(1 / 1.25)}
            aria-label="Zoom out"
          >
            −
          </button>
          <output aria-label="Graph zoom">
            {Math.round(camera.scale * 100)}%
          </output>
          <button
            type="button"
            disabled={!hasGraph}
            onClick={() => zoom(1.25)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button type="button" disabled={!hasGraph} onClick={fitGraph}>
            Fit graph
          </button>
        </div>
      </div>
      <ul className={styles.legend} aria-label="Task status legend">
        {Object.entries(TASK_GRAPH_STATUSES).map(([status, label]) => (
          <li key={status}>
            <span
              className={`${styles.swatch} ${styles[status]}`}
              aria-hidden="true"
            />
            {label}
          </li>
        ))}
      </ul>
      <p id={instructionsId} className={styles.instructions}>
        Parents → children. Drag the background to pan. Select a task to
        highlight its connections. Escape clears selection.
      </p>
      {graph.hasCycle ? (
        <p role="alert">
          Cannot display the task graph because the parent–child relationships
          contain a cycle. Remove the circular relationship in another view and
          try again.
        </p>
      ) : !hasGraph ? (
        <p>{appData.tasks.length ? "No matching tasks." : "No tasks yet."}</p>
      ) : (
        <>
          <div
            ref={viewportRef}
            className={styles.viewport}
            data-panning={isPanning}
            role="group"
            aria-label="Task graph canvas"
            aria-describedby={instructionsId}
            tabIndex={0}
            onPointerDown={startPan}
            onPointerMove={pan}
            onPointerUp={stopPan}
            onPointerCancel={stopPan}
            onLostPointerCapture={stopPan}
          >
            <div
              className={styles.scene}
              style={{
                width: graph.width,
                height: graph.height,
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
              }}
            >
              {graph.groups.map((group) => (
                <div
                  key={group.id}
                  className={styles.group}
                  aria-hidden="true"
                  style={{
                    left: group.x,
                    top: group.y,
                    width: group.width,
                    height: group.height,
                  }}
                >
                  {group.label && (
                    <span className={styles.groupLabel}>{group.label}</span>
                  )}
                </div>
              ))}
              <svg
                className={styles.edges}
                width={graph.width}
                height={graph.height}
                aria-hidden="true"
              >
                <defs>
                  {[arrowId, highlightedArrowId].map((id, index) => (
                    <marker
                      key={id}
                      id={id}
                      viewBox="0 0 10 10"
                      refX="10"
                      refY="5"
                      markerWidth="8"
                      markerHeight="8"
                      orient="auto"
                    >
                      <path
                        d="M 0 0 L 10 5 L 0 10 z"
                        className={
                          index ? styles.highlightedArrow : styles.arrow
                        }
                      />
                    </marker>
                  ))}
                </defs>
                {graph.edges.map(({ source, target }) => {
                  const parent = nodesById.get(source);
                  const child = nodesById.get(target);
                  const startX = parent.x + NODE_WIDTH;
                  const startY = parent.y + NODE_HEIGHT / 2;
                  const endX = child.x;
                  const endY = child.y + NODE_HEIGHT / 2;
                  const bend = (endX - startX) / 2;
                  const highlighted =
                    source === selectedId || target === selectedId;
                  return (
                    <path
                      key={`${source}-${target}`}
                      data-source={source}
                      data-target={target}
                      data-highlighted={highlighted}
                      className={styles.edge}
                      d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`}
                      markerEnd={`url(#${highlighted ? highlightedArrowId : arrowId})`}
                    />
                  );
                })}
              </svg>
              {graph.nodes.map((node) => {
                const status = getTaskGraphStatus(node.task);
                const label = TASK_GRAPH_STATUSES[status];
                return (
                  <button
                    key={node.id}
                    type="button"
                    className={`${styles.node} ${styles[status]}`}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: NODE_WIDTH,
                      height: NODE_HEIGHT,
                    }}
                    data-task-id={node.id}
                    data-connected={
                      selectedId !== null && connectedIds.has(node.id)
                    }
                    aria-label={`${node.task.name} — ${label}`}
                    aria-pressed={selectedId === node.id}
                    title={`${node.task.name} — ${label}`}
                    onFocus={() => revealFocusedNode(node)}
                    onClick={() => setSelectedId(node.id)}
                  >
                    <span className={styles.title}>{node.task.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.details} aria-live="polite" aria-atomic="true">
            {selectedTask ? (
              <>
                <strong>{selectedTask.name}</strong>
                <span>
                  {TASK_GRAPH_STATUSES[getTaskGraphStatus(selectedTask)]}
                </span>
              </>
            ) : (
              <span>Select a task to see its full title and status.</span>
            )}
          </div>
        </>
      )}
    </section>
  );
}
