import { Download, FileJson, Filter, Search, Trash2, Upload } from "lucide-react";

export function Toolbar({
  query,
  priority,
  label,
  labels,
  fileInputRef,
  onQueryChange,
  onPriorityChange,
  onLabelChange,
  onImport,
  onExportJson,
  onExportCsv,
  onClear,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-[minmax(220px,1fr)_160px_160px] lg:w-[720px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tasks, labels, assignees"
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-800"
          />
        </label>

        <label className="relative block">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-800"
          >
            <option value="All">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </label>

        <select
          value={label}
          onChange={(event) => onLabelChange(event.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-slate-800"
        >
          <option value="All">All labels</option>
          {labels.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <input fileInputRef={fileInputRef} type="file" accept=".json,.csv" className="hidden" onChange={onImport} ref={fileInputRef} />
        <button type="button" className="toolbar-button" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import
        </button>
        <button type="button" className="toolbar-button" onClick={onExportJson}>
          <FileJson className="h-4 w-4" />
          JSON
        </button>
        <button type="button" className="toolbar-button" onClick={onExportCsv}>
          <Download className="h-4 w-4" />
          CSV
        </button>
        <button type="button" className="toolbar-button danger" onClick={onClear}>
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </div>
    </div>
  );
}
