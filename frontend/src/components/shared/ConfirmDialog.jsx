import PropTypes from "prop-types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

export default function ConfirmDialog({
  open,
  title = "Confirm action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
  loading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-slate-500">{description}</p>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onClose(false)}>
            {cancelLabel}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmLabel}
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
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
