import { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks/redux';
import organizationService from '../features/organization/organizationService';
import { OrganizationChart } from '../types';
import Loader from '../components/Loader';

const ViewOrganization: React.FC = () => {
  const [chartData, setChartData] = useState<OrganizationChart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrganizationChart = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await organizationService.getOrganizationChart();
        if (data) {
          setChartData(data);
        } else {
          setError('Failed to load organization data');
        }
      } catch (err) {
        setError('An error occurred while loading organization data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrganizationChart();
    }
  }, [user]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !chartData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8 max-w-md">
          <p className="text-red-400 text-center">{error || 'No organization data available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-8">
          {/* Layer 1: Organization Name */}
          <div className="mb-8 pb-6 border-b-2 border-purple-500">
            <h1 className="text-4xl font-extrabold text-purple-400 text-center">
              {chartData.organization_name}
            </h1>
            <p className="text-center text-gray-300 mt-2">Organization ID: {chartData.organization_id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Layer 2: Product Owners */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-blue-400 mb-4 pb-2 border-b border-blue-600">
                Product Owners
              </h2>
              {chartData.product_owners.length === 0 ? (
                <p className="text-gray-400 italic">No Product Owners found</p>
              ) : (
                <div className="space-y-4">
                  {chartData.product_owners.map((po) => (
                    <div
                      key={po.id}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-gray-500 transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                          {`${po.firstName?.[0] || ''}${po.lastName?.[0] || ''}`.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {po.firstName} {po.lastName}
                          </p>
                          <p className="text-sm text-gray-300">{po.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Layer 3: Developers */}
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700/50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-green-400 mb-4 pb-2 border-b border-green-600">
                Developers
              </h2>
              {chartData.developers.length === 0 ? (
                <p className="text-gray-400 italic">No Developers found</p>
              ) : (
                <div className="space-y-4">
                  {chartData.developers.map((dev) => (
                    <div
                      key={dev.id}
                      className="bg-gray-700 border border-gray-600 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-gray-500 transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                          {`${dev.firstName?.[0] || ''}${dev.lastName?.[0] || ''}`.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {dev.firstName} {dev.lastName}
                          </p>
                          <p className="text-sm text-gray-300">{dev.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrganization;

