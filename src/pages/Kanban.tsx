import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getTasks, updateTask } from '../features/tasks/taskSlice';
import { Task } from '../types';
import WorkflowChart from '../components/WorkflowChart';
import { useCanManageTasks } from '../utils/roleCheck';
import { getUser, getRole } from '../utils/storage';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ColumnData {
  'To Do': Task[];
  'In Progress': Task[];
  'In Review': Task[];
  'Done': Task[];
  'Blocked': Task[];
}

const Kanban: React.FC = () => {
  const [stateData, updateStateData] = useState<ColumnData>({
    'To Do': [],
    'In Progress': [],
    'In Review': [],
    'Done': [],
    'Blocked': [],
  });
  const [showWorkflow, setShowWorkflow] = useState<boolean>(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState<boolean>(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    taskId: number;
    newStatus: string;
    oldStatus: string;
    taskTitle: string;
  } | null>(null);
  const [statusChangeReason, setStatusChangeReason] = useState<string>('');

  const { tasks, isError, message, isSuccess } = useAppSelector(
    (state) => state.taskData
  );

  const dispatch = useAppDispatch();
  const canManageTasks = useCanManageTasks();
  
  // Get current user ID and role from local storage
  const currentUser = getUser();
  const currentUserRole = getRole();
  const currentUserId = currentUser?.id || null;
  
  // Check if user can change status for a specific task
  const canChangeTaskStatus = (task: Task): boolean => {
    // Product Owners and admins can change any task
    if (currentUserRole === 'Product Owner' || currentUserRole === 'admin') {
      return true;
    }
    // Developers can only change tasks assigned to them
    if (currentUserRole === 'Developer' && currentUserId && task.assigned_to === currentUserId) {
      return true;
    }
    return false;
  };

  // Get available status transitions based on current status
  const getAvailableStatuses = (currentStatus: string): string[] => {
    const statusMap: Record<string, string[]> = {
      'To Do': ['In Progress'],
      'In Progress': ['To Do', 'In Review', 'Blocked'],
      'In Review': ['In Progress', 'Blocked', 'Done'],
      'Blocked': ['In Progress'],
      'Done': ['To Do'],
    };
    
    // Normalize the status - trim and try to match
    const normalizedStatus = (currentStatus || 'To Do').trim();
    
    // Try exact match first
    let transitions = statusMap[normalizedStatus];
    
    // If no exact match, try case-insensitive match
    if (!transitions) {
      const statusKey = Object.keys(statusMap).find(
        key => key.toLowerCase() === normalizedStatus.toLowerCase()
      );
      if (statusKey) {
        transitions = statusMap[statusKey];
      }
    }
    
    // Default to 'To Do' transitions if still not found
    if (!transitions) {
      transitions = statusMap['To Do'];
    }
    
    // Always include current status in the list
    const result = transitions.includes(normalizedStatus) 
      ? transitions 
      : [normalizedStatus, ...transitions];
    
    console.log(`getAvailableStatuses("${currentStatus}") -> normalized: "${normalizedStatus}" -> options: [${result.join(', ')}]`);
    
    return result;
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    // Find the task to get its current status and title
    let currentTask: Task | null = null;
    for (const columnTasks of Object.values(stateData)) {
      const task = columnTasks.find((t: Task) => t.id === taskId);
      if (task) {
        currentTask = task;
        break;
      }
    }
    
    if (!currentTask) {
      console.error(`Task ${taskId} not found`);
      return;
    }
    
    // Check if user can change status for this task
    if (!canChangeTaskStatus(currentTask)) {
      return;
    }
    
    // If status is the same, don't show dialog
    if (currentTask.status === newStatus) {
      return;
    }
    
    // Show dialog to get reason
    setPendingStatusChange({
      taskId,
      newStatus,
      oldStatus: currentTask.status,
      taskTitle: currentTask.title,
    });
    setStatusChangeReason('');
    setShowStatusDialog(true);
  };

  const handleStatusChangeSubmit = async () => {
    if (!pendingStatusChange) return;
    
    setUpdatingTaskId(pendingStatusChange.taskId);
    
    // Store previous state for potential revert
    const previousStateData = JSON.parse(JSON.stringify(stateData));
    
    const payload = {
      id: pendingStatusChange.taskId,
      status: pendingStatusChange.newStatus,
      status_change_reason: statusChangeReason || `Status changed from ${pendingStatusChange.oldStatus} to ${pendingStatusChange.newStatus}`,
    };
    
    // Update local state immediately for optimistic UI update
    const newStateData = { ...stateData };
    let taskToMove: Task | null = null;
    let sourceColumn: keyof ColumnData | null = null;
    
    // Find the task and remove it from current column
    for (const [column, columnTasks] of Object.entries(stateData)) {
      const taskIndex = columnTasks.findIndex((t: Task) => t.id === pendingStatusChange.taskId);
      if (taskIndex !== -1) {
        taskToMove = columnTasks[taskIndex];
        sourceColumn = column as keyof ColumnData;
        newStateData[column as keyof ColumnData] = [...columnTasks];
        newStateData[column as keyof ColumnData].splice(taskIndex, 1);
        break;
      }
    }
    
    // Add task to new column
    if (taskToMove && sourceColumn) {
      const updatedTask = { ...taskToMove, status: pendingStatusChange.newStatus };
      const columnNames: (keyof ColumnData)[] = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];
      
      // Find the correct column name (exact match)
      const matchedColumn = columnNames.find(col => col === pendingStatusChange.newStatus.trim()) || 
                           columnNames.find(col => col.toLowerCase() === pendingStatusChange.newStatus.trim().toLowerCase());
      
      if (matchedColumn && newStateData[matchedColumn]) {
        newStateData[matchedColumn] = [...newStateData[matchedColumn], updatedTask];
        updateStateData(newStateData);
        console.log(`Task ${pendingStatusChange.taskId} moved from "${sourceColumn}" to "${matchedColumn}"`);
      } else {
        console.error(`Could not find column for status: "${pendingStatusChange.newStatus}"`);
        // Revert the change
        if (sourceColumn) {
          newStateData[sourceColumn] = [...newStateData[sourceColumn], taskToMove];
          updateStateData(newStateData);
        }
      }
    }
    
    // Close dialog and reset
    setShowStatusDialog(false);
    setPendingStatusChange(null);
    setStatusChangeReason('');
    
    // Dispatch the update and handle response
    try {
      const result = await dispatch(updateTask(payload)).unwrap();
      // Success - UI already updated optimistically, just sync with backend
      console.log('Task updated successfully:', result);
      // Refetch to ensure sync
      dispatch(getTasks());
      setUpdatingTaskId(null);
    } catch (error: any) {
      // Error - revert UI to previous state
      console.error('Failed to update task:', error);
      updateStateData(previousStateData);
      setUpdatingTaskId(null);
      
      // Extract error message from rejectValue (string) or error object
      let errorMessage = 'Bad response from server';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = String(error || 'Bad response from server');
      }
      
      // Show error toast
      toast.error(`Bad response from server: ${errorMessage}`, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleStatusChangeCancel = () => {
    setShowStatusDialog(false);
    setPendingStatusChange(null);
    setStatusChangeReason('');
  };

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch]);

  // Note: We don't refetch on isSuccess anymore since we handle it in handleStatusChangeSubmit
  // This prevents double updates and ensures optimistic updates work correctly

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showStatusDialog) {
        setShowStatusDialog(false);
        setPendingStatusChange(null);
        setStatusChangeReason('');
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showStatusDialog]);

  useEffect(() => {
    console.log('Kanban: Tasks received:', tasks);
    console.log('Kanban: Tasks length:', tasks?.length);
    
    if (tasks && tasks.length > 0) {
      const columnData: ColumnData = {
        'To Do': [],
        'In Progress': [],
        'In Review': [],
        'Done': [],
        'Blocked': [],
      };
      
      // Normalize status values to match Kanban columns
      const statusMap: Record<string, keyof ColumnData> = {
        'To Do': 'To Do',
        'todo': 'To Do',
        'TO_DO': 'To Do',
        'to_do': 'To Do',
        'In Progress': 'In Progress',
        'in_progress': 'In Progress',
        'IN_PROGRESS': 'In Progress',
        'in progress': 'In Progress',
        'In Review': 'In Review',
        'in_review': 'In Review',
        'IN_REVIEW': 'In Review',
        'in review': 'In Review',
        'Blocked': 'Blocked',
        'blocked': 'Blocked',
        'BLOCKED': 'Blocked',
        'Done': 'Done',
        'done': 'Done',
        'DONE': 'Done',
        'completed': 'Done',
        'Completed': 'Done',
      };
      
      tasks.forEach((item: Task) => {
        if (!item.status) {
          console.warn(`Task ${item.id} has no status, defaulting to "To Do"`);
          columnData['To Do'].push(item);
          return;
        }
        
        const taskStatus = String(item.status).trim();
        console.log(`Task ${item.id} (${item.title}): status="${taskStatus}" (length: ${taskStatus.length})`);
        
        // Define valid column names
        const columnNames: (keyof ColumnData)[] = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];
        
        // First, try exact match with column names (case-sensitive, no extra spaces)
        const exactMatch = columnNames.find((col: keyof ColumnData) => {
          const match = col === taskStatus;
          if (match) {
            console.log(`  → Exact match found: "${col}" === "${taskStatus}"`);
          }
          return match;
        });
        
        if (exactMatch) {
          columnData[exactMatch].push(item);
          console.log(`  ✓ Task ${item.id} added to column: "${exactMatch}"`);
          return;
        }
        
        // If no exact match, try case-insensitive match
        const caseInsensitiveMatch = columnNames.find((col: keyof ColumnData) => {
          const match = col.toLowerCase() === taskStatus.toLowerCase();
          if (match) {
            console.log(`  → Case-insensitive match found: "${col}" === "${taskStatus}"`);
          }
          return match;
        });
        
        if (caseInsensitiveMatch) {
          columnData[caseInsensitiveMatch].push(item);
          console.log(`  ✓ Task ${item.id} added to column (case-insensitive): "${caseInsensitiveMatch}"`);
          return;
        }
        
        // If no exact match, try to normalize using statusMap
        const normalizedStatus = statusMap[taskStatus];
        if (normalizedStatus && columnNames.includes(normalizedStatus)) {
          columnData[normalizedStatus].push(item);
          console.log(`  ✓ Task ${item.id} added to column (normalized): "${normalizedStatus}" (from "${taskStatus}")`);
          return;
        }
        
        // If still no match, default to 'To Do' and log warning
        console.warn(`  ✗ Task ${item.id} has unknown status: "${taskStatus}" (char codes: ${Array.from(taskStatus).map(c => c.charCodeAt(0)).join(',')}), defaulting to "To Do"`);
        columnData['To Do'].push(item);
      });
      
      // Log summary of column assignments
      console.log('Kanban: Column data summary:');
      Object.entries(columnData).forEach(([column, tasks]) => {
        console.log(`  ${column}: ${tasks.length} tasks`);
        if (tasks.length > 0) {
          tasks.forEach((t: Task) => {
            console.log(`    - Task ${t.id}: "${t.title}" (status: "${t.status}")`);
          });
        }
      });
      
      updateStateData(columnData);
    } else if (tasks && tasks.length === 0) {
      // Clear state if no tasks
      updateStateData({
        'To Do': [],
        'In Progress': [],
        'In Review': [],
        'Done': [],
        'Blocked': [],
      });
    }
  }, [tasks]);

  function handleOnDragEnd(result: DropResult) {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId;
    
    // Find the task to check permissions
    let currentTask: Task | null = null;
    for (const columnTasks of Object.values(stateData)) {
      const task = columnTasks.find((t: Task) => t.id === taskId);
      if (task) {
        currentTask = task;
        break;
      }
    }
    
    // Check if user can change status for this task
    if (!currentTask || !canChangeTaskStatus(currentTask)) {
      return;
    }
    
    console.log(`Drag: Moving task ${taskId} from "${result.source.droppableId}" to "${newStatus}"`);
    
    // Show dialog for status change reason
    // Don't update UI yet - wait for user to confirm in dialog
    // The dialog submit will handle the optimistic update
    setPendingStatusChange({
      taskId,
      newStatus,
      oldStatus: currentTask.status,
      taskTitle: currentTask.title,
    });
    setStatusChangeReason('');
    setShowStatusDialog(true);
  }

  // Always show Kanban board, even if there are errors

  const columnColors: Record<string, string> = {
    'To Do': 'from-blue-500 to-blue-600',
    'In Progress': 'from-yellow-500 to-orange-500',
    'In Review': 'from-purple-500 to-purple-600',
    'Done': 'from-green-500 to-green-600',
    'Blocked': 'from-red-500 to-red-600',
  };

  // Define column order explicitly
  const columnOrder: (keyof ColumnData)[] = ['To Do', 'In Progress', 'In Review', 'Done', 'Blocked'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 dark">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Task Board</h1>
          <button
            type="button"
            onClick={() => setShowWorkflow(!showWorkflow)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            {showWorkflow ? 'Hide Workflow' : 'Show Workflow'}
          </button>
        </div>
        
        {showWorkflow && (
          <div className="mb-6">
            <WorkflowChart />
          </div>
        )}

        {/* Status Change Dialog */}
        {showStatusDialog && pendingStatusChange && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={handleStatusChangeCancel}
          >
            <div 
              className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Change Task Status</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-300 mb-2">
                  <span className="font-semibold">Task:</span> {pendingStatusChange.taskTitle}
                </p>
                <p className="text-sm text-gray-300">
                  <span className="font-semibold">Status Change:</span>{' '}
                  <span className="text-purple-400">{pendingStatusChange.oldStatus}</span>
                  {' → '}
                  <span className="text-green-400">{pendingStatusChange.newStatus}</span>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="reason">
                  Reason for Status Change <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="reason"
                  value={statusChangeReason}
                  onChange={(e) => setStatusChangeReason(e.target.value)}
                  placeholder="Enter the reason for changing the status..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none bg-gray-700 text-white placeholder-gray-400"
                  required
                />
                {!statusChangeReason.trim() && (
                  <p className="text-xs text-gray-400 mt-1">Please provide a reason for the status change</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleStatusChangeCancel}
                  className="px-6 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusChangeSubmit}
                  disabled={!statusChangeReason.trim() || updatingTaskId === pendingStatusChange.taskId}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  {updatingTaskId === pendingStatusChange.taskId ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {tasks && tasks.length > 0 ? (
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {columnOrder.map((name) => {
                return (
                  <Droppable key={name} droppableId={name}>
                    {(provided, snapshot) => (
                      <div
                        className={`rounded-xl p-4 min-h-[500px] transition-all ${
                          snapshot.isDraggingOver ? 'bg-gray-700 shadow-2xl scale-105' : 'bg-gray-800/90 shadow-lg border border-gray-700'
                        }`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <h3 className={`text-xl font-bold text-center mb-4 bg-gradient-to-r ${columnColors[name]} text-white p-3 rounded-lg shadow-md`}>
                          {name}
                          <span className="ml-2 text-sm bg-white/20 rounded-full px-2 py-1">
                            {stateData[name as keyof ColumnData].length}
                          </span>
                        </h3>
                        <div className="space-y-3">
                          {stateData[name as keyof ColumnData].map((item, index) => {
                            const canChangeThisTask = canChangeTaskStatus(item);
                            return (
                              <Draggable
                                key={item.id}
                                draggableId={item.id.toString()}
                                index={index}
                                isDragDisabled={!canChangeThisTask}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    className={`rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 bg-gray-700 border-l-4 border-indigo-500 ${
                                      snapshot.isDragging ? 'rotate-2 scale-105' : ''
                                    } ${!canChangeThisTask ? 'cursor-not-allowed opacity-90' : ''}`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...(canChangeThisTask ? provided.dragHandleProps : {})}
                                  >
                                    <div className="p-4">
                                      <Link to={`/task/${item.id}`}>
                                        <h4 className="font-bold text-lg mb-2 text-white hover:text-indigo-400 cursor-pointer transition-colors">
                                          {item.title}
                                        </h4>
                                      </Link>
                                      <p className="text-gray-300 text-sm mb-3 line-clamp-3">
                                        {item.description}
                                      </p>
                                      
                                      {/* Status Dropdown */}
                                      {canChangeThisTask ? (
                                        <div className="mb-3">
                                          <label className="block text-xs font-semibold text-gray-300 mb-1">
                                            Status
                                          </label>
                                          <select
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            disabled={updatingTaskId === item.id}
                                            className="w-full px-2 py-1 text-xs border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-800 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {getAvailableStatuses(item.status).map((status) => (
                                              <option key={status} value={status}>
                                                {status}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      ) : (
                                        <div className="mb-3">
                                          <label className="block text-xs font-semibold text-gray-300 mb-1">
                                            Status
                                          </label>
                                          <div className="w-full px-2 py-1 text-xs border border-gray-600 rounded-md bg-gray-800 text-gray-300">
                                            {item.status}
                                          </div>
                                          <p className="text-xs text-gray-400 mt-1">
                                            {currentUserRole === 'Product Owner' || currentUserRole === 'admin'
                                              ? 'Only Product Owners can change status' 
                                              : 'Only assigned developers can change status'}
                                          </p>
                                        </div>
                                      )}
                                      
                                      <div className="flex items-center">
                                        <div className="flex items-center text-xs text-gray-400">
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                          {item.dueDate ? dayjs(item.dueDate).format('DD/MM/YYYY') : 'No date'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        ) : (
          <div className="text-center py-16">
            <svg className="w-24 h-24 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-2xl font-semibold text-gray-300">No Tasks Available</p>
            <p className="text-gray-400 mt-2">Create your first task to get started!</p>
          </div>
        )}
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default Kanban;

