import { useContext } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import AppContext from "../AppContext";
import portal from "../portal";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";

export const useBasePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const context = useContext(AppContext);

  const showConfirmDialog = (message, title = "Confirm", confirmText = "OK", cancelText = "Cancel", type = "default") => {
    return new Promise((resolve) => {
      const { close } = portal.open(
        <ConfirmDialog
          isOpen={true}
          title={title}
          message={message}
          confirmText={confirmText}
          cancelText={cancelText}
          type={type}
          onConfirm={() => {
            close();
            resolve(true);
          }}
          onCancel={() => {
            close();
            resolve(false);
          }}
        />
      );
    });
  };

  const showError = (error, title = "Error") => {
    return showConfirmDialog(
      typeof error === "string" ? error : error.message || "An error occurred",
      title,
      "OK",
      null,
      "danger"
    );
  };

  const showToast = (message, type = "info") => {
    portal.open(<Toast message={message} type={type} onClose={() => {}} />);
  };

  return {
    navigate,
    location,
    params,
    searchParams,
    setSearchParams,
    context,
    showConfirmDialog,
    showError,
    showToast,
  };
};
