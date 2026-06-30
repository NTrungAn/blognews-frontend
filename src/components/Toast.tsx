import { useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

// ─── Toast Item Component ─────────────────────────────────────────────────────

const TOAST_ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'cancel',
  warning: 'warning',
  info: 'info',
};

const TOAST_STYLES: Record<ToastType, { bar: string; icon: string; bg: string }> = {
  success: {
    bar: 'bg-green-500',
    icon: 'text-green-600',
    bg: 'bg-white border-green-200',
  },
  error: {
    bar: 'bg-[#ba1a1a]',
    icon: 'text-[#ba1a1a]',
    bg: 'bg-white border-red-200',
  },
  warning: {
    bar: 'bg-amber-400',
    icon: 'text-amber-500',
    bg: 'bg-white border-amber-200',
  },
  info: {
    bar: 'bg-[#0058be]',
    icon: 'text-[#0058be]',
    bg: 'bg-white border-blue-200',
  },
};

function ToastItemComponent({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const styles = TOAST_STYLES[toast.type];

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4s
    const leaveTimer = setTimeout(() => handleDismiss(), 4000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
    };
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`relative w-[360px] overflow-hidden rounded-xl border shadow-lg transition-all duration-300 ease-in-out ${styles.bg}
        ${visible && !leaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      {/* Color bar on left */}
      <div className={`absolute inset-y-0 left-0 w-1 ${styles.bar}`} />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <span className={`material-symbols-outlined mt-0.5 text-[20px] shrink-0 ${styles.icon}`}>
          {TOAST_ICONS[toast.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#191c1d] leading-tight">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-xs text-[#727785] leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="ml-1 shrink-0 rounded-full p-1 text-[#727785] hover:bg-[#f3f4f5] transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* Progress bar */}
      <div className={`h-0.5 w-full ${styles.bar} opacity-20`}>
        <div
          className={`h-full ${styles.bar} origin-left`}
          style={{ animation: 'toast-shrink 4s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────────

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// ─── useToast Hook ────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error: (title: string, message?: string) => addToast('error', title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info: (title: string, message?: string) => addToast('info', title, message),
  };

  return { toasts, toast, removeToast };
}

// ─── useConfirm Hook (replaces window.confirm) ───────────────────────────────

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  open,
  options,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  options: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDanger = options.variant === 'danger';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#191c1d]/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Icon area */}
        <div className={`flex items-center justify-center pt-6 pb-4`}>
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isDanger ? 'bg-[#ffdad6]' : 'bg-amber-100'}`}>
            <span className={`material-symbols-outlined text-3xl ${isDanger ? 'text-[#ba1a1a]' : 'text-amber-500'}`}>
              {isDanger ? 'delete_forever' : 'warning'}
            </span>
          </div>
        </div>

        <div className="px-6 pb-2 text-center">
          <h3 className="text-lg font-bold text-[#191c1d]">{options.title}</h3>
          <p className="mt-2 text-sm text-[#727785] leading-relaxed">{options.message}</p>
        </div>

        <div className="flex gap-3 p-6 pt-4">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#c2c6d6] bg-white py-2.5 text-sm font-medium text-[#424754] hover:bg-[#f3f4f5] transition-colors"
          >
            {options.cancelText ?? 'Hủy'}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-medium text-white transition-colors ${
              isDanger
                ? 'bg-[#ba1a1a] hover:bg-[#a01616]'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {options.confirmText ?? 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    message: '',
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setOpen(false);
    resolveRef.current?.(false);
  };

  const ConfirmDialogComponent = (
    <ConfirmDialog
      open={open}
      options={options}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialogComponent };
}
