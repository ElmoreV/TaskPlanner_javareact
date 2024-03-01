import { useState, useRef} from 'react';
import YAML from 'yaml';


const ImportExport =(props) => {
    const {tasks,topics,setTasks,setTopics} = props;

    const fileInputRef = useRef(null);



    /*
    /////////////
    ///// YAML
    ////////////////////
    */


    const buildYAML_r=(subtopics,tasks,indent_level)=>{
        let YAMLstr = ''
        console.log(YAMLstr)
        // console.log(subtopics)
        for (let i =0;i<subtopics.length; i++){
            // Add topic name as key
            let topic = subtopics[i]
            if (indent_level ==0){
                // console.log(subtopics)
                // console.log('@ indent level 0')
                YAMLstr = YAMLstr.concat(' '.repeat(4*indent_level) ,`'${topic.title}':\n`)

            }else{
                YAMLstr = YAMLstr.concat(' '.repeat(4*indent_level) ,'- ' ,`'${topic.title}':\n`)
            }
            // Add all tasks in this subtopic to the YAML
            let relevant_tasks = tasks.filter((t)=>t.topics.includes(topic.title))
            for (let j=0;j<relevant_tasks.length;j++)
            {
                let task = relevant_tasks[j]
                YAMLstr = YAMLstr.concat(' '.repeat(4*(indent_level+1)),`- '${task.taskName}'\n`)
            }
            // No need to add an empty task list
            // if (relevant_tasks.length ==0)
            // {
            //     YAMLstr = YAMLstr.concat(' '.repeat(4*(indent_level+1)),'- []\n')
            // }
            
            // Do the same for all the subtopics
            // Add
            if (topic.subtopics.length>0)
            {YAMLstr = YAMLstr.concat( buildYAML_r(topic.subtopics,tasks,indent_level+1))}
        }

        return YAMLstr
    }

    const exportYAML=()=>{
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
        const YAMLcontent = buildYAML_r(topics,tasks,0)
        const blob = new Blob([YAMLcontent], {type: "text/yaml"});
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = "tasks_topics.yaml";
        a.click();
    }




    const importYAML=(YAMLstr)=>{
        // Expected:
        // - Name: '
        console.log('Parsing YAML')
        console.log(YAMLstr)
        let res = YAML.parse(YAMLstr)
        console.log(res)
        let importedTasks = []
        let importedTopics = []
        const getFreeImportedTaskKey=()=>{
            return 1+importedTasks.reduce((max_key,task)=>Math.max(max_key,task.key),0);
        }
        let usedKeys = [0]

        const getFreeImportedTopicKey=()=>{
            let max_id = 1+Math.max(...usedKeys)
            usedKeys= usedKeys.concat(max_id)
            // console.log(max_id)
            return max_id;
        }
        const importNewTask=(name,superTopic)=>{
            // TODO: check if a taskName already exists
            // And duplicates will be fused (add topics together)
            let newTask = {taskName:name,
                        key: getFreeImportedTaskKey(),
                    topics: [superTopic],
                complete:false}
            importedTasks = importedTasks.concat(newTask)
        }
        const importNewTopic_r=(node)=>{
            // Go through all objects in list
            // if mapping: is subtopic
            // if scalar/item: is tasks
            console.log('New call of import')
            console.log(node)
            let newTopics = []
            // let newTopic = {
            //     id:getFreeImportedTopicKey(),
            //     title:'Hello',
            //     unfolded:true,
            //     subtopics:[]
            // }
            // let importedTopics = []
            console.log('Enumerate properties')
            for (var key in node)
            {
                let newTopic = {
                    id:getFreeImportedTopicKey(),
                    title:'Hello',
                    unfolded:true,
                    subtopics:[]
                }
                let importedTopics = []
                console.log('Key: ')
                console.log(key)
                newTopic.title=key            
                let val = node[key]
                console.log('Val:')
                console.log(val)
                if (typeof val === 'string')
                {
                    // Add new tasks
                    console.log('New task found head'+val)
                    importNewTask(val,key)
                }else {
                    if (val instanceof Array) 
                    {
                        // It's an empty task list, ignore
                        console.log('List found head')
                        for (let i =0; i<val.length;i++)
                        {
                            let subnode = val[i]
                            console.log('Subnode is')
                            console.log(subnode)
                            if (typeof subnode === 'string')
                            {
                                // Add new tasks
                                console.log('New task found loop'+subnode)
                                importNewTask(subnode,key)
                            }else if (subnode instanceof Array) {
                                // It's an empty task list, ignore
                                console.log('Empty list found  loop')
                            }else{
                                // It's an object/subtopic
                                console.log(typeof subnode)
                                console.log(subnode+'  loop')
                                importedTopics = importedTopics.concat(importNewTopic_r(subnode))
                                console.log('End recurse loop')
                            }
                        }
                    }
                    else{
                        // It's an object/subtopic
                        console.log(typeof val)
                        console.log(val+ ' head')
                        importedTopics = importedTopics.concat(importNewTopic_r(val))
                        console.log('End recurse head')
                    } 
                    
                }
                newTopic.subtopics = importedTopics
                console.log('new topic:')
                console.log(newTopic)
    
                newTopics = newTopics.concat(newTopic)
            }
            console.log('new topics/ret_obj:')
            console.log(newTopics)
            return newTopics

            // newTopic.subtopics = importedTopics
            // console.log(newTopic)
            // return newTopic
            
            
        }
        let res2 = importNewTopic_r(res)
        console.log('Result')
        console.log(res2)
        console.log(importedTasks)
        // Extract topics?
        // Go through the YAML tree
        
        // Extract tasks
        
        
        setTopics(res2);
        setTasks(importedTasks);
    }
    /*
    ///////////////////////////////////
    ///////////// JSON
    //////////////////////////////////////
    */
    const exportjson=()=>{
        // Pretty print json (with 2 spaces as space parameter)
        const jsonContent = JSON.stringify({topics,tasks},null,2);
        const blob = new Blob([jsonContent], {type: "application/json"});
        var a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = "tasks_topics.json";
        a.click();
    }



    // console.log(tasks[0].topics.includes(topics[0].title))
    const importjson=(jsonStr)=>{
        const uploadedData = JSON.parse(jsonStr);
        console.log(uploadedData.topics);
        console.log(uploadedData.tasks);
        
        setTopics(uploadedData.topics);
        setTasks(uploadedData.tasks);
    };
    // const [file,setFile] = useState(null);



    const handleFileToUpload=(e)=>{
        console.log('upload start')
        if (e.target.files) {
            // setFile(e.target.files[0]);
            var file = e.target.files[0];
          }
          console.log('file?')
          console.log()
          if (file){
            const reader = new FileReader();
            reader.onload = (evt)=>{
                console.log('file loaded now parsing')
                console.log(file.type)
                if (file.type=='application/json'){
                    try{
                        console.log(importjson(evt.target.result))
    
                    }catch(e){
                        console.error('Uploaded file is not JSON enough.',e);
                    }

                }else if(file.name.split('.').at(-1)=='yaml'){
                    try{
                        console.log(importYAML(evt.target.result))
                    }catch(e){
                        console.error('Uploaded file is not YAML enough.',e);
                    }

                }else{
                    console.log('File Type not recognized')
                    console.log(file.name.split('.').at(-1))
                }
            }
            console.log('start reading')

            reader.readAsText(file);
        }
    }

    

    return (
    <div>
    <button onClick = {exportjson}>Export Tasks [JSON]</button>
    <button onClick = {exportYAML}>Export Tasks [YAML]</button>
     <input type="file" 
             ref={fileInputRef}
     onChange={handleFileToUpload}/>
     </div>);
}

export default ImportExport