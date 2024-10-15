import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react';

const WarframeTaskTracker = () => {
  const [tasks, setTasks] = useState(() => {
    const storedTasks = localStorage.getItem('tasks');
    return storedTasks ? JSON.parse(storedTasks) : [
      { id: 1, description: 'Farm Meso N11 Relic for Nyx Prime Part', timeSensitive: false, interest: 'low', location: 'Railjack', type: 'Prime Parts' },
      { id: 2, description: 'Farm Tek Assault for Kavat Mod', timeSensitive: false, interest: 'high', location: 'Deimos', type: 'Mods' },
      { id: 3, description: 'Add Somachord Pop Songs', timeSensitive: false, interest: 'high', location: 'Various', type: 'Items' },
    ];
  });

  const [constantTasks, setConstantTasks] = useState(() => {
    const storedConstantTasks = localStorage.getItem('constantTasks');
    return storedConstantTasks ? JSON.parse(storedConstantTasks) : [
      { id: 'incarnon-weapon', description: 'Incarnon (Weapon)', timeSensitive: true, interest: 'high', location: 'Duviri', type: 'Incarnon Upgrade', editing: false },
      { id: 'incarnon-warframe', description: 'Incarnon (Warframe)', timeSensitive: true, interest: 'high', location: 'Duviri', type: 'Base Frame', editing: false },
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

  // const updateConstantTask = (id, newDescription) => {
  //   setConstantTasks(constantTasks.map(task => 
  //     task.id === id ? { ...task, description: newDescription, editing: false } : task
  //   ));
  // };

  const TaskList = ({ title, filterFn }) => {
    const filteredTasks = tasks.filter(filterFn);
    const sortedTasks = sortTasks(filteredTasks);
    const isTimeSensitive = title === "Time Sensitive Tasks";

    return (
      <div className="task-list w-full md:w-[48%]">
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
              <Edit2 size={16} />
            </button>
          </div>
        ))}
        {sortedTasks.map(task => (
          <div key={task.id} className="task bg-gray-700 p-4 mb-4 rounded-lg flex justify-between items-center">
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
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="warframe-tracker max-w-4xl mx-auto p-6 bg-gray-800 text-gray-200">
      <h1 className="text-3xl font-bold mb-8">Warframe Task Tracker</h1>
      
      <div className="task-lists flex flex-col md:flex-row justify-between gap-8">
        <TaskList title="Time Sensitive Tasks" filterFn={task => task.timeSensitive} />
        <TaskList title="Non-Time Sensitive Tasks" filterFn={task => !task.timeSensitive} />
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
        </div>
        {newTask.type === 'Hunts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input
              type="text"
              placeholder="Weapon type"
              value={newTask.huntDetails.weapon}
              onChange={(e) => setNewTask({...newTask, huntDetails: {...newTask.huntDetails, weapon: e.target.value}})}
              className="p-2 rounded bg-gray-700 text-white"
            />
            <input
              type="text"
              placeholder="Weapon stats"
              value={newTask.huntDetails.stats}
              onChange={(e) => setNewTask({...newTask, huntDetails: {...newTask.huntDetails, stats: e.target.value}})}
              className="p-2 rounded bg-gray-700 text-white"
            />
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