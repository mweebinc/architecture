import { useState, useEffect, useCallback } from "react";
import { useBasePage } from "./useBasePage";

export const useFormPresenter = (getObjectUseCase, upsertObjectUseCase) => {
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
    object: {},
    change: {},
    advanced: false,
    dirty: false,
    submitting: false,
  });

  const getCollectionName = useCallback(() => {
    return params?.collection || "";
  }, [params]);

  const setStatePartial = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const loadData = useCallback(async () => {
    const { id } = params || {};
    
    if (id && id !== "new") {
      try {
        setStatePartial({ loading: true });
        const collection = getCollectionName();
        const object = await getObjectUseCase.execute(collection, id);
        setStatePartial({
          object,
          loading: false,
        });
      } catch (error) {
        setStatePartial({ loading: false });
        await showError(error);
      }
    } else {
      setStatePartial({ loading: false });
    }
  }, [params, getCollectionName, getObjectUseCase, setStatePartial, showError]);

  const handleFieldChange = useCallback((field, value) => {
    const { object, change } = state;
    const newChange = { ...change, [field]: value };
    const newObject = { ...object, [field]: value };
    
    setStatePartial({
      object: newObject,
      change: newChange,
      dirty: true,
    });
  }, [state, setStatePartial]);

  const validateForm = useCallback(() => {
    const { object } = state;
    const schema = context.schemas?.find(
      (s) => s.collection === getCollectionName()
    );
    
    if (!schema) return { isValid: true, errors: {} };
    
    const errors = {};
    const fields = schema.fields || {};
    
    Object.entries(fields).forEach(([fieldName, fieldConfig]) => {
      const value = object[fieldName];
      
      // Required field validation
      if (fieldConfig.required && (!value || value === "")) {
        errors[fieldName] = `${fieldName} is required`;
      }
      
      // String length validation
      if (fieldConfig.type === "String" && fieldConfig.maxLength && value && value.length > fieldConfig.maxLength) {
        errors[fieldName] = `${fieldName} must be less than ${fieldConfig.maxLength} characters`;
      }
      
      // Number validation
      if (fieldConfig.type === "Number" && value !== undefined && value !== null) {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          errors[fieldName] = `${fieldName} must be a valid number`;
        } else if (fieldConfig.min !== undefined && numValue < fieldConfig.min) {
          errors[fieldName] = `${fieldName} must be at least ${fieldConfig.min}`;
        } else if (fieldConfig.max !== undefined && numValue > fieldConfig.max) {
          errors[fieldName] = `${fieldName} must be at most ${fieldConfig.max}`;
        }
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [state.object, context.schemas, getCollectionName]);

  const handleSubmit = useCallback(async () => {
    const { object, submitting } = state;
    
    if (submitting) return;
    
    const validation = validateForm();
    if (!validation.isValid) {
      showToast("Please fix validation errors", "error");
      return;
    }
    
    setStatePartial({ submitting: true });
    
    try {
      const result = await upsertObjectUseCase.execute(getCollectionName(), object);
      showToast("Data saved successfully", "success");
      setStatePartial({ dirty: false, submitting: false });
      
      // Navigate back to list or to the new item
      const { id } = params || {};
      if (id === "new") {
        navigate(`/collections/${getCollectionName()}/form/${result.id}`);
      }
    } catch (error) {
      setStatePartial({ submitting: false });
      await showError(error);
    }
  }, [state, validateForm, upsertObjectUseCase, getCollectionName, setStatePartial, showToast, params, navigate, showError]);

  const handleCancel = useCallback(async () => {
    const { dirty } = state;
    
    if (dirty) {
      const confirmed = await showConfirmDialog(
        "You have unsaved changes. Are you sure you want to leave?",
        "Unsaved Changes",
        "Leave",
        "Stay"
      );
      
      if (confirmed) {
        navigate(`/collections/${getCollectionName()}`);
      }
    } else {
      navigate(`/collections/${getCollectionName()}`);
    }
  }, [state.dirty, showConfirmDialog, navigate, getCollectionName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const { id } = params || {};
    if (id) {
      loadData();
    }
  }, [params.id, loadData]);

  return {
    state,
    setStatePartial,
    getCollectionName,
    loadData,
    handleFieldChange,
    validateForm,
    handleSubmit,
    handleCancel,
  };
};
