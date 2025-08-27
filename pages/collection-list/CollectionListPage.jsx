import React, { useEffect, useCallback } from "react";
import { useBaseListPage } from "../../hooks/useBaseListPage";
import { useBaseListLogic } from "../../hooks/useBaseListLogic";
import { findObjectUseCase, deleteObjectUseCase, countObjectsUseCase } from "../../usecases/object";
import Navbar from "../../components/Navbar";

function CollectionListPage(props) {
  const page = useBaseListPage();
  const logic = useBaseListLogic(page, findObjectUseCase, countObjectsUseCase, deleteObjectUseCase);

  const [localState, setLocalState] = React.useState({
    collection: "",
    schema: null,
  });

  const loadCollectionData = useCallback(async () => {
    try {
      page.showLoading();
      const collection = props.params?.collection;

      if (!collection) {
        console.warn("No collection parameter found");
        page.hideLoading();
        return;
      }

      setLocalState(prev => ({ ...prev, collection }));

      // Get schema for this collection
      const schema = page.getSchema(collection);
      setLocalState(prev => ({ ...prev, schema }));

      // Load data from API
      const result = await logic.loadData();

      page.setObjects(result.objects);
      page.setTotal(result.total);
      page.setCount(result.count);
    } catch (error) {
      page.showError(`Failed to load collection data: ${error.message}`);
    } finally {
      page.hideLoading();
    }
  }, [page, logic, props.params?.collection]);

  useEffect(() => {
    loadCollectionData();
  }, [loadCollectionData]);

  useEffect(() => {
    const prevCollection = localState.collection;
    const currentCollection = props.params?.collection;
    if (prevCollection !== currentCollection) {
      loadCollectionData();
    }
  }, [props.params?.collection, localState.collection, loadCollectionData]);

  // Override the onDeleteSelected method from useBaseListPage
  const onDeleteSelected = useCallback(async () => {
    try {
      page.showInlineLoading("delete");
      const selectedIds = page.getSelected();

      if (!localState.collection) {
        throw new Error("No collection specified");
      }

      // Delete objects via API
      await logic.deleteSelected();

      // Refresh the list
      await loadCollectionData();
      page.setSelected([]);

      page.showToast(`Deleted ${selectedIds.length} item(s)`, "success");
    } catch (error) {
      page.showError(`Failed to delete items: ${error.message}`);
    } finally {
      page.hideInlineLoading("delete");
    }
  }, [page, logic, localState.collection, loadCollectionData]);

  // Override the onRefresh method from useBaseListPage
  const onRefresh = useCallback(async () => {
    await loadCollectionData();
  }, [loadCollectionData]);

  const renderTableHeaders = () => {
    const { schema } = localState;
    if (!schema || !schema.fields) {
      return (
        <>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
        </>
      );
    }

    const fieldNames = Object.keys(schema.fields);
    return fieldNames.slice(0, 3).map((fieldName) => (
      <th key={fieldName} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {fieldName}
      </th>
    ));
  };

  const renderTableRow = (obj) => {
    const { schema } = localState;
    if (!schema || !schema.fields) {
      return (
        <>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{obj.id}</td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{obj.name}</td>
          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(obj.createdAt).toLocaleDateString()}</td>
        </>
      );
    }

    const fieldNames = Object.keys(schema.fields);
    return fieldNames.slice(0, 3).map((fieldName) => (
      <td key={fieldName} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
        {obj[fieldName] || "-"}
      </td>
    ));
  };

  const { collection, schema } = localState;
  const objects = page.getObjects();

  // Handle case where collection is not loaded yet
  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50">
        {page.renderLoading()}

        <Navbar title="Loading..." />

        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {page.renderLoading()}

      <Navbar title={`${collection} Collection`} />

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">{collection}</h1>
            <p className="text-gray-600">{schema ? `${Object.keys(schema.fields).length} fields` : "Loading schema..."}</p>
          </div>
          <button onClick={() => page.goToCreate()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Create New
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={page.getSearch()} 
                  onChange={(e) => logic.handleSearchChange(e.target.value)} 
                  className="border rounded px-3 py-2 w-64" 
                />
                <button 
                  onClick={() => onRefresh()} 
                  disabled={page.state.loading} 
                  className={`p-2 ${page.state.loading ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:text-gray-800"}`}
                >
                  {page.state.loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div> : "🔄"}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {page.getSelected().length > 0 && (
                  <button 
                    onClick={() => onDeleteSelected()} 
                    disabled={page.isInlineLoading("delete")} 
                    className={`px-3 py-1 rounded text-sm ${page.isInlineLoading("delete") ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"} text-white`}
                  >
                    {page.isInlineLoading("delete") ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </span>
                    ) : (
                      `Delete (${page.getSelected().length})`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input 
                      type="checkbox" 
                      checked={page.getSelected().length === objects.length && objects.length > 0} 
                      onChange={() => (page.getSelected().length === objects.length ? page.deselectAll() : page.selectAll())} 
                      className="rounded border-gray-300" 
                    />
                  </th>
                  {renderTableHeaders()}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {objects.map((obj) => (
                  <tr key={obj.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <input 
                        type="checkbox" 
                        checked={page.isSelected(obj.id)} 
                        onChange={() => page.toggleSelection(obj.id)} 
                        className="rounded border-gray-300" 
                      />
                    </td>
                    {renderTableRow(obj)}
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => page.goToEdit(obj.id)} className="text-blue-600 hover:text-blue-900 mr-3">
                        Edit
                      </button>
                      <button onClick={() => page.goToView(obj.id)} className="text-green-600 hover:text-green-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {objects.length === 0 && !page.state.loading && (
            <div className="p-8 text-center text-gray-500">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first {collection || "item"}</p>
              <button onClick={() => page.goToCreate()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create New {collection || "Item"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollectionListPage;
