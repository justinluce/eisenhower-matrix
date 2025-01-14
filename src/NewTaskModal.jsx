import { useState } from "react";

const NewTaskModal = ({ isOpen, onClose, taskList, updateList, listName }) => {
    const [name, setName] = useState("");
    console.log(taskList);

    const updateTaskList = () => {
        const idString = listName + taskList.length;
        const newTask = {
            id: idString,
            text: name
        }
        console.log(newTask);
        updateList([...taskList, newTask]);
        onClose();
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button onClick={() => onClose()}>X</button>
                <h2>Add a new task</h2>
                <label htmlFor="task-name">Name: </label>
                <input className="task-name-input" name="task-name" onChange={(e) => setName(e.target.value)} />
                <button onClick={() => updateTaskList()}>Done</button>
            </div>
        </div>
    )
}

export default NewTaskModal;