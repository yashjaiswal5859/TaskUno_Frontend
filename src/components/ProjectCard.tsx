import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import { useCanManageTasks } from '../utils/roleCheck';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const canManageTasks = useCanManageTasks();

  return (
    <div className="bg-gray-800 border border-gray-700 shadow-md rounded-lg p-5 flex flex-col items-start hover:shadow-xl hover:border-gray-600 transition-shadow duration-200">
      <h2 className="text-2xl font-bold text-blue-400 mb-2">{project.title}</h2>
      <p className="text-gray-300 mb-4">{project.description || 'No description provided.'}</p>
      {project.created_by && (
        <div className="mb-3">
          <span className="text-xs text-gray-400">Created by:</span>
          <p className="text-sm text-gray-300">{project.created_by.email}</p>
        </div>
      )}
      <div className="flex items-center w-full justify-between">
        <span className="text-sm text-gray-400">ID: {project.id}</span>
        {canManageTasks && (
          <Link
            to={`/project/${project.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-150 text-sm font-medium"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;

