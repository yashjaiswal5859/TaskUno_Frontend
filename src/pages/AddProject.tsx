import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createProject, resetVariables } from '../features/projects/projectSlice';
import { ProjectCreate } from '../types';
import { useCanManageTasks } from '../utils/roleCheck';

const AddProject: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string>('');
  const canManageTasks = useCanManageTasks();

  useEffect(() => {
    if (!canManageTasks) {
      navigate('/projects');
    }
  }, [canManageTasks, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectCreate>();

  const { isError, isSuccess, message } = useAppSelector(
    (state) => state.projectData
  );

  useEffect(() => {
    if (isError) {
      dispatch(resetVariables());
    }

    if (isSuccess && toastMessage) {
      dispatch(resetVariables());
      navigate('/projects');
    }
  }, [dispatch, isError, isSuccess, message, navigate, toastMessage]);

  const createProjectUtil = (data: ProjectCreate) => {
    if (!canManageTasks) {
      return;
    }
    dispatch(createProject(data));
    setToastMessage('Project created successfully!');
  };

  if (!canManageTasks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-4">Only Product Owners can create projects.</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Go to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4"
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Create New Project
          </h2>
          
          <form onSubmit={handleSubmit((data) => createProjectUtil(data))} className="space-y-6">
            <div>
              <label
                className="block text-sm font-semibold text-gray-300 mb-2"
                htmlFor="title"
              >
                Project Title
              </label>
              <input
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 outline-none"
                id="title"
                type="text"
                placeholder="Enter project title"
                {...register('title', { required: true })}
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">Title is required.</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-semibold text-gray-300 mb-2"
                htmlFor="description"
              >
                Project Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 outline-none resize-none"
                id="description"
                placeholder="Describe your project"
                rows={8}
                {...register('description', { required: true })}
              />
              {errors.description && (
                <p className="text-red-400 text-sm mt-1">Description is required.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Create Project
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default AddProject;

