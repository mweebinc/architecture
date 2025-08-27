import { useState, useEffect, useCallback } from "react";
import { useBasePage } from "./useBasePage";

export const useMainPresenter = (getCurrentUserUseCase, signOutUseCase, getSchemasUseCase) => {
  const {
    navigate,
    context,
    showError,
    showConfirmDialog,
  } = useBasePage();

  const [state, setState] = useState({
    loading: true,
  });

  const setStatePartial = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const initialize = useCallback(async () => {
    setStatePartial({ loading: true });
    try {
      const user = await getCurrentUserUseCase.execute();
      if (!user.roles && !user.isMaster) {
        await signOutUseCase.execute();
        navigate("/denied");
        return;
      }
      const schemas = await getSchemasUseCase.execute();
      context.setGlobalState({ schemas, user });
      setStatePartial({ loading: false });
    } catch (error) {
      setStatePartial({ loading: false });
      switch (error.code) {
        case 401:
          navigate("/signin");
          break;
        default:
          showError(error);
      }
    }
  }, [getCurrentUserUseCase, signOutUseCase, getSchemasUseCase, navigate, context, setStatePartial, showError]);

  const onClickSignOut = useCallback(async () => {
    try {
      const confirmed = await showConfirmDialog(
        "Are you sure you want to sign out?",
        "Confirm",
        "SIGN OUT",
        "Cancel"
      );
      
      if (confirmed) {
        await signOutUseCase.execute();
        navigate("/signin");
      }
    } catch (error) {
      showError(error);
    }
  }, [showConfirmDialog, signOutUseCase, navigate, showError]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    state,
    initialize,
    onClickSignOut,
  };
};
