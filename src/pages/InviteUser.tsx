import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import authService from '../features/auth/authService';
import { useCanManageTasks } from '../utils/roleCheck';

interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'Product Owner' | 'Developer';
}

const InviteUser: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteUserRequest>({
    defaultValues: {
      role: 'Developer',
    },
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();
  const canManageTasks = useCanManageTasks();

  // Redirect if not Product Owner
  React.useEffect(() => {
    if (!canManageTasks) {
      navigate('/');
    }
  }, [canManageTasks, navigate]);

  const onSubmit = async (data: InviteUserRequest) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Backend generates username from email automatically
      const result = await authService.inviteUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: data.role,
      });

      if (result) {
        setSuccessMessage(`User ${result.email} has been invited successfully!`);
        // Reset form after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setErrorMessage('Failed to invite user. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Failed to invite user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManageTasks) {
    return null;
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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Invite User</h2>
          
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 bg-green-900/30 border border-green-500 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-gray-300 text-sm font-semibold mb-1"
              >
                Email <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-gray-300 text-sm font-semibold mb-1"
                >
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  {...register('firstName', { required: 'First name is required' })}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-gray-300 text-sm font-semibold mb-1"
                >
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  {...register('lastName', { required: 'Last name is required' })}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-300 text-sm font-semibold mb-1"
              >
                Password <span className="text-red-400">*</span>
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
                id="password"
                type="password"
                placeholder="Password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-gray-300 text-sm font-semibold mb-1"
              >
                Role <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-purple-500"
                id="role"
                {...register('role', { required: 'Role is required' })}
              >
                <option value="Developer">Developer</option>
                <option value="Product Owner">Product Owner</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
              >
                {isSubmitting ? 'Inviting...' : 'Invite User'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default InviteUser;

