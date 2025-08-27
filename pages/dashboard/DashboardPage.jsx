import React from 'react';
import BasePage from '../../base/BasePage';
import Navbar from '../../components/Navbar';

class DashboardPage extends BasePage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      stats: {
        totalCollections: 0,
        totalObjects: 0,
        recentActivity: []
      }
    };
  }

  componentDidMount() {
    this.loadDashboardData();
  }

  async loadDashboardData() {
    try {
      this.showLoading();
      const schemas = this.getSchemas();
      
      // Calculate stats from schemas
      const stats = {
        totalCollections: schemas ? schemas.length : 4, // Fallback to 4 for demo
        totalObjects: 0, // This would be calculated from actual data
        recentActivity: []
      };

      this.setState({ stats });
    } catch {
      this.showError('Failed to load dashboard data');
    } finally {
      this.hideLoading();
    }
  }

  render() {
    const { stats } = this.state;
    const schemas = this.getSchemas() || [
      { collection: 'users' },
      { collection: 'products' },
      { collection: 'orders' },
      { collection: 'categories' }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        {this.renderError()}
        {this.renderLoading()}
        
        <Navbar title="Dashboard" />
        
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Collections</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalCollections}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Objects</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalObjects}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <span className="text-2xl">⚡</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-semibold text-gray-900">Online</p>
                </div>
              </div>
            </div>
          </div>

          {/* Collections Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Collections</h2>
              <p className="text-sm text-gray-600">Manage your data collections</p>
            </div>
            
            <div className="p-6">
              {schemas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     {schemas.map((schema) => {
                     const collectionName = schema?.collection || schema?.name || 'Unknown';
                     return (
                       <div
                         key={collectionName}
                         className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                         onClick={() => this.navigate(`/collections/${collectionName}`)}
                       >
                         <div className="flex items-center justify-between mb-2">
                           <h3 className="font-medium text-gray-900">{collectionName}</h3>
                           <span className="text-gray-400">📋</span>
                         </div>
                         <p className="text-sm text-gray-600">
                           {schema.fields ? Object.keys(schema.fields).length : 0} fields
                         </p>
                         <div className="mt-3 flex justify-end">
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               this.navigate(`/collections/${collectionName}/form`);
                             }}
                             className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                           >
                             Create New →
                           </button>
                         </div>
                       </div>
                     );
                   })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Collections</h3>
                  <p className="text-gray-600 mb-4">
                    Collections will appear here when schemas are loaded
                  </p>
                  <button
                    onClick={() => this.loadDashboardData()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => this.loadDashboardData()}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <span className="text-2xl mr-3">🔄</span>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">Refresh Data</h3>
                    <p className="text-sm text-gray-600">Reload schemas and statistics</p>
                  </div>
                </button>

                <button
                  onClick={() => this.navigate('/collections')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <span className="text-2xl mr-3">📊</span>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">View All Collections</h3>
                    <p className="text-sm text-gray-600">Browse all available collections</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DashboardPage;
