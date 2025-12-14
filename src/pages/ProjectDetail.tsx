import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import {
  updateProject,
  getProject,
  deleteProject,
  resetVariables,
} from '../features/projects/projectSlice';
import { ProjectUpdate } from '../types';

const ProjectDetail: React.FC = () => {
  const dispatch = useAppDispatch();
  const params = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    if (params.projectId) {
      dispatch(getProject(parseInt(params.projectId)));
    }
  }, [dispatch, params.projectId]);

  const { project, isError, isSuccess, message } = useAppSelector(
    (state) => state.projectData
  );

  useEffect(() => {
    if (isError) {
      // Error handled silently
    }

    if (isSuccess && toastMessage) {
      dispatch(resetVariables());
      navigate('/projects');
    }
  }, [dispatch, isError, isSuccess, navigate, message, toastMessage]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectUpdate>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (project) {
      reset({
        title: project.title,
        description: project.description,
      });
    }
  }, [project, reset]);

  const deleteProjectUtil = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setToastMessage('Project successfully deleted!');
    if (params.projectId) {
      dispatch(deleteProject(parseInt(params.projectId)));
    }
  };

  const updateProjectUtil = (data: ProjectUpdate) => {
    setToastMessage('Project successfully updated!');
    if (project) {
      data.id = project.id;
      dispatch(updateProject(data));
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-gray-300">Loading...</div>
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
            Project Details
          </h2>
          
          <form
            onSubmit={handleSubmit(updateProjectUtil)}
            className="w-full"
          >
            <div className="mb-5">
              <label
                htmlFor="title"
                className="block text-sm font-semibold text-gray-300 mb-2"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Project Title"
                {...register('title', { required: true })}
                className={`appearance-none border ${
                  errors.title ? 'border-red-500' : 'border-gray-600'
                } w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 outline-none`}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">Title is required.</p>
              )}
            </div>
            <div className="mb-5">
              <label
                htmlFor="description"
                className="block text-gray-300 text-sm font-bold mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                placeholder="Project Description"
                rows={6}
                {...register('description', { required: true })}
                className={`appearance-none border ${
                  errors.description ? 'border-red-500' : 'border-gray-600'
                } w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 outline-none resize-none`}
              />
              {errors.description && (
                <p className="text-red-400 text-xs mt-1">
                  Description is required.
                </p>
              )}
            </div>
            <div className="flex justify-between items-center mt-8">
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition"
              >
                Update Project
              </button>
              <button
                type="button"
                onClick={deleteProjectUtil}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition"
              >
                Delete Project
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;

