import React, { useEffect, useCallback } from 'react';
import { useBaseFormPage } from '../../hooks/useBaseFormPage';
import { useBaseFormLogic } from '../../hooks/useBaseFormLogic';
import { getObjectUseCase, upsertObjectUseCase } from '../../usecases/object';
import Navbar from '../../components/Navbar';

function CollectionFormPage(props) {
  const page = useBaseFormPage();
  const logic = useBaseFormLogic(page, getObjectUseCase, upsertObjectUseCase);

  const [localState, setLocalState] = React.useState({
    collection: '',
    schema: null,
    isEdit: false
  });

  const loadFormData = useCallback(async () => {
    try {
      page.showLoading();
      const collection = props.params.collection;
      const id = props.params.id;
      const isEdit = !!id;

      setLocalState(prev => ({ ...prev, collection, isEdit, id }));

      // Get schema for this collection
      const schema = page.getSchema(collection);
      setLocalState(prev => ({ ...prev, schema }));

      if (isEdit) {
        // Load existing object for editing
        const object = await logic.loadObject(collection, id);
        page.setObject(object);
      } else {
        // Create new object
        const newObject = generateNewObject();
        page.setObject(newObject);
      }

    } catch (error) {
      page.showError(`Failed to load form data: ${error.message}`);
    } finally {
      page.hideLoading();
    }
  }, [page, logic, props.params.collection, props.params.id]);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  useEffect(() => {
    if (
      props.params.collection !== localState.collection ||
      props.params.id !== localState.id
    ) {
      loadFormData();
    }
  }, [props.params.collection, props.params.id, localState.collection, localState.id, loadFormData]);

  const generateNewObject = () => {
    return {
      name: '',
      description: '',
      status: 'active',
      email: '',
      phone: ''
    };
  };

  // Override the onSubmit method from useBaseFormPage
  const handleSubmit = async () => {
    try {
      const object = page.getObject();
      const change = page.getChange();
      const { collection, schema } = localState;

      // Combine object with changes
      const finalObject = { ...object, ...change };

      // Validate object
      const errors = logic.validateObject(finalObject, schema);
      if (Object.keys(errors).length > 0) {
        const errorMessages = Object.values(errors).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      // Save object via API
      const result = await logic.saveObject(collection, finalObject);
      return result;
    } catch (error) {
      throw new Error(`Failed to save object: ${error.message}`);
    }
  };

  const renderField = (fieldName, fieldConfig) => {
    const object = page.getObject();
    const change = page.getChange();
    const value = change[fieldName] !== undefined ? change[fieldName] : (object[fieldName] || '');

    const handleChange = (e) => {
      page.handleFieldChange(fieldName, e.target.value);
    };

    const fieldType = fieldConfig?.type || 'String';
    const isRequired = fieldConfig?.required || false;

    switch (fieldType) {
      case 'String':
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              required={isRequired}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${fieldName}`}
            />
          </div>
        );

      case 'Number':
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={handleChange}
              required={isRequired}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${fieldName}`}
            />
          </div>
        );

      case 'Boolean':
        return (
          <div key={fieldName} className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => page.handleFieldChange(fieldName, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            </label>
          </div>
        );

      case 'Date':
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={handleChange}
              required={isRequired}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      default:
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              required={isRequired}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={`Enter ${fieldName}`}
            />
          </div>
        );
    }
  };

  const renderSchemaFields = () => {
    const { schema } = localState;
    
    if (!schema || !schema.fields) {
      // Fallback to basic fields
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={page.getChange().name || page.getObject().name || ''}
              onChange={(e) => page.handleFieldChange('name', e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={page.getChange().description || page.getObject().description || ''}
              onChange={(e) => page.handleFieldChange('description', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter description"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={page.getChange().status || page.getObject().status || 'active'}
              onChange={(e) => page.handleFieldChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={page.getChange().email || page.getObject().email || ''}
              onChange={(e) => page.handleFieldChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email"
            />
          </div>
        </div>
      );
    }

    const fieldNames = Object.keys(schema.fields);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fieldNames.map(fieldName => 
          renderField(fieldName, schema.fields[fieldName])
        )}
      </div>
    );
  };

  const { collection, isEdit } = localState;
  const object = page.getObject();

  return (
    <div className="min-h-screen bg-gray-50">
      {page.renderLoading()}
      
      <Navbar title={`${isEdit ? 'Edit' : 'Create'} ${collection}`} />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit' : 'Create'} {collection}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update the object details' : 'Create a new object'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => page.setAdvanced(!page.getAdvanced())}
              className={`px-3 py-2 rounded text-sm ${
                page.getAdvanced() 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Basic Fields */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              {renderSchemaFields()}
            </div>

            {/* Advanced Fields */}
            {page.getAdvanced() && (
              <div className="mb-6 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID
                    </label>
                    <input
                      type="text"
                      value={object.id || ''}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created At
                    </label>
                    <input
                      type="text"
                      value={object.createdAt ? new Date(object.createdAt).toLocaleString() : ''}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Updated At
                    </label>
                    <input
                      type="text"
                      value={object.updatedAt ? new Date(object.updatedAt).toLocaleString() : ''}
                      readOnly
                      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => page.onCancel()}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!page.isDirty() || page.isInlineLoading('submit')}
                className={`px-4 py-2 rounded ${
                  page.isDirty() && !page.isInlineLoading('submit')
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {page.isInlineLoading('submit') ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  isEdit ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CollectionFormPage;
