import { useState, useEffect, useCallback, useRef } from "react";
import { useBasePage } from "./useBasePage";

export const useListPresenter = (findObjectsUseCase, countObjectsUseCase, deleteObjectUseCase) => {
  const {
    navigate,
    params,
    context,
    showConfirmDialog,
    showError,
    showToast,
  } = useBasePage();

  const [state, setState] = useState({
    loading: true,
    objects: [],
    selected: [],
    count: 0,
    current: 1,
    limit: 20,
    search: "",
    filters: {},
    sort: { created: -1 },
  });

  const searchTimeoutRef = useRef(null);

  const getCollectionName = useCallback(() => {
    return params?.collection || "";
  }, [params]);

  const setStatePartial = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const buildWhere = useCallback(() => {
    const { search, filters } = state;
    if (!search?.trim()) return { ...filters };
    
    const schema = context.schemas?.find(
      (s) => s.collection === getCollectionName()
    );
    
    const fields = Object.entries(schema?.fields || {})
      .filter(([, p]) => p.type === "String")
      .map(([f]) => ({ [f]: { $regex: search, $options: "i" } }));
    
    return { $or: fields, ...filters };
  }, [state.search, state.filters, context.schemas, getCollectionName]);

  const loadData = useCallback(async () => {
    try {
      setStatePartial({ loading: true });
      const collection = getCollectionName();
      const { current, limit, sort } = state;
      const where = buildWhere();
      
      const objects = await findObjectsUseCase.execute(collection, {
        where,
        limit,
        skip: (current - 1) * limit,
        sort,
      });
      
      const count = await countObjectsUseCase.execute(collection, where);
      
      setStatePartial({
        objects: [...state.objects, ...objects],
        count,
        loading: false,
      });
    } catch (error) {
      setStatePartial({ loading: false });
      await showError(error);
    }
  }, [state, getCollectionName, buildWhere, findObjectsUseCase, countObjectsUseCase, setStatePartial, showError]);

  const loadMore = useCallback(async () => {
    if (!state.loading) {
      setStatePartial({ current: state.current + 1 });
      await loadData();
    }
  }, [state.loading, state.current, setStatePartial, loadData]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      current: 1,
      objects: [],
      selected: [],
    }));
  }, []);

  const handleSearchChange = useCallback((value) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setStatePartial({ search: value });
    searchTimeoutRef.current = setTimeout(() => {
      reset();
      loadData();
    }, 500);
  }, [setStatePartial, reset, loadData]);

  const handleDelete = useCallback(async (id) => {
    try {
      const confirmed = await showConfirmDialog(
        "Are you sure you want to delete this item?",
        "Confirm Delete",
        "Delete",
        "Cancel",
        "danger"
      );
      
      if (confirmed) {
        await deleteObjectUseCase.execute(getCollectionName(), id);
        showToast("Item deleted successfully", "success");
        reset();
        await loadData();
      }
    } catch (error) {
      await showError(error);
    }
  }, [showConfirmDialog, deleteObjectUseCase, getCollectionName, showToast, reset, loadData, showError]);

  const handleBulkDelete = useCallback(async () => {
    const { selected } = state;
    if (selected.length === 0) {
      showToast("No items selected", "warning");
      return;
    }

    try {
      const confirmed = await showConfirmDialog(
        `Are you sure you want to delete ${selected.length} selected items?`,
        "Confirm Bulk Delete",
        "Delete All",
        "Cancel",
        "danger"
      );
      
      if (confirmed) {
        for (const id of selected) {
          await deleteObjectUseCase.execute(getCollectionName(), id);
        }
        showToast(`${selected.length} items deleted successfully`, "success");
        reset();
        await loadData();
      }
    } catch (error) {
      await showError(error);
    }
  }, [state.selected, showConfirmDialog, deleteObjectUseCase, getCollectionName, showToast, reset, loadData, showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const { collection } = params;
    if (collection) {
      reset();
      loadData();
    }
  }, [params.collection, reset, loadData]);

  return {
    state,
    setStatePartial,
    getCollectionName,
    loadData,
    loadMore,
    reset,
    handleSearchChange,
    handleDelete,
    handleBulkDelete,
  };
};
