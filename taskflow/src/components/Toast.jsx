import { CheckCircle2, Info, XCircle } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toast({ message, kind }) {
  const Icon = icons[kind] || Info;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-soft dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <Icon className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
