import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import HomeScreen from '../pages/Home';
import LoginScreen from '../pages/Login';
import RegisterScreen from '../pages/Register';
import AddTaskScreen from '../pages/AddTask';
import AddProjectScreen from '../pages/AddProject';
import ProjectScreen from '../pages/Projects';
import KanbanScreen from '../pages/Kanban';
import SchedulerScreen from '../pages/Scheduler';
import TaskDetailScreen from '../pages/TaskDetail';
import ProjectDetail from '../pages/ProjectDetail';
import TasksAdminPage from '../pages/admin/AllTasks';
import UsersAdminPage from '../pages/admin/AllUsers';
import ViewProfile from '../pages/ViewProfile';
import ViewOrganization from '../pages/ViewOrganization';
import InviteUser from '../pages/InviteUser';
import PrivateRoute from '../components/PrivateRoute';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/scheduler" element={<SchedulerScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/project" element={<PrivateRoute />}>
          <Route path="/project" element={<AddProjectScreen />} />
        </Route>
        <Route path="/projects" element={<PrivateRoute />}>
          <Route path="/projects" element={<ProjectScreen />} />
        </Route>
        <Route path="/task" element={<PrivateRoute />}>
          <Route path="/task" element={<AddTaskScreen />} />
        </Route>
        <Route path="/kanban" element={<PrivateRoute />}>
          <Route path="/kanban" element={<KanbanScreen />} />
        </Route>
        <Route path="/task/:taskId" element={<PrivateRoute />}>
          <Route path="/task/:taskId" element={<TaskDetailScreen />} />
        </Route>
        <Route path="/project/:projectId" element={<PrivateRoute />}>
          <Route path="/project/:projectId" element={<ProjectDetail />} />
        </Route>
        <Route path="/admin/tasks" element={<PrivateRoute />}>
          <Route path="/admin/tasks" element={<TasksAdminPage />} />
        </Route>
        <Route path="/admin/users" element={<PrivateRoute />}>
          <Route path="/admin/users" element={<UsersAdminPage />} />
        </Route>
        <Route path="/profile" element={<PrivateRoute />}>
          <Route path="/profile" element={<ViewProfile />} />
        </Route>
        <Route path="/organization" element={<PrivateRoute />}>
          <Route path="/organization" element={<ViewOrganization />} />
        </Route>
        <Route path="/invite-user" element={<PrivateRoute />}>
          <Route path="/invite-user" element={<InviteUser />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;

