import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getUserProfile } from '../features/auth/authSlice';
import Loader from './Loader';
import ProfileDropdown from './ProfileDropdown';
import { useCanManageTasks } from '../utils/roleCheck';
import { getOrganizationName } from '../utils/storage';

const Header = () => {
  const dispatch = useAppDispatch();
  const canManageTasks = useCanManageTasks();
  const organizationName = getOrganizationName();

  const { user, profile, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(getUserProfile());
    }
  }, [dispatch, user]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {user ? (
            <>
              <div className="flex items-center space-x-8">
                {organizationName && (
                  <span className="text-white italic text-lg font-bold tracking-wide opacity-90" style={{ fontFamily: 'cursive' }}>
                    {organizationName}
                  </span>
                )}
                <Link
                  to="/"
                  className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                >
                  Home
                </Link>
                {canManageTasks && (
                  <>
                    <Link
                      to="task"
                      className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                    >
                      Add Task
                    </Link>
                    <Link
                      to="project"
                      className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                    >
                      Add Project
                    </Link>
                    <Link
                      to="invite-user"
                      className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                    >
                      Invite User
                    </Link>
                  </>
                )}
                <Link
                  to="projects"
                  className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                >
                  All Projects
                </Link>
                <Link
                  to="scheduler"
                  className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                >
                  Scheduler
                </Link>
                <Link
                  to="/kanban"
                  className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                >
                  Kanban
                </Link>
                {profile && profile.role === 'admin' && (
                  <Link
                    to="/admin/tasks"
                    className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
                  >
                    Admin
                  </Link>
                )}
              </div>
              <div className="ml-auto">
                <ProfileDropdown />
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-8 ml-auto">
              <Link
                to="login"
                className="text-white hover:text-gray-200 transition-colors duration-200 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="register"
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-2 px-6 rounded-full transition-all duration-200"
              >
                Create an Account
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

