import { AlertTriangle, X } from "lucide-react";

function ConfirmModal({
  open,
  title = "Konfirmasi Aksi",
  message = "Apakah Anda yakin ingin melanjutkan aksi ini?",
  confirmText = "Ya, lanjutkan",
  cancelText = "Batal",
  loading = false,
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-modal-backdrop">
      <div className="confirm-modal">
        <button
          type="button"
          className="confirm-modal-close"
          onClick={onCancel}
          disabled={loading}
          aria-label="Tutup modal"
        >
          <X size={18} />
        </button>

        <div className={`confirm-modal-icon ${variant}`}>
          <AlertTriangle size={26} />
        </div>

        <div className="confirm-modal-content">
          <h2>{title}</h2>
          <p>{message}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-cancel-button"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirm-action-button ${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;