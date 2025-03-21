import React from "react";
import fancyStyles from "./TopicContentFancy.module.css";
import simpleStyles from "./TopicContentSimple.module.css";

const TopicContent = (props) => {
  const {
    name,
    handleToggleFold,
    handleFoldDoubleClick,
    dragHandlers,
    dropHandlers,
    textEditHandlers,
    foldingSymbol,
    isEditing,
    inputRef,
    toggleEdit,
    handleAddTaskClick,
    handleAddTopicClick,
    handleDeleteClick,
    fancy,
  } = props;
  console.debug(`Rendering TopicContent ${name}`);

  let styles = fancy ? fancyStyles : simpleStyles;

  return (
    <div
      className={styles.topic}
      onClick={handleToggleFold}
      {...dragHandlers}
      {...dropHandlers}
    >
      <span onDoubleClick={handleFoldDoubleClick}>{foldingSymbol}</span>
      <div className={styles.textBar}>
        {isEditing ? (
          <input
            type="text"
            value={name}
            {...textEditHandlers}
            ref={inputRef}
          />
        ) : (
          <span onDoubleClick={toggleEdit}>{name}</span>
        )}
      </div>
      <div className={styles.buttonList}>
        {handleAddTaskClick && (
          <button className={styles.topicAddTask} onClick={handleAddTaskClick}>
            Add task
          </button>
        )}
        {handleAddTopicClick && (
          <button
            className={styles.topicAddTopic}
            onClick={handleAddTopicClick}
          >
            Add topic
          </button>
        )}
        {handleDeleteClick && (
          <button className={styles.topicDelete} onClick={handleDeleteClick}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TopicContent;
