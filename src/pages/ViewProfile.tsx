import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getUserProfile } from '../features/auth/authSlice';
import Loader from '../components/Loader';
import { getUser, getOrganizationId, getOrganizationName } from '../utils/storage';
import organizationService from '../features/organization/organizationService';
import { OrganizationMember } from '../types';

const ViewProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, user, isLoading } = useAppSelector((state) => state.auth);
  const [developers, setDevelopers] = useState<OrganizationMember[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState<boolean>(false);
  const [userFromStorage, setUserFromStorage] = useState(getUser());

  // First, try to get user from local storage
  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUserFromStorage(storedUser);
    }
  }, []);

  // If not in local storage, fetch from server
  useEffect(() => {
    if (!userFromStorage && !profile && !user && !isLoading) {
      dispatch(getUserProfile());
    }
  }, [dispatch, userFromStorage, profile, user, isLoading]);

  // Fetch organization developers to map developer ID
  useEffect(() => {
    const fetchOrganizationData = async () => {
      const orgId = getOrganizationId();
      if (orgId) {
        setIsLoadingOrg(true);
        try {
          const devs = await organizationService.getDevelopers();
          if (devs) {
            setDevelopers(devs);
          }
        } catch (error) {
          console.error('Failed to fetch developers:', error);
        } finally {
          setIsLoadingOrg(false);
        }
      }
    };
    fetchOrganizationData();
  }, []);

  if (isLoading && !userFromStorage) {
    return <Loader />;
  }

  // Priority: local storage > Redux profile > Redux user
  const displayUser = userFromStorage || profile || user?.user;
  const orgId = displayUser?.organization_id || getOrganizationId();
  const orgName = displayUser?.organization_name || getOrganizationName();

  // Find developer in organization list
  const developerInOrg = displayUser?.role === 'Developer' 
    ? developers.find(dev => dev.id === displayUser.id)
    : null;

  if (!displayUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <p className="text-gray-300">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-extrabold text-purple-400 mb-6">My Profile</h1>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-700">
              <div className="w-20 h-20 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                {`${displayUser.firstName?.[0] || ''}${displayUser.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {displayUser.firstName} {displayUser.lastName}
                </h2>
                <p className="text-gray-300">{displayUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Email</label>
                <p className="text-white bg-gray-700 p-3 rounded-lg">{displayUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">First Name</label>
                <p className="text-white bg-gray-700 p-3 rounded-lg">{displayUser.firstName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Last Name</label>
                <p className="text-white bg-gray-700 p-3 rounded-lg">{displayUser.lastName}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-1">Role</label>
                <p className="text-white bg-gray-700 p-3 rounded-lg capitalize">{displayUser.role}</p>
              </div>

              {orgName && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Organization</label>
                  <p className="text-white bg-gray-700 p-3 rounded-lg">{orgName}</p>
                </div>
              )}

              {displayUser.role === 'Developer' && developerInOrg && (
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Developer in Organization</label>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="text-white">✓ Mapped to Organization</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Position: {developers.findIndex(d => d.id === developerInOrg.id) + 1} of {developers.length}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {displayUser.role === 'Developer' && developers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">All Developers in Organization</h3>
                <div className="space-y-2">
                  {developers.map((dev, index) => (
                    <div
                      key={dev.id}
                      className={`p-3 rounded-lg ${
                        dev.id === displayUser.id
                          ? 'bg-purple-900/30 border border-purple-500'
                          : 'bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-white font-medium">
                            {dev.firstName} {dev.lastName}
                            {dev.id === displayUser.id && (
                              <span className="ml-2 text-purple-400 text-sm">(You)</span>
                            )}
                          </p>
                          <p className="text-gray-400 text-sm">{dev.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-300 text-sm">ID: {dev.id}</p>
                          <p className="text-gray-400 text-xs">#{index + 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProfile;

