import React, { useEffect, useRef, useState } from 'react'
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

  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    console.log(savedTasks);
    if (savedTasks) {
      setDoTasks(savedTasks.doTasks);
      setScheduleTasks(savedTasks.scheduleTasks);
      setDelegateTasks(savedTasks.delegateTasks);
      setDeleteTasks(savedTasks.deleteTasks);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const tasks = { doTasks, scheduleTasks, delegateTasks, deleteTasks };
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, 100);
  }, [doTasks, scheduleTasks, delegateTasks, deleteTasks]);

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
          onClick={() => handleNewTask(taskList, updateList)}
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
  
  const handleNewTask = (taskList, updateList) => {
    setCurrentTaskList(taskList)
    setCurrentUpdateList(() => updateList);
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
    </div>
  )
}

export default App;
