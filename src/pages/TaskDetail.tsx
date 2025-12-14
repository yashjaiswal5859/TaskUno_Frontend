import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getProjects } from '../features/projects/projectSlice';
import {
  updateTask,
  getTask,
  deleteTask,
  resetVariables,
} from '../features/tasks/taskSlice';
import { TaskUpdate, OrganizationMember } from '../types';
import organizationService from '../features/organization/organizationService';
import SearchableDropdown from '../components/SearchableDropdown';
import { getRole } from '../utils/storage';

const TaskDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const params = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string>('');
  // Get role directly from local storage to ensure accuracy
  const userRole = getRole();
  const canManageTasks = userRole === 'Product Owner' || userRole === 'admin';
  
  // Debug: Log role and canManageTasks status
  React.useEffect(() => {
    console.log('TaskDetail - User Role:', userRole, 'Can Manage Tasks:', canManageTasks);
  }, [userRole, canManageTasks]);
  const [developers, setDevelopers] = useState<OrganizationMember[]>([]);
  const [productOwners, setProductOwners] = useState<OrganizationMember[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);

  useEffect(() => {
    if (params.taskId) {
      dispatch(getTask(parseInt(params.taskId)));
    }
  }, [dispatch, params.taskId]);

  const { task, isError, isSuccess, message } = useAppSelector(
    (state) => state.taskData
  );

  useEffect(() => {
    if (isError) {
      // Error handled silently
    }

    if (isSuccess && toastMessage) {
      dispatch(resetVariables());
      navigate('/kanban');
    }
  }, [
    dispatch,
    isError,
    isSuccess,
    navigate,
    message,
    toastMessage,
  ]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskUpdate>({
    defaultValues: {
      title: '',
      description: '',
      assigned_to: undefined,
      reporting_to: undefined,
    },
  });

  const assignedTo = watch('assigned_to');
  const reportingTo = watch('reporting_to');

  const { projects } = useAppSelector((state) => state.projectData);

  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!canManageTasks) {
        setIsLoadingUsers(false);
        return;
      }
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
  }, [canManageTasks]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? (typeof task.dueDate === 'string' ? task.dueDate : dayjs(task.dueDate).format('YYYY-MM-DD')) : '',
        project_id: task.project_id,
        assigned_to: task.assigned_to,
        reporting_to: task.reporting_to,
      });
    }
  }, [task, reset]);

  const deleteTaskUtil = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setToastMessage('Task successfully deleted!');
    if (params.taskId) {
      dispatch(deleteTask(parseInt(params.taskId)));
    }
  };

  const updateTaskUtil = (data: TaskUpdate) => {
    if (!canManageTasks) {
      return;
    }
    setToastMessage('Task successfully updated!');
    if (task) {
      data.id = task.id;
      dispatch(updateTask(data));
    }
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-300">Loading task...</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'To Do': 'bg-blue-900/50 text-blue-300 border-blue-500',
      'In Progress': 'bg-yellow-900/50 text-yellow-300 border-yellow-500',
      'In Review': 'bg-purple-900/50 text-purple-300 border-purple-500',
      'Done': 'bg-green-900/50 text-green-300 border-green-500',
      'Blocked': 'bg-red-900/50 text-red-300 border-red-500',
    };
    return colors[status] || 'bg-gray-700 text-gray-300 border-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8">
      <div className="md:w-3/4 lg:w-1/2 mx-auto px-4">
        <form
          onSubmit={canManageTasks ? handleSubmit((data) => updateTaskUtil(data)) : (e) => e.preventDefault()}
          className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8"
        >
          <p className="text-center text-2xl my-3 text-purple-400 font-bold">TASK DETAIL</p>
      <div className="mb-4">
        <label
          className="block text-gray-300 text-sm font-bold mb-2"
          htmlFor="title"
        >
          Title
        </label>
        {canManageTasks ? (
          <input
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            id="title"
            type="text"
            placeholder="Task Title"
            {...register('title', { required: true })}
          />
        ) : (
          <div className="relative shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-300">
            <span>{task?.title}</span>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
        {errors.title && <p className="text-red-400">Title is required.</p>}
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-300 text-sm font-bold mb-2"
          htmlFor="description"
        >
          Description
        </label>
        {canManageTasks ? (
          <textarea
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            id="description"
            placeholder="Task Description"
            rows={10}
            {...register('description', { required: true })}
          />
        ) : (
          <div className="relative shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-300">
            <div className="pr-8">{task?.description}</div>
            <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
        {errors.description && (
          <p className="text-red-400">Description is required.</p>
        )}
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-300 text-sm font-bold mb-2"
          htmlFor="project_id"
        >
          Project
        </label>
        {canManageTasks ? (
          <select
            {...register('project_id', { required: false, valueAsNumber: true })}
            className="form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-white bg-gray-700 border border-gray-600 rounded transition ease-in-out m-0 focus:text-white focus:bg-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Default select example"
          >
            {projects.map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        ) : (
          <div className="relative form-select appearance-none block w-full px-3 py-1.5 text-base font-normal text-gray-300 bg-gray-700 border border-gray-600 rounded">
            <span className="pr-8">{task?.project?.title || 'No project'}</span>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-bold mb-2">
          Created At
        </label>
        <div className="relative w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300">
          <span className="pr-8">{task?.createdDate ? dayjs(task.createdDate).format('DD/MM/YYYY') : 'N/A'}</span>
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      <div className="mb-4">
        <label
          className="block text-gray-300 text-sm font-bold mb-2"
          htmlFor="dueDate"
        >
          Due Date
        </label>
        {canManageTasks ? (
          <input
            className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            id="dueDate"
            type="date"
            placeholder="Select Due Date"
            {...register('dueDate', { required: true })}
          />
        ) : (
          <div className="relative shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-700 text-gray-300">
            <span className="pr-8">{task?.dueDate ? dayjs(task.dueDate).format('DD/MM/YYYY') : 'No date'}</span>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        )}
        {errors.dueDate && <p className="text-red-400">Due Date is required.</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-300 text-sm font-bold mb-2">
          Status
        </label>
        <div className={`relative w-full px-4 py-2 border rounded-lg ${getStatusColor(task?.status || '')} font-semibold`}>
          <span className="pr-8">{task?.status || 'N/A'}</span>
          <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      </div>

      <div className="mb-4">
        {canManageTasks ? (
          <SearchableDropdown
            options={developers}
            value={assignedTo}
            onChange={(value) => setValue('assigned_to', value, { shouldValidate: true })}
            placeholder="Search and select a developer..."
            label="Assign To"
            disabled={isLoadingUsers}
          />
        ) : (
          <>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Assigned To
            </label>
            <div className="relative w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300">
              <div className="pr-8">
                {task?.assigned_to_user ? (
                  <div>
                    <div className="font-semibold text-white">{task.assigned_to_user.firstName} {task.assigned_to_user.lastName}</div>
                    <div className="text-sm text-gray-400">{task.assigned_to_user.email}</div>
                  </div>
                ) : (
                  'Not assigned'
                )}
              </div>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </>
        )}
      </div>

      <div className="mb-4">
        {canManageTasks ? (
          <SearchableDropdown
            options={productOwners}
            value={reportingTo}
            onChange={(value) => setValue('reporting_to', value, { shouldValidate: true })}
            placeholder="Search and select a product owner..."
            label="Reporting To"
            disabled={isLoadingUsers}
          />
        ) : (
          <>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Reporting To
            </label>
            <div className="relative w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-300">
              <div className="pr-8">
                {task?.reporting_to_user ? (
                  <div>
                    <div className="font-semibold text-white">{task.reporting_to_user.firstName} {task.reporting_to_user.lastName}</div>
                    <div className="text-sm text-gray-400">{task.reporting_to_user.email}</div>
                  </div>
                ) : (
                  'Not assigned'
                )}
              </div>
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </>
        )}
      </div>

      {canManageTasks && (
        <div className="flex gap-4">
          <input
            className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer transition-colors"
            type="submit"
            value="Update Task"
          />
          <button
            onClick={(e) => deleteTaskUtil(e)}
            className="shadow bg-red-500 hover:bg-red-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Delete Task
          </button>
        </div>
      )}
      {!canManageTasks && (
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
          <p className="text-yellow-300 text-sm">
            <span className="font-semibold">Note:</span> Only Product Owners can update or delete tasks.
          </p>
        </div>
      )}
    </form>
    </div>
    </div>
  );
};

export default TaskDetail;

