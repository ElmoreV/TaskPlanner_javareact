import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTopicPathByTopicId } from '../Topics/TopicHelper.js';
import TaskContent from '../Tasks/TaskContent.js'
import { FinishedState } from '../Tasks/TaskInterfaces.tsx';
import { translateLastCompletedDatetime } from '../Tasks/TaskHelperFuncs.js';


const ScheduledTaskView = (props) => {

    // 1. Show a list of tasks that are scheduled
    // 2. Should be given a timebox, or a day or an order or .....
    // 3. And can be adjusted


    return (
        <>
            <div className="taskList">

            </div>
        </>
    )
}