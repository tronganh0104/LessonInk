import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText } from "lucide-react";
import { parsePageRange } from "../../documents/importers/pageRange";

type PdfImportMode = "all" | "range";

interface PdfImportModalProps {
  fileName: string;
  totalPages?: number;
  isReadingMetadata: boolean;
  isImporting: boolean;
  error?: string;
  onCancel: () => void;
  onImport: (pageNumbers?: number[]) => void;
}

export function PdfImportModal({
  fileName,
  totalPages,
  isReadingMetadata,
  isImporting,
  error,
  onCancel,
  onImport
}: PdfImportModalProps) {
  const defaultMode: PdfImportMode = totalPages && totalPages > 10 ? "range" : "all";
  const defaultRange = totalPages && totalPages > 10 ? `1-${Math.min(5, totalPages)}` : "1";
  const [mode, setMode] = useState<PdfImportMode>(defaultMode);
  const [rangeInput, setRangeInput] = useState(defaultRange);
  const rangeResult = useMemo(
    () => (mode === "range" && totalPages ? parsePageRange(rangeInput, totalPages) : undefined),
    [mode, rangeInput, totalPages]
  );
  const validationError = rangeResult && !rangeResult.ok ? rangeResult.error : undefined;
  const canImport = Boolean(totalPages) && !isReadingMetadata && !isImporting && !error && !validationError;

  useEffect(() => {
    if (!totalPages) {
      return;
    }

    setMode(totalPages > 10 ? "range" : "all");
    setRangeInput(totalPages > 10 ? `1-${Math.min(5, totalPages)}` : "1");
  }, [totalPages]);

  const handleImport = () => {
    if (!totalPages || isImporting) {
      return;
    }

    if (mode === "all") {
      onImport();
      return;
    }

    const result = parsePageRange(rangeInput, totalPages);

    if (result.ok) {
      onImport(result.pages);
    }
  };

  return (
    <div className="pdf-import-modal-overlay" role="presentation">
      <section className="pdf-import-modal" role="dialog" aria-modal="true" aria-labelledby="pdf-import-title">
        <div className="pdf-import-header">
          <div className="pdf-import-icon">
            <FileText size={20} />
          </div>
          <div>
            <h2 id="pdf-import-title">Import PDF</h2>
            <p>{fileName}</p>
          </div>
        </div>

        {isReadingMetadata ? (
          <div className="pdf-import-status" role="status">
            Reading PDF page count...
          </div>
        ) : (
          <>
            {totalPages && (
              <div className="pdf-import-summary">
                <span>Total pages</span>
                <strong>{totalPages}</strong>
              </div>
            )}

            {totalPages && totalPages > 30 && (
              <div className="pdf-import-warning" role="status">
                <AlertTriangle size={16} />
                <span>This PDF has many pages. Importing only the pages you need will keep the lesson faster.</span>
              </div>
            )}

            <div className="pdf-import-options" role="radiogroup" aria-label="PDF import scope">
              <label className={mode === "all" ? "pdf-import-option active" : "pdf-import-option"}>
                <input
                  checked={mode === "all"}
                  disabled={isImporting || !totalPages}
                  name="pdf-import-mode"
                  type="radio"
                  onChange={() => setMode("all")}
                />
                <span>All pages</span>
              </label>

              <label className={mode === "range" ? "pdf-import-option active" : "pdf-import-option"}>
                <input
                  checked={mode === "range"}
                  disabled={isImporting || !totalPages}
                  name="pdf-import-mode"
                  type="radio"
                  onChange={() => setMode("range")}
                />
                <span>Page range</span>
              </label>
            </div>

            <label className="pdf-range-field">
              <span>Pages</span>
              <input
                disabled={mode !== "range" || isImporting || !totalPages}
                placeholder="1-5, 8, 10-12"
                type="text"
                value={rangeInput}
                onChange={(event) => setRangeInput(event.target.value)}
              />
            </label>

            {validationError && mode === "range" && (
              <p className="pdf-import-error" role="alert">
                {validationError}
              </p>
            )}
          </>
        )}

        {error && (
          <p className="pdf-import-error" role="alert">
            {error}
          </p>
        )}

        <p className="pdf-import-tip">Import only the pages you need for today's lesson to keep the app fast.</p>

        <div className="pdf-import-actions">
          <button className="secondary-button" disabled={isImporting} type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-button" disabled={!canImport} type="button" onClick={handleImport}>
            {isImporting ? "Importing..." : "Import"}
          </button>
        </div>
      </section>
    </div>
  );
}
