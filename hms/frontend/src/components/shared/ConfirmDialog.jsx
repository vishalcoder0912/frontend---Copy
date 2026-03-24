import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

/**
 * Confirmation dialog component.
 */
export default function ConfirmDialog({
  open,
  title = "Confirm action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  confirmText,
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  onOpenChange,
  loading = false,
}) {
  const handleClose = onClose || onOpenChange || (() => {});
  const primaryLabel = confirmText || confirmLabel;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-slate-500">{description}</p>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => handleClose(false)}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : primaryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  confirmText: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  onOpenChange: PropTypes.func,
  loading: PropTypes.bool,
};
