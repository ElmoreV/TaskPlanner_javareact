// TODO: needs full review

import React, { useEffect, useId, useRef, useState } from "react";
import styles from "./TaskTags.module.css";

// Supplying tags enables display; supplying options and a callback enables editing.
const TaskTags = ({ tags, selectableTags, onTopicChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(new Set());
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const searchRef = useRef(null);
  const popupId = useId();
  const editable = selectableTags !== undefined && !!onTopicChange;
  const selectedIds = tags.map((tag) => tag.id);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const closeOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };
  const toggleBranch = (id) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const handleKeys = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const inputs = Array.from(
        containerRef.current.querySelectorAll(
          'input[type="search"], input[type="checkbox"]'
        )
      );
      const index = inputs.indexOf(document.activeElement);
      const next = index + (event.key === "ArrowDown" ? 1 : -1);
      inputs[Math.max(0, Math.min(next, inputs.length - 1))]?.focus();
      event.preventDefault();
    }
  };
  const renderOption = (tag) => (
    <label className={styles.option}>
      <input
        type="checkbox"
        checked={selectedIds.includes(tag.id)}
        onChange={(event) => onTopicChange(tag.id, event.target.checked)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onTopicChange(tag.id, !selectedIds.includes(tag.id));
          }
        }}
      />
      <span>
        <span>{tag.name}</span>
        <small className={styles.path}>{tag.path}</small>
      </span>
    </label>
  );
  const renderBranch = (parentId = null) => (
    <ul className={styles.tree}>
      {selectableTags
        .filter((tag) => tag.parentId === parentId)
        .map((tag) => {
          const hasChildren = selectableTags.some(
            (entry) => entry.parentId === tag.id
          );
          return (
            <li key={tag.id}>
              <div className={styles.branch}>
                {hasChildren ? (
                  <button
                    type="button"
                    className={styles.expand}
                    onClick={() => toggleBranch(tag.id)}
                  >
                    {expanded.has(tag.id) ? "▾" : "▸"}
                  </button>
                ) : (
                  <span className={styles.spacer} />
                )}
                {renderOption(tag)}
              </div>
              {hasChildren && expanded.has(tag.id) && renderBranch(tag.id)}
            </li>
          );
        })}
    </ul>
  );
  const query = editable && open ? search.trim().toLocaleLowerCase() : "";
  const matches = query
    ? selectableTags.filter((tag) =>
        tag.path.toLocaleLowerCase().includes(query)
      )
    : [];

  return (
    <div
      className={styles.tags}
      ref={containerRef}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag.id}
          className={styles.chip}
          title={tag.path}
          tabIndex={0}
        >
          {tag.label}
        </span>
      ))}
      {editable && (
        <div className={styles.editor}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.addTag}
            onClick={() => {
              setSearch("");
              setOpen((previous) => !previous);
            }}
          >
            +Tag
          </button>
          {open && (
            <div
              id={popupId}
              className={styles.picker}
              onKeyDown={handleKeys}
            >
              <input
                ref={searchRef}
                type="search"
                placeholder="Search tags…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div className={styles.options}>
                {!selectableTags.length ? (
                  <p>No tags available.</p>
                ) : query ? (
                  matches.length ? (
                    matches.map((tag) => (
                      <div key={tag.id}>{renderOption(tag)}</div>
                    ))
                  ) : (
                    <p>No matching tags.</p>
                  )
                ) : (
                  renderBranch()
                )}
              </div>
              <button type="button" onClick={close}>
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskTags;
