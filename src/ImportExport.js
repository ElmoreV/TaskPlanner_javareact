import { useState, useRef } from 'react';
import YAML from 'yaml';
import {
    convert_old_topic_tasks_to_new_topic_tasks,
    convert_new_topic_tasks_to_old_topic_tasks
} from './Converter';
import { sanitizeWeekOrderIndex2 } from './ModifyFuncGeneratorsV1'
var hash = require('object-hash');

const ImportExport = (props) => {
    console.debug("Rendering ImportExport")
    const { tasks, topics, setTasks, setTopics } = props;



    const fileInputRef = useRef(null);
    const fileNameRef = useRef("")
    const inputVersion = (tasks, topics) => {
        console.debug(tasks.length)
        console.debug('taskName' in tasks[0])
        console.debug(topics.length)
        console.debug('title' in topics[0])
        if ((tasks.length > 0 && 'taskName' in tasks[0])
            || (topics.length > 0 && 'title' in topics[0])) { return 'v0' }
        else { return 'v1' }
    }

    /*
    ///////////
    ////// Calculating hash
    ///////////////
    */
    const calculateTaskHash = (tasks) => {
        // Strip unimportant stuff
        // Topics: folded/unfolded
        // Otherwise everything is important?
        // The tasks need to be sorted on id
        let newTasks = structuredClone(tasks)
        newTasks = sanitizeWeekOrderIndex2(newTasks)
        let fixedTasks = newTasks.sort((a, b) => (a.id > b.id)).map((task) => {
            return {
                name: task.name,
                id: task.id,
                topics: task.topics.sort(),
                completed: task.completed ? true : false,
                thisWeek: task.thisWeek ? true : false,
                repeated: task.repeated ? true : false,
                scheduled: task.scheduled ? true : false,
                weekOrderIndex: (task.thisWeek && task.weekOrderIndex > 0) ? task.weekOrderIndex : 0
            }
        }
        )
        let taskHash = hash(fixedTasks)
        console.log(`Calculated hash of tasks: ${taskHash}`)
        // The topics need to be sorted on id
        return taskHash
    }

    const calculateTopicHash = (topics) => {
        // Strip unimportant stuff
        // Topics: folded/unfolded
        // Otherwise everything is important?
        // The tasks need to be sorted on id
        let newTopics = structuredClone(topics)
        const fixTopics = (topicList) => {
            let fixedTopicList = topicList.sort((a, b) => (a.id > b.id)).map((topic) => {
                // return a new topic wihtout the unfolded
                return {
                    name: topic.name,
                    id: topic.id,
                    subtopics: fixTopics(topic.subtopics)
                }
            })
            return fixedTopicList

        }
        let topicHash = hash(fixTopics(newTopics))

        console.log(`Calculated hash of topics: ${topicHash}`)
        // The topics need to be sorted on id
        return topicHash
    }

    const [taskHash, setTaskHash] = useState(null)
    const [topicHash, setTopicHash] = useState(null)
    const [loadedTaskHash, setLoadedTaskHash] = useState(null)
    const [loadedTopicHash, setLoadedTopicHash] = useState(null)


    const calculateHash = (tasks, topics) => {
        setTaskHash(calculateTaskHash(tasks))
        setTopicHash(calculateTopicHash(topics))
    }


    /*
    /////////////
    ///// YAML
    ////////////////////
    */


    const buildYAML_r = (subtopics, tasks, indent_level) => {
        let YAMLstr = ''
        console.debug(YAMLstr)
        // console.log(subtopics)
        for (let i = 0; i < subtopics.length; i++) {
            // Add topic name as key
            let topic = subtopics[i]
            if (indent_level == 0) {
                // console.log(subtopics)
                // console.log('@ indent level 0')
                YAMLstr = YAMLstr.concat(' '.repeat(4 * indent_level), `'${topic.name}':\n`)

            } else {
                YAMLstr = YAMLstr.concat(' '.repeat(4 * indent_level), '- ', `'${topic.name}':\n`)
            }
            // Add all tasks in this subtopic to the YAML
            let relevant_tasks = tasks.filter((t) => t.topics.includes(topic.id))
            for (let j = 0; j < relevant_tasks.length; j++) {
                let task = relevant_tasks[j]
                YAMLstr = YAMLstr.concat(' '.repeat(4 * (indent_level + 1)), `- '${task.name}'\n`)
            }
            // Do the same for all the subtopics
            // Add
            if (topic.subtopics.length > 0) { YAMLstr = YAMLstr.concat(buildYAML_r(topic.subtopics, tasks, indent_level + 1)) }
        }

        return YAMLstr
    }

    const exportYAML = () => {
        // '''
        // Export as
        // - Topic:
        //     - SubTopic:
        //         - Task1
        //         - Task2
        //         - Task3
        // '''
        // const YAML = 
        // console.log('Starting Yaml building')
        const YAMLcontent = buildYAML_r(topics, tasks, 0)
        const blob = new Blob([YAMLcontent], { type: "text/yaml" });
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        if (fileNameRef.current.length > 0) {
            console.log(fileNameRef.current)
            // a.download = fileInputRef.split(".")[0]
            a.download = fileNameRef.current + '.yaml'
        }
        else {
            a.download = "tasks_topics.yaml";
        }
        a.click();
    }




    const importYAML = (YAMLstr) => {
        // Expected:
        // - Name: '
        console.log('Parsing YAML')
        console.info(YAMLstr)
        let res = YAML.parse(YAMLstr)
        console.info(res)
        let importedTasks = []
        let importedTopics = []
        const getFreeImportedTaskKey = () => {
            return 1 + importedTasks.reduce((max_key, task) => Math.max(max_key, task.key), 0);
        }
        let usedKeys = [0]

        const getFreeImportedTopicKey = () => {
            let max_id = 1 + Math.max(...usedKeys)
            usedKeys = usedKeys.concat(max_id)
            // console.log(max_id)
            return max_id;
        }
        const importNewTask = (name, superTopic) => {
            // TODO: check if a taskName already exists
            // And duplicates will be fused (add topics together)
            let newTask = {
                taskName: name,
                key: getFreeImportedTaskKey(),
                topics: [superTopic],
                complete: false
            }
            importedTasks = importedTasks.concat(newTask)
        }
        const importNewTopic_r = (node) => {
            // Go through all objects in list
            // if mapping: is subtopic
            // if scalar/item: is tasks
            console.debug('New call of import')
            console.debug(node)
            let newTopics = []
            // let newTopic = {
            //     id:getFreeImportedTopicKey(),
            //     title:'Hello',
            //     unfolded:true,
            //     subtopics:[]
            // }
            // let importedTopics = []
            console.debug('Enumerate properties')
            for (var key in node) {
                let newTopic = {
                    id: getFreeImportedTopicKey(),
                    title: 'Hello',
                    unfolded: true,
                    subtopics: []
                }
                let importedTopics = []
                console.debug('Key: ')
                console.debug(key)
                newTopic.title = key
                let val = node[key]
                console.debug('Val:')
                console.debug(val)
                if (typeof val === 'string') {
                    // Add new tasks
                    console.debug('New task found head' + val)
                    importNewTask(val, key)
                } else {
                    if (val instanceof Array) {
                        // It's an empty task list, ignore
                        console.debug('List found head')
                        for (let i = 0; i < val.length; i++) {
                            let subnode = val[i]
                            console.debug('Subnode is')
                            console.debug(subnode)
                            if (typeof subnode === 'string') {
                                // Add new tasks
                                console.debug('New task found loop' + subnode)
                                importNewTask(subnode, key)
                            } else if (subnode instanceof Array) {
                                // It's an empty task list, ignore
                                console.debug('Empty list found  loop')
                            } else {
                                // It's an object/subtopic
                                console.debug(typeof subnode)
                                console.debug(subnode + '  loop')
                                importedTopics = importedTopics.concat(importNewTopic_r(subnode))
                                console.debug('End recurse loop')
                            }
                        }
                    }
                    else {
                        // It's an object/subtopic
                        console.debug(typeof val)
                        console.debug(val + ' head')
                        importedTopics = importedTopics.concat(importNewTopic_r(val))
                        console.debug('End recurse head')
                    }

                }
                newTopic.subtopics = importedTopics
                console.debug('new topic:')
                console.debug(newTopic)

                newTopics = newTopics.concat(newTopic)
            }
            console.debug('new topics/ret_obj:')
            console.debug(newTopics)
            return newTopics

            // newTopic.subtopics = importedTopics
            // console.log(newTopic)
            // return newTopic


        }
        let res2 = importNewTopic_r(res)
        console.debug('Result')
        console.debug(res2)
        console.debug(importedTasks)
        // Extract topics?
        // Go through the YAML tree

        // Extract tasks


        setTopics(res2);
        setTasks(importedTasks);
    }

    /*
    /////////////////////////////////////
    //////////// Markdown
    ////////////////////////////////////
    */

    const buildMarkdownRecursive = (subtopics, tasks, indent_level) => {
        let MarkdownStr = ''
        console.debug(MarkdownStr)
        // console.log(subtopics)
        for (let i = 0; i < subtopics.length; i++) {
            // Add topic name as key
            let topic = subtopics[i]
            if (indent_level == 0) {
                // console.log(subtopics)
                // console.log('@ indent level 0')
                MarkdownStr = MarkdownStr.concat('\n', '#'.repeat(indent_level + 1), ` ${topic.name}:\n\n`)

            } else {
                MarkdownStr = MarkdownStr.concat('\n', '#'.repeat(indent_level + 1), ` ${topic.name}:\n\n`)
            }
            // Add all tasks in this subtopic to the Markdown
            let relevant_tasks = tasks.filter((t) => t.topics.includes(topic.id))
            for (let j = 0; j < relevant_tasks.length; j++) {
                let task = relevant_tasks[j]
                let completedSymbol = task.completed ? '[x]' : '[ ]'
                MarkdownStr = MarkdownStr.concat(`- ${completedSymbol} ${task.name}\n`)
            }
            // Do the same for all the subtopics
            // Add
            if (topic.subtopics.length > 0) {
                MarkdownStr = MarkdownStr.concat(buildMarkdownRecursive(topic.subtopics,
                    tasks, indent_level + 1))
            }
        }

        return MarkdownStr
    }


    const exportMarkdown = () => {
        let [new_topics, new_tasks] = [topics, tasks]
        const MarkdownContent = buildMarkdownRecursive(topics, tasks, 0)
        const blob = new Blob([MarkdownContent], { type: "text/markdown" });
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        if (fileNameRef.current.length > 0) {
            console.log(fileNameRef.current)
            // a.download = fileInputRef.split(".")[0]
            a.download = fileNameRef.current + '.md'
        }
        else {
            a.download = "tasks_topics.md";
        }
        a.click();

    }


    /*
    ///////////////////////////////////
    ///////////// JSON
    //////////////////////////////////////
    */
    const exportjson = () => {

        let [new_topics, new_tasks] = [topics, tasks]
        // Check if v0 format, or v1 format
        // if (inputVersion(new_topics, new_tasks) == 'v0') {
        //     console.log('Converting internal v0 format to v1');
        //     [new_topics, new_tasks] = convert_old_topic_tasks_to_new_topic_tasks(topics, tasks)
        // }
        // Pretty print json (with 2 spaces as space parameter)
        setLoadedTaskHash(calculateTaskHash(tasks))
        setLoadedTopicHash(calculateTopicHash(topics))

        const jsonContent = JSON.stringify({ topics: new_topics, tasks: new_tasks }, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        if (fileNameRef.current.length > 0) {
            console.log(fileNameRef.current)
            // a.download = fileInputRef.split(".")[0]
            a.download = fileNameRef.current + '.json'
        }
        else {
            a.download = "tasks_topics.json";
        }
        a.click();
    }



    // console.log(tasks[0].topics.includes(topics[0].title))
    const importjson = (jsonStr) => {
        const uploadedData = JSON.parse(jsonStr);
        // As loaded (may be new format, may be old format)
        // setTopics(uploadedData.topics);
        // setTasks(uploadedData.tasks);
        let [old_topics, old_tasks] = [uploadedData.topics, uploadedData.tasks]
        // Sanitize input

        // Version rectification
        let version = inputVersion(old_tasks, old_topics)
        console.log("Version of input is " + version.toString())
        if (version == "v0") {
            console.log("converting imported v0 to v1 format");
            [old_topics, old_tasks] = convert_old_topic_tasks_to_new_topic_tasks(
                uploadedData.topics,
                uploadedData.tasks)
        }
        setLoadedTaskHash(calculateTaskHash(old_tasks))
        setLoadedTopicHash(calculateTopicHash(old_topics))

        setTopics(old_topics)
        setTasks(old_tasks)
        return 'succesful import'

    };
    // const [file,setFile] = useState(null);



    const handleFileToUpload = (e) => {
        console.log('upload start')
        if (e.target.files) {
            // setFile(e.target.files[0]);
            var file = e.target.files[0];
        }
        console.log('file?')
        console.log()
        if (file) {
            fileNameRef.current = file.name.substring(0, file.name.lastIndexOf('.'))
            console.log(fileNameRef.current)
            const reader = new FileReader();
            reader.onload = (evt) => {
                console.log('file loaded now parsing')
                console.log(file.type)
                if (file.type == 'application/json') {
                    try {
                        console.info(importjson(evt.target.result))

                    } catch (e) {
                        console.error('Uploaded file is not JSON enough.', e);
                    }

                } else if (file.name.split('.').at(-1) == 'yaml') {
                    try {
                        console.log(importYAML(evt.target.result))
                    } catch (e) {
                        console.error('Uploaded file is not YAML enough.', e);
                    }

                } else {
                    console.warning('File Type not recognized')
                    console.warning(file.name.split('.').at(-1))
                }
            }
            console.log('start reading')

            reader.readAsText(file);
        }
    }



    return (
        <div>
            <button onClick={exportjson}>Export Tasks [JSON]</button>

            <button onClick={exportYAML}>Export Tasks [YAML]</button>
            <button onClick={exportMarkdown}> Export Tasks [Markdown]</button>
            <button onClick={() => calculateHash(tasks, topics)}> Calc Hash </button>
            <input type="file"
                ref={fileInputRef}
                onChange={handleFileToUpload} />
            <div style={{ width: "1000px" }}>
                <ul>
                    <li>TopicHash on load: {loadedTopicHash}</li>
                    <li>TaskHash on load: {loadedTaskHash}</li>
                    <li>TopicHash now: {topicHash}</li>
                    <li>TaskHash now: {taskHash}</li>
                </ul>
            </div>
        </div>);
}

export default ImportExport