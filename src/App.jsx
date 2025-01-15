import React, { useEffect, useState } from 'react'
import './App.css';
import NewTaskModal from './NewTaskModal';

function App() {
  const [doTasks, setDoTasks] = useState([
    {
      id: "do0",
      text: "Edit task here",
    },
  ]);
  const [scheduleTasks, setScheduleTasks] = useState([]);
  const [delegateTasks, setDelegateTasks] = useState([]);
  const [deleteTasks, setDeleteTasks] = useState([]);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [currentTaskList, setCurrentTaskList] = useState();
  const [currentUpdateList, setCurrentUpdateList] = useState();
  const [currentListName, setCurrentListName] = useState("");
  const [electronUser, setElectronUser] = useState(false);
  
  const usingElectron = () => {
    return !!(typeof window !== 'undefined' && window.electronAPI)
  }

  useEffect(() => {
    setElectronUser(usingElectron());
  }, []);

  useEffect(async () => {
    if (electronUser) {
      const { ipcRenderer } = require('electron');
      const loadedTasks = await ipcRenderer.invoke('load-tasks');
      if (loadedTasks) {
        setDoTasks(loadedTasks.doTasks);
        setScheduleTasks(loadedTasks.scheduleTasks);
        setDelegateTasks(loadedTasks.delegateTasks);
        setDeleteTasks(loadedTasks.deleteTasks);
        return JSON.parse(loadedTasks);
      } else {
        console.error('Failed to load tasks in Electron.');
      }
    } else {
      const savedTasks = JSON.parse(localStorage.getItem('tasks'));
      if (savedTasks) {
        setDoTasks(savedTasks.doTasks);
        setScheduleTasks(savedTasks.scheduleTasks);
        setDelegateTasks(savedTasks.delegateTasks);
        setDeleteTasks(savedTasks.deleteTasks);
      }
    }
  }, []);

  useEffect(() => {
    const tasks = { doTasks, scheduleTasks, delegateTasks, deleteTasks };
    const json = JSON.stringify(tasks, null, 2);
    if (electronUser) {
      setTimeout(async () => {
        const { ipcRenderer } = require('electron');
        const result = await ipcRenderer.invoke('save-tasks', json);
        if (!result.success) {
          console.error('Failed to save tasks in Electron.');
        }
      }, 100);
    } else {
      setTimeout(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }, 100);
    }
  }, [doTasks, scheduleTasks, delegateTasks, deleteTasks]);
    
  const handleSave = async () => {
    const tasks = { doTasks, scheduleTasks, delegateTasks, deleteTasks }
    if (electronUser) {
      await window.electronAPI.saveTasks(tasks);
    } else {
      saveBrowser();
    }
  }
  
  const handleLoad = async () => {
    if (electronUser) {
      const tasks = await window.electronAPI.loadTasks();
      if (tasks) {
        setDoTasks(tasks.doTasks || []);
        setScheduleTasks(tasks.scheduleTasks || []);
        setDelegateTasks(tasks.delegateTasks || []);
        setDeleteTasks(tasks.deleteTasks || []);
    }
    } else {
      loadBrowser();
    }
  }
  
  const saveElectron = async () => {
    const response = await ipcRenderer.invoke('save-tasks', tasks);
    if (response.success) {
        alert('Tasks saved successfully!');
    }
  }
  
  const loadElectron = async () => {
    const loadedTasks = await ipcRenderer.invoke('load-tasks');
    if (loadedTasks) {
        setDoTasks(loadedTasks.doTasks || []);
        setScheduleTasks(loadedTasks.scheduleTasks || []);
        setDelegateTasks(loadedTasks.delegateTasks || []);
        setDeleteTasks(loadedTasks.deleteTasks || []);
    }
  }
  
  const saveBrowser = () => {
    const tasks = { doTasks, scheduleTasks, delegateTasks, deleteTasks };
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "tasks.json";
    link.click();

    URL.revokeObjectURL(url);
  }
  
  const loadBrowser = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
  
        reader.onload = (e) => {
          try {
            const loadedTasks = JSON.parse(e.target.result);
            setDoTasks(loadedTasks.doTasks || []);
            setScheduleTasks(loadedTasks.scheduleTasks || []);
            setDelegateTasks(loadedTasks.delegateTasks || []);
            setDeleteTasks(loadedTasks.deleteTasks || []);
          } catch (err) {
            alert("Failed to load tasks. Please ensure the file is valid JSON.");
          }
        };
  
        reader.readAsText(file);
      }
    }
    input.click();
  }
    
  const Quadrant = ({ headerText, taskList, updateList }) => {
    const handleTextChange = (id, newText) => {
      updateList((prevList) =>
        prevList.map((item) =>
          item.id === id ? { ...item, text: newText } : item
        )
      );
    };
  
    return (
      <div className={`quadrant ${headerText}`}>
        <button
          className="add-task"
          onClick={() => handleNewTask(taskList, updateList, headerText)}
        >
          Add Task
        </button>
        <h4>{headerText.charAt(0).toUpperCase() + headerText.slice(1)}</h4>
        <ul>
          {taskList.map((item) => (
            <li key={item.id}>
              <textarea
                defaultValue={item.text}
                onBlur={(e) => handleTextChange(item.id, e.target.value)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const handleNewTask = (taskList, updateList, name) => {
    setCurrentTaskList(taskList)
    setCurrentUpdateList(() => updateList);
    setCurrentListName(name);
    setShowNewTaskModal(true);
  }

  return (
    <div className='main'>
      <div className='container'>
      {showNewTaskModal && 
        <NewTaskModal 
          isOpen={showNewTaskModal}
          onClose={() => {
            setShowNewTaskModal(false)
          }}
          listName={currentListName}
          taskList={currentTaskList}
          updateList={currentUpdateList}
        />
      }
        <div className='top'>
          <div className='important'><h3>Important</h3></div>
          <div>
            <h3>Urgent</h3>
            <Quadrant headerText={'do'} taskList={doTasks} updateList={setDoTasks} />
          </div>
          <div>
            <h3>Not Urgent</h3>
            <Quadrant headerText={'schedule'} taskList={scheduleTasks} updateList={setScheduleTasks} />
          </div>
        </div>
        <div className='bottom'>
          <div className='notImportant'><h3>Not Important</h3></div>
          <Quadrant headerText={'delegate'} taskList={delegateTasks} updateList={setDelegateTasks} />
          <Quadrant headerText={'delete'} taskList={deleteTasks} updateList={setDeleteTasks} />
        </div>
      </div>
      <div className='save-load'>
        <button onClick={handleSave}>Save to File</button>
        <button onClick={handleLoad}>Load from File</button>
      </div>
    </div>
  )
}

export default App;
