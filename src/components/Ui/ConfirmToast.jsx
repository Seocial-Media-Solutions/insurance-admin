import toast from "react-hot-toast";

export const confirmToast = (message, onConfirm) => {
  toast((t) => (
    <div className="p-2">
      <p className="text-sm mb-2">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            toast.dismiss(t.id);

            // Show loading toast
            const loadingToast = toast.loading("Processing...");

            try {
              await onConfirm();
              toast.dismiss(loadingToast);
              // Success toast will be shown by the calling function
            } catch (err) {
              toast.dismiss(loadingToast);

              // Extract error message
              const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Operation failed. Please try again.";

              toast.error(errorMessage, {
                duration: 4000,
              });

              console.error("ConfirmToast error:", err);
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition"
        >
          Confirm
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-xs transition"
        >
          Cancel
        </button>
      </div>
    </div>
  ));
};
