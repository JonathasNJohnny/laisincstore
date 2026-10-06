import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { TOAST_EVENT, type ToastDetail } from "../../utils/toast";

const TOAST_DURATION = 5000;

export function ToastViewport() {
  const [toast, setToast] = useState<ToastDetail | null>(null);

  useEffect(() => {
    const showToast = (event: Event) => {
      setToast((event as CustomEvent<ToastDetail>).detail);
    };

    window.addEventListener(TOAST_EVENT, showToast);
    return () => window.removeEventListener(TOAST_EVENT, showToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), TOAST_DURATION);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className="fixed right-4 top-20 z-[70] w-[calc(100%-2rem)] max-w-sm animate-[slideUp_180ms_ease-out] rounded-2xl border border-dourado-suave/70 bg-branco p-4 shadow-xl dark:bg-zinc-900 dark:text-zinc-100"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-dourado-suave/25 text-rosa-lais">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="flex-1 pt-1 text-sm font-medium text-grafite-arroxeado dark:text-zinc-100">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="rounded-lg p-1 text-cinza-amarronzado transition-colors hover:bg-rosa-lais/10 hover:text-rosa-lais dark:text-zinc-400"
          aria-label="Fechar aviso"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
