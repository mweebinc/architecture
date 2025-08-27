import React from 'react';
import BasePage from '../../base/BasePage';
import Navbar from '../../components/Navbar';

class TestPage extends BasePage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      testMode: 'none' // none, loading, error, toast
    };
  }

  // Test loading state
  testLoading = () => {
    this.setState({ testMode: 'loading' });
    this.showLoading();
    
    // Simulate loading for 3 seconds
    setTimeout(() => {
      this.hideLoading();
      this.setState({ testMode: 'none' });
      this.showSuccess('Loading test completed!');
    }, 3000);
  }

  // Test loading with progress
  testLoadingWithProgress = () => {
    this.setState({ testMode: 'loading' });
    this.showLoading();
    this.setProgress(0);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5; // Random increment between 5-20%
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setTimeout(() => {
          this.hideLoading();
          this.setState({ testMode: 'none' });
          this.showSuccess('Progress loading test completed!');
        }, 500);
      }
      
      this.setProgress(Math.round(progress));
    }, 200); // Update every 200ms
  }

  // Test inline loading
  testInlineLoading = () => {
    this.setState({ testMode: 'loading' });
    this.showInlineLoading('test');
    
    // Simulate inline loading for 2 seconds
    setTimeout(() => {
      this.hideInlineLoading('test');
      this.setState({ testMode: 'none' });
      this.showToast('Inline loading test completed!', 'success');
    }, 2000);
  }

  // Test error state
  testError = () => {
    this.setState({ testMode: 'error' });
    this.showError('This is a test error message', 'Test Error');
  }

  // Test toast notifications
  testToast = (type = 'info') => {
    this.setState({ testMode: 'toast' });
    const messages = {
      success: 'This is a success toast message!',
      error: 'This is an error toast message!',
      warning: 'This is a warning toast message!',
      info: 'This is an info toast message!'
    };
    this.showToast(messages[type], type);
    
    // Reset mode after toast
    setTimeout(() => {
      this.setState({ testMode: 'none' });
    }, 1000);
  }

  // Test confirmation dialog
  testConfirm = async () => {
    this.setState({ testMode: 'confirm' });
    const confirmed = await this.showConfirmDialog(
      'This is a test confirmation dialog. Do you want to proceed?',
      'Test Confirmation',
      'Proceed',
      'Cancel',
      'default'
    );
    
    if (confirmed) {
      this.showSuccess('You confirmed the action!');
    } else {
      this.showToast('You cancelled the action.', 'warning');
    }
    
    this.setState({ testMode: 'none' });
  }

  // Test danger confirmation dialog
  testDangerConfirm = async () => {
    this.setState({ testMode: 'confirm' });
    const confirmed = await this.showConfirmDialog(
      'This action cannot be undone. Are you sure you want to delete this item?',
      'Delete Confirmation',
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (confirmed) {
      this.showSuccess('Item deleted successfully!');
    } else {
      this.showToast('Deletion cancelled.', 'info');
    }
    
    this.setState({ testMode: 'none' });
  }

  // Test BasePage Confirm Dialog
  testBasePageConfirm = async () => {
    const confirmed = await this.showConfirmDialog(
      'Are you sure you want to proceed with this action?',
      'Confirm Action',
      'Proceed',
      'Cancel',
      'default'
    );
    
    if (confirmed) {
      this.showSuccess('Action confirmed via BasePage!');
    } else {
      this.showToast('Action cancelled via BasePage.', 'info');
    }
  };

  // Test BasePage Danger Confirm Dialog
  testBasePageDangerConfirm = async () => {
    const confirmed = await this.showConfirmDialog(
      'This action cannot be undone. Are you sure you want to delete this item?',
      'Delete Confirmation',
      'Delete',
      'Cancel',
      'danger'
    );
    
    if (confirmed) {
      this.showSuccess('Item deleted via BasePage!');
    } else {
      this.showToast('Deletion cancelled via BasePage.', 'info');
    }
  };

  // Test BasePage Warning Confirm Dialog
  testBasePageWarningConfirm = async () => {
    const confirmed = await this.showConfirmDialog(
      'This will override existing data. Continue?',
      'Warning',
      'Proceed',
      'Cancel',
      'warning'
    );
    
    if (confirmed) {
      this.showSuccess('Action proceeded via BasePage!');
    } else {
      this.showToast('Action cancelled via BasePage.', 'info');
    }
  };

  render() {
    const { testMode } = this.state;

    return (
      <div className="min-h-screen bg-gray-50">
        {this.renderError()}
        {this.renderLoading()}
        <Navbar title="Test Page" />
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">BasePage Functionality Test</h1>
              <p className="text-gray-600 mb-6">
                This page demonstrates all the BasePage functionality including loading states, 
                error handling, toast notifications, and confirmation dialogs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Loading Tests */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Loading States</h3>
                  <div className="space-y-2">
                    <button
                      onClick={this.testLoading}
                      disabled={testMode === 'loading'}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Test Full Loading (3s)
                    </button>
                    <button
                      onClick={this.testLoadingWithProgress}
                      disabled={testMode === 'loading'}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
                    >
                      Test Loading with Progress
                    </button>
                    <button
                      onClick={this.testInlineLoading}
                      disabled={testMode === 'loading'}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Test Inline Loading (2s)
                    </button>
                  </div>
                </div>

                {/* Error Tests */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Error Handling</h3>
                  <div className="space-y-2">
                    <button
                      onClick={this.testError}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Test Error Dialog
                    </button>
                    <button
                      onClick={() => this.testToast('error')}
                      className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                    >
                      Test Error Toast
                    </button>
                  </div>
                </div>

                {/* Toast Tests */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Toast Notifications</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => this.testToast('success')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Success Toast
                    </button>
                    <button
                      onClick={() => this.testToast('warning')}
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    >
                      Warning Toast
                    </button>
                    <button
                      onClick={() => this.testToast('info')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Info Toast
                    </button>
                  </div>
                </div>

                {/* Confirmation Tests */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirmation</h3>
                  <div className="space-y-2">
                    <button
                      onClick={this.testConfirm}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                    >
                      Test Confirmation Dialog
                    </button>
                    <button
                      onClick={this.testDangerConfirm}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Test Danger Confirmation
                    </button>
                  </div>
                </div>

                {/* Success Tests */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Success Messages</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => this.showSuccess('This is a test success message!')}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Show Success Message
                    </button>
                  </div>
                </div>

                {/* BasePage Confirm Dialog Tests */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">BasePage Confirm Dialogs</h3>
                  <div className="space-y-2">
                    <button
                      onClick={this.testBasePageConfirm}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      BasePage Confirm
                    </button>
                    <button
                      onClick={this.testBasePageDangerConfirm}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      BasePage Danger Confirm
                    </button>
                    <button
                      onClick={this.testBasePageWarningConfirm}
                      className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    >
                      BasePage Warning Confirm
                    </button>
                  </div>
                </div>

                {/* Navigation Tests */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Navigation</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => this.navigate('/')}
                      className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                      Go to Dashboard
                    </button>
                    <button
                      onClick={() => this.goBack()}
                      className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>

              {/* Inline Loading Demo */}
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Inline Loading Demo</h3>
                <div className="flex items-center space-x-4">
                  <span>Loading state:</span>
                  {this.isInlineLoading('test') ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">Loading...</span>
                    </div>
                  ) : (
                    <span className="text-gray-600">Idle</span>
                  )}
                </div>
              </div>

              {/* Current State Display */}
              <div className="mt-6 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current State</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Loading:</span> {this.state.loading ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Inline Loading:</span> {this.isInlineLoading('test') ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Progress:</span> {this.state.progress > 0 ? `${this.state.progress}%` : 'None'}
                  </div>
                  <div>
                    <span className="font-medium">Has Error:</span> {this.state.error ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <span className="font-medium">Has Toast:</span> {this.state.toast ? 'Yes' : 'No'}
                  </div>
                </div>
                
                {/* Progress Bar Display */}
                {this.state.progress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress: {this.state.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${this.state.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TestPage;
