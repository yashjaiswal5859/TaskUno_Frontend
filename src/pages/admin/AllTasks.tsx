import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { getTasks, deleteTasks } from '../../features/admin/adminSlice';
import Loader from '../../components/Loader';

const AllTasks: React.FC = () => {
  const { tasks, isLoading } = useAppSelector((state) => state.adminData);
  const { profile } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch]);

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/login');
    }
  }, [profile, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  const deleteTaskUtil = () => {
    dispatch(deleteTasks());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-3">
      <div className="mx-auto max-w-screen-xl px-4 py-16 lg:flex lg:items-center">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-5xl text-white">
            Welcome to
            <strong className="font-extrabold text-red-400 sm:block">
              Admin - Tasks
            </strong>
          </h1>
          <button
            onClick={() => deleteTaskUtil()}
            className="inline-flex items-center px-4 py-2 my-4 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      </div>
      <div className="block w-full overflow-x-auto">
        <table className="items-center bg-gray-800 border border-gray-700 w-full border-collapse rounded-lg">
          <thead>
            <tr>
              <th className="px-6 bg-gray-700 text-gray-300 align-middle border border-solid border-gray-600 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                ID
              </th>
              <th className="px-6 bg-gray-700 text-gray-300 align-middle border border-solid border-gray-600 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Title
              </th>
              <th className="px-6 bg-gray-700 text-gray-300 align-middle border border-solid border-gray-600 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Description
              </th>
              <th className="px-6 bg-gray-700 text-gray-300 align-middle border border-solid border-gray-600 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {tasks &&
              tasks.map((item) => {
                return (
                  <tr key={item.id} className="hover:bg-gray-700 transition-colors">
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-left text-gray-300 border-b border-gray-700">
                      {item.id}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-300 border-b border-gray-700">
                      {item.title}
                    </td>
                    <td className="border-t-0 px-6 align-center border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-300 border-b border-gray-700">
                      {item.description}
                    </td>
                    <td className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs whitespace-nowrap p-4 text-gray-300 border-b border-gray-700">
                      <i className="fas fa-arrow-up text-emerald-400 mr-4"></i>
                      {item.status}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllTasks;

