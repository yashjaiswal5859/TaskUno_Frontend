import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createTask, resetVariables } from '../features/tasks/taskSlice';
import { getProjects } from '../features/projects/projectSlice';
import { TaskCreate, OrganizationMember } from '../types';
import { useCanManageTasks } from '../utils/roleCheck';
import organizationService from '../features/organization/organizationService';
import SearchableDropdown from '../components/SearchableDropdown';

const AddTask: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string>('');
  const canManageTasks = useCanManageTasks();
  const [developers, setDevelopers] = useState<OrganizationMember[]>([]);
  const [productOwners, setProductOwners] = useState<OrganizationMember[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  useEffect(() => {
    if (!canManageTasks) {
      navigate('/kanban');
    }
  }, [canManageTasks, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskCreate>();

  const assignedTo = watch('assigned_to');
  const reportingTo = watch('reporting_to');

  const { isError, isSuccess, message } = useAppSelector(
    (state) => state.taskData
  );

  const { projects } = useAppSelector((state) => state.projectData);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const [devs, pos] = await Promise.all([
          organizationService.getDevelopers(),
          organizationService.getProductOwners(),
        ]);
        if (devs) setDevelopers(devs);
        if (pos) setProductOwners(pos);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isError) {
      dispatch(resetVariables());
    }

    if (isSuccess && toastMessage) {
      dispatch(resetVariables());
      navigate('/kanban');
    }
  }, [dispatch, isError, isSuccess, message, navigate, toastMessage]);

  const createTaskUtil = (data: TaskCreate) => {
    if (!canManageTasks) {
      return;
    }
    // Set default status to "To Do"
    const taskData: TaskCreate = {
      ...data,
      status: 'To Do',
    };
    dispatch(createTask(taskData));
    setToastMessage('Task created successfully!');
  };

  if (!canManageTasks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-4">Only Product Owners can create tasks.</p>
          <button
            onClick={() => navigate('/kanban')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go to Kanban
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center text-indigo-400 mb-8">Add New Task</h1>
          
          <form onSubmit={handleSubmit((data) => createTaskUtil(data))} className="space-y-6">
            <div>
              <label
                className="block text-sm font-semibold text-gray-300 mb-2"
                htmlFor="title"
              >
                Title
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200 outline-none"
                id="title"
                type="text"
                placeholder="Enter task title"
                {...register('title', { required: true })}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">Title is required.</p>}
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-gray-300 mb-2"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200 outline-none resize-none"
                id="description"
                placeholder="Describe the task"
                rows={6}
                {...register('description', { required: true })}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">Description is required.</p>}
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-gray-300 mb-2"
                htmlFor="project"
              >
                Project
              </label>
              <select
                {...register('project_id', { required: true, valueAsNumber: true })}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200 outline-none cursor-pointer"
                aria-label="Select project"
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>

            <SearchableDropdown
              options={developers}
              value={assignedTo}
              onChange={(value) => setValue('assigned_to', value)}
              placeholder="Type to search developers..."
              label="Assign To (Developer)"
              disabled={isLoadingUsers}
            />

            <SearchableDropdown
              options={productOwners}
              value={reportingTo}
              onChange={(value) => setValue('reporting_to', value)}
              placeholder="Type to search product owners..."
              label="Reporting To (Product Owner)"
              disabled={isLoadingUsers}
            />

            <div>
              <label
                className="block text-sm font-semibold text-gray-300 mb-2"
                htmlFor="dueDate"
              >
                Due Date
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition duration-200 outline-none"
                id="dueDate"
                type="date"
                {...register('dueDate', { required: true })}
              />
              {errors.dueDate && <p className="text-red-400 text-sm mt-1">Due Date is required.</p>}
            </div>

            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200"
              type="submit"
            >
              Add Task
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTask;

