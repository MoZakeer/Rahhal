import * as AlertDialog from "@radix-ui/react-alert-dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  subTitle: string;
  isPending?: boolean;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({
  open,
  title,
  subTitle,
  isPending = false,
  confirmText = "Leave",
  cancelText = "Cancel",
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />

        <AlertDialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
            w-[90%] max-w-md
            -translate-x-1/2 -translate-y-1/2
            rounded-2xl bg-gray-0 p-6 shadow-xl
            space-y-4
          "
        >
          <div className="space-y-2">
            <AlertDialog.Title className="text-lg font-semibold text-gray-800">
              {title}
            </AlertDialog.Title>

            <AlertDialog.Description className="text-sm text-gray-500">
              {subTitle}
            </AlertDialog.Description>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="
                px-4 py-2 rounded-lg border
                border-gray-300 text-sm
                hover:bg-gray-100 cursor-pointer
                text-gray-800
              "
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={isPending}
              className="
                px-4 py-2 rounded-lg
                bg-red-600 text-white text-sm
                hover:bg-red-700
                disabled:opacity-50
                cursor-pointer
              "
            >
              {isPending ? "Leaving..." : confirmText}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

export default ConfirmDialog;
