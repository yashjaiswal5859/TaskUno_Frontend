import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { register as registerFunc, reset } from '../features/auth/authSlice';
import { RegisterRequest } from '../types';

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    defaultValues: {
      role: 'Product Owner',
    },
  });

  const { user, isError, isSuccess, message } = useAppSelector(
    (state) => state.auth
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      console.error(message);
      dispatch(reset());
    }

    // Redirect when successfully registered
    if (isSuccess && user) {
      // Data is already stored in localStorage by authSlice
      // Navigate to home page
      navigate('/');
      // Reset state after navigation
      dispatch(reset());
    }
  }, [isError, isSuccess, user, message, navigate, dispatch]);

  const onSubmit = (data: RegisterRequest) => {
    // Set default role if not provided
    if (!data.role) {
      data.role = 'Product Owner';
    }
    dispatch(registerFunc(data));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-extrabold text-center text-purple-400 mb-6">Create Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email', { required: true })}
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">Email is required.</p>}
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
              id="password"
              type="password"
              placeholder="Enter Password"
              {...register('password', { required: true })}
            />
            {errors.password && <p className="text-xs text-red-400 mt-1">Password is required.</p>}
          </div>
          <div className="flex space-x-3">
            <div className="w-1/2">
              <label className="block text-gray-300 text-sm font-semibold mb-1" htmlFor="firstName">
                First Name
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
                id="firstName"
                type="text"
                placeholder="First Name"
                {...register('firstName', { required: true })}
              />
              {errors.firstName && <p className="text-xs text-red-400 mt-1">First Name is required.</p>}
            </div>
            <div className="w-1/2">
              <label className="block text-gray-300 text-sm font-semibold mb-1" htmlFor="lastName">
                Last Name
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
                id="lastName"
                type="text"
                placeholder="Last Name"
                {...register('lastName', { required: true })}
              />
              {errors.lastName && <p className="text-xs text-red-400 mt-1">Last Name is required.</p>}
            </div>
          </div>
          
          {/* Organization Field */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1" htmlFor="organization">
              Organization
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
              id="organization"
              type="text"
              placeholder="Enter organization name"
              {...register('organization', { 
                required: 'Organization name is required'
              })}
            />
            {errors.organization && <p className="text-xs text-red-400 mt-1">{errors.organization.message || 'Organization is required.'}</p>}
          </div>

          <button
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition duration-200"
            type="submit"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
