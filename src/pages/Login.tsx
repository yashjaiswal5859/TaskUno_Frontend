import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { login, reset } from '../features/auth/authSlice';
import { LoginRequest } from '../types';
import organizationService, { Organization } from '../features/organization/organizationService';

const Login: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState<boolean>(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const { user, isLoading, isError, isSuccess, message } = useAppSelector(
    (state) => state.auth
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoadingOrgs(true);
      const orgs = await organizationService.getAllOrganizations();
      if (orgs) {
        setOrganizations(orgs);
      }
      setIsLoadingOrgs(false);
    };
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (isError) {
      console.error(message);
    }

    // Redirect when logged in
    if (isSuccess || user) {
      navigate('/');
    }

    dispatch(reset());
  }, [isError, isSuccess, user, message, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <form
        onSubmit={handleSubmit((data) => dispatch(login(data)))}
        className="bg-gray-800 border border-gray-700 shadow-lg rounded-lg px-10 py-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-center text-purple-400 mb-6">Sign In</h2>
        <div className="mb-5">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="email"
          >
            Email Address
          </label>
          <input
            className={`border-2 rounded-md w-full py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition ${
              errors.email ? 'border-red-400' : 'border-gray-600'
            }`}
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register('email', { required: true })}
          />
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">Email is required.</p>
          )}
        </div>
        <div className="mb-5">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className={`border-2 rounded-md w-full py-2 px-3 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition ${
              errors.password ? 'border-red-400' : 'border-gray-600'
            }`}
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register('password', { required: true })}
          />
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">Password is required.</p>
          )}
        </div>
        <div className="mb-5">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="organization_id"
          >
            Organization
          </label>
          <select
            className={`border-2 rounded-md w-full py-2 px-3 bg-gray-700 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition ${
              errors.organization_id ? 'border-red-400' : 'border-gray-600'
            }`}
            id="organization_id"
            {...register('organization_id', { 
              required: 'Organization is required',
              valueAsNumber: true,
              validate: (value) => value > 0 || 'Please select an organization'
            })}
          >
            <option value="0">Select an organization</option>
            {isLoadingOrgs ? (
              <option value="0">Loading organizations...</option>
            ) : (
              organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))
            )}
          </select>
          {errors.organization_id && (
            <p className="text-xs text-red-400 mt-1">Organization is required.</p>
          )}
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-300 text-sm font-semibold mb-2"
            htmlFor="role"
          >
            Role
          </label>
          <select
            className={`border-2 rounded-md w-full py-2 px-3 bg-gray-700 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition ${
              errors.role ? 'border-red-400' : 'border-gray-600'
            }`}
            id="role"
            {...register('role', { 
              required: 'Role is required'
            })}
          >
            <option value="">Select a role</option>
            <option value="Product Owner">Product Owner</option>
            <option value="Developer">Developer</option>
          </select>
          {errors.role && (
            <p className="text-xs text-red-400 mt-1">{errors.role.message || 'Role is required.'}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-md transition"
          disabled={isLoading || isLoadingOrgs}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        {isError && (
          <div className="mt-4 text-center text-red-400 text-sm">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;
