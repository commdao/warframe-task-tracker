import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, SquarePen } from 'lucide-react';

const WarframeTaskTracker = () => {
  const [tasks, setTasks] = useState(() => {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [
      { id: 1, description: 'Farm Meso N11 Relic for Nyx Prime Part', timeSensitive: false, interest: 'low', location: 'Railjack', type: 'Prime Parts' },
      { id: 2, description: 'Farm Tek Assault for Kavat Mod', timeSensitive: false, interest: 'high', location: 'Deimos', type: 'Mods' },
      { id: 3, description: 'Add Somachord Pop Songs', timeSensitive: false, interest: 'high', location: 'Various', type: 'Items' },
    ];
  });

  const handleDragStart = (e, taskId, index) => {
    try{
      //e.preventDefault();
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('application/json', JSON.stringify({
        taskId: taskId.toString(),
        sourceIndex: index.toString()
      }));
      e.currentTarget.classList.add('opacity-50');
    } catch (error) {
      console.error('Drag start error:', error);
    }
  };

  const handleDragEnd = (e) => {
    try {
      e.preventDefault();
      e.currentTarget.classList.remove('opacity-50');

      document.querySelectorAll('.task').forEach(task => {
        task.classList.remove('border-t-4', 'border-b-4');
      });
    } catch (error) {
      console.error('Drag end error:', error);
    }
  };

  const handleDragOver = (e) => {
    try {
      e.preventDefault();
      e.stopPropagation();

      const dropzone = e.currentTarget;
      dropzone.classList.add('bg-gray-600');
      const taskElement = e.target.closest('.task');

      if (taskElement) {
        const rect = taskElement.getBoundingClientRect();
        const midPoint = rect.top + rect.height / 2;
  
        document.querySelectorAll('.task').forEach(task => {
          taskElement.classList.remove('border-t-4', 'border-b-4');
        });
  
        if (e.clientY < midPoint) {
          taskElement.classList.add('border-t-4');
        } else {
          taskElement.classList.add('border-b-4');
        }
      }
    } catch (error) {
      console.error('Drag over error:', error);
    }
  };

  const handleDragLeave = (e) => {
    try {
      e.preventDefault();
      e.stopPropagation();
      const dropzone = e.currentTarget;
      dropzone.classList.remove('bg-gray-600');

      const taskElement = e.target.closest('.task');
      if (taskElement) {
        taskElement.classList.remove('border-t-4', 'border-b-4');
      }
    } catch (error) {
      console.error('Drag leave error:', error);
    }
  };

  const handleDrop = (e, isTimeSensitive, targetIndex) => {
    try {
      e.preventDefault();
      e.stopPropagation();

      const dropzone = e.currentTarget;
      dropzone.classList.remove('bg-gray-600');

      document.querySelectorAll('.task').forEach(task => {
        task.classList.remove('border-t-4', 'border-b-4');
      });

      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const taskId = parseInt(data.taskId);
      const sourceIndex = parseInt(data.sourceIndex);
      
      if (isNaN(taskId) || isNaN(sourceIndex)) {
        console.error('Invalid drag data');
        return;
      }
      
      const taskElement = e.target.closest('.task');
      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(sourceIndex, 1);

      if (!movedTask) {
        console.error('Task not found');
        return;
      }

      if (movedTask.timeSensitive !== isTimeSensitive) {
        movedTask.timeSensitive = isTimeSensitive;
      }
      let insertIndex = targetIndex;
        if (taskElement) {
          const rect = taskElement.getBoundingClientRect();
          const midPoint = rect.top + rect.height / 2;
          if (e.clientY > midPoint) {
            insertIndex++;
          }
        }
        newTasks.splice(insertIndex, 0, movedTask);
        setTasks(newTasks);
    } catch (error) {
      console.error('Drop error:', error);
    }    
  };

  const [constantTasks, setConstantTasks] = useState(() => {
    const storedConstantTasks = localStorage.getItem('constantTasks');
    return storedConstantTasks ? JSON.parse(storedConstantTasks) : [
      { id: 'incarnon-weapon', description: 'Incarnon (Weapon)', timeSensitive: true, interest: 'high', location: 'Duviri', type: 'Incarnon Upgrade', editing: false },
      { id: 'base-warframe', description: '(Warframe)', timeSensitive: true, interest: 'high', location: 'Duviri', type: 'Base Frame', editing: false },
    ];
  });

  const [newTask, setNewTask] = useState({ 
    description: '', 
    timeSensitive: false, 
    interest: 'low', 
    location: '', 
    type: 'Prime Parts',
    huntDetails: { weapon: '', stats: '', hasEphemera: false }
  });

  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationInputRef = useRef(null);

  const locations = [
    "Earth", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
    "Ceres", "Eris", "Sedna", "Europa", "Deimos", "Void", "Railjack", "Duviri"
  ];

  const Tooltip = ({ children, content }) => {
    const [show, setShow] = useState(false);

    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          {children}
        </div>
        {show && (
          <div className="absolute z-10 p-2 bg-gray-800 text-white text-sm rounded shadow-lg mt-1">
            {content}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('constantTasks', JSON.stringify(constantTasks));
  }, [constantTasks]);

  const addTask = () => {
    if (newTask.description) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ 
        description: '', 
        timeSensitive: false, 
        interest: 'low', 
        location: '', 
        type: 'Prime Parts',
        huntDetails: { weapon: '', stats: '', hasEphemera: false }
      });
    }
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setNewTask({...newTask, location: value});
    setShowLocationDropdown(value.length > 0);
  };

  const selectLocation = (location) => {
    setNewTask({...newTask, location});
    setShowLocationDropdown(false);
  };

  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      if (a.interest === b.interest) {
        return 0;
      }
      return a.interest === 'high' ? -1 : 1;
    });
  };

  const toggleConstantTaskEdit = (id) => {
    setConstantTasks(constantTasks.map(task => 
      task.id === id ? { ...task, editing: !task.editing } : task
    ));
  };

  const TaskList = ({ title, filterFn }) => {
    const filteredTasks = tasks.filter(filterFn);
    const sortedTasks = sortTasks(filteredTasks);
    const isTimeSensitive = title === "Time Sensitive Tasks";

    return (
          <div 
            className="task-list w-full min-w-full"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, isTimeSensitive, 0)}
          >
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        {isTimeSensitive && constantTasks.map(task => (
          <div key={task.id} className="task bg-gray-700 p-4 mb-4 rounded-lg flex justify-between items-center">
            <div className="flex flex-col flex-grow mr-2">
              <span className="text-yellow-300 text-sm">
                ★ {task.type}
              </span>
              {task.editing ? (
                <input 
                  type="text" 
                  value={task.description}
                  onChange={(e) => {
                    const newDescription = e.target.value;
                    setConstantTasks(constantTasks.map(t => 
                      t.id === task.id ? { ...t, description: newDescription } : t
                    ));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      toggleConstantTaskEdit(task.id);
                    }
                  }}
                  onBlur={(e) => toggleConstantTaskEdit(task.id)}
                  autoFocus
                  className="bg-gray-600 text-white p-1 rounded"
                />
              ) : (
                <span className="text-gray-200">{task.description}</span>
              )}
              <span className="text-gray-400 text-sm italic">{task.location}</span>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded" onClick={() => toggleConstantTaskEdit(task.id)}>
              <SquarePen size={16} />
            </button>
          </div>
        ))}
        {sortedTasks.map((task, index) => (
              <div
                key={task.id}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, task.id, index)}
                onDragEnd={handleDragEnd}
                className="task bg-gray-700 p-4 mb-4 rounded-lg flex justify-between items-center"
              >     
            <div className="flex flex-col">
              <span className={`${task.interest === 'high' ? 'text-yellow-300' : 'text-gray-400'} text-sm`}>
                {task.interest === 'high' ? '★ ' : '☆ '}
                {task.type}
              </span>
              {task.type === 'Hunts' ? (
                <Tooltip content={
                  <div>
                    <p>Weapon: {task.huntDetails.weapon}</p>
                    <p>Stats: {task.huntDetails.stats}</p>
                    <p>Ephemera: {task.huntDetails.hasEphemera ? 'Yes' : 'No'}</p>
                  </div>
                }>
                  <span className="text-gray-200">{task.description}</span>
                </Tooltip>
              ) : (
                <span className="text-gray-200">{task.description}</span>
              )}
              {task.location && <span className="text-gray-400 text-sm italic"> ({task.location})</span>}
            </div>
            <button className="bg-red-500 hover:bg-red-600 text-white p-2 rounded" onClick={() => removeTask(task.id)}>
              <X size={16} />
            </button>
            </div>
        ))}
      </div>
    );
  };

  const downloadTasks = () => {
    const tasksData = JSON.stringify({ tasks, constantTasks });
    const blob = new Blob([tasksData], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'warframe-tasks.json';
    link.click();
  };

  const uploadTasks = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const savedData = JSON.parse(e.target.result);
      if (savedData.tasks) {
        setTasks(savedData.tasks);
        localStorage.setItem('tasks', JSON.stringify(savedData.tasks));
      }
      if (savedData.constantTasks) {
        setConstantTasks(savedData.constantTasks);
        localStorage.setItem('constantTasks', JSON.stringify(savedData.constantTasks));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="warframe-tracker max-w-4xl mx-auto p-6 bg-gray-800 text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Warframe Task Tracker</h1>

      {/* Explanation for the backup/restore functionality */}
      <p className="mb-4 text-gray-400">
        Note: It's recommended to download a backup of your tasks while a more stable task tracker is being built.
      </p>

      {/* Backup/Restore buttons */}
      <div className="mt-4 flex space-x-4">
        <button onClick={downloadTasks} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded">
          Download Tasks
        </button>

        {/* Custom file input */ }
        <label className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded cursor-pointer">
          Upload File
          <input 
            type="file"
            onChange={uploadTasks}
            accept=".json"
            className="hidden"
          />
        </label>
      </div>

      <div className="task-lists w-full min-w-full flex flex-col gap-8 mt-8">
        <div className="w-full">
          <TaskList title="Time Sensitive Tasks" filterFn={task => task.timeSensitive} />
        </div>
        <div className="w-full">
          <TaskList title="Non-Time Sensitive Tasks" filterFn={task => !task.timeSensitive} />
        </div>
      </div>

      <div className="add-task mt-8">
        <h2 className="text-2xl font-bold mb-4">Add New Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            className="p-2 rounded bg-gray-700 text-white w-full"
          />
          <select
            value={newTask.type}
            onChange={(e) => setNewTask({...newTask, type: e.target.value})}
            className="p-2 rounded bg-gray-700 text-white w-full"
          >
            <option value="Prime Parts">Prime Parts</option>
            <option value="Mods">Mods</option>
            <option value="Items">Items</option>
            <option value="Hunts">Hunts</option>
          </select>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={newTask.timeSensitive}
                onChange={(e) => setNewTask({...newTask, timeSensitive: e.target.checked})}
                className="rounded bg-gray-700 text-white"
              />
              <span>Timed</span>
            </label>
            <select
              value={newTask.interest}
              onChange={(e) => setNewTask({...newTask, interest: e.target.value})}
              className="p-1 rounded bg-gray-700 text-white text-sm"
            >
              <option value="high">High Interest</option>
              <option value="low">Low Interest</option>
            </select>
          </div>
          <div className="relative" ref={locationInputRef}>
            <input
              type="text"
              placeholder="Location"
              value={newTask.location}
              onChange={handleLocationChange}
              onFocus={() => setShowLocationDropdown(true)}
              className="p-2 rounded bg-gray-700 text-white w-full"
            />
            {showLocationDropdown && (
              <ul className="absolute z-10 w-full bg-gray-700 rounded mt-1 max-h-40 overflow-y-auto">
                {locations.filter(loc => loc.toLowerCase().includes(newTask.location.toLowerCase())).map((loc, index) => (
                  <li 
                    key={index} 
                    onClick={() => selectLocation(loc)}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                  >
                    {loc}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        {newTask.type === 'Hunts' && (
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasEphemera"
                checked={newTask.huntDetails.hasEphemera}
                onChange={(e) => setNewTask({...newTask, huntDetails: {...newTask.huntDetails, hasEphemera: e.target.checked}})}
                className="rounded bg-gray-700 text-white"
              />
              <label htmlFor="hasEphemera" className="text-sm font-medium">
                Has Ephemera
              </label>
            </div>
            <input
              type="text"
              placeholder="Weapon type"
              value={newTask.huntDetails.weapon}
              onChange={(e) => setNewTask({...newTask, huntDetails: {...newTask.huntDetails, weapon: e.target.value}})}
              className="p-2 rounded bg-gray-700 text-white w-full md:w-1/3"
            />
            <input
              type="text"
              placeholder="Weapon stats"
              value={newTask.huntDetails.stats}
              onChange={(e) => setNewTask({...newTask, huntDetails: {...newTask.huntDetails, stats: e.target.value}})}
              className="p-2 rounded bg-gray-700 text-white w-full md:w-1/3"
            />
          </div>
        )}
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded flex items-center" onClick={addTask}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Task
        </button>
      </div>
    </div>
  );
};

export default WarframeTaskTracker;
