"use client";

import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  Download,
  Trash2,
  Upload,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FileItem = {
  id: number;
  name: string;
  folder_id: number;
  blob_url: string;
  size: number;
  mime_type: string;
  created_at: string;
};

type FileGridProps = {
  files: FileItem[];
  folderName: string | null;
  isLoading: boolean;
  onUpload: () => void;
  onDelete: (fileId: number) => void;
  onDownload: (file: FileItem) => void;
};

function getFileIcon(mimeType: string, name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";

  if (
    mimeType?.includes("pdf") ||
    ext === "pdf" ||
    mimeType?.includes("word") ||
    ext === "doc" ||
    ext === "docx"
  ) {
    return <FileText className="w-10 h-10 text-primary" />;
  }
  if (
    mimeType?.includes("spreadsheet") ||
    mimeType?.includes("excel") ||
    ext === "xls" ||
    ext === "xlsx" ||
    ext === "csv"
  ) {
    return <FileSpreadsheet className="w-10 h-10 text-primary" />;
  }
  if (mimeType?.startsWith("image/")) {
    return <FileImage className="w-10 h-10 text-primary" />;
  }
  return <FileIcon className="w-10 h-10 text-primary" />;
}

function formatFileSize(bytes: number) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function FileGrid({
  files,
  folderName,
  isLoading,
  onUpload,
  onDelete,
  onDownload,
}: FileGridProps) {
  if (!folderName) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <FolderOpen className="w-16 h-16 opacity-30" />
        <p className="text-lg font-medium">Selecione um setor</p>
        <p className="text-sm">
          Escolha uma pasta no painel lateral para ver os arquivos
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h2 className="text-lg font-semibold text-foreground text-balance">
            {folderName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Carregando..."
              : `${files.length} arquivo${files.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={onUpload} size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      {/* Files */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="rounded-lg border border-border bg-card p-4 animate-pulse"
              >
                <div className="w-10 h-10 rounded bg-muted mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <FileIcon className="w-12 h-12 opacity-30" />
            <p className="text-sm font-medium">Nenhum arquivo encontrado</p>
            <Button variant="outline" size="sm" onClick={onUpload} className="gap-2 bg-transparent">
              <Upload className="w-4 h-4" />
              Enviar arquivo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "group relative rounded-lg border border-border bg-card p-4",
                  "hover:border-primary/30 hover:shadow-sm transition-all"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  {getFileIcon(file.mime_type, file.name)}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                      onClick={() => onDownload(file)}
                      aria-label={`Baixar ${file.name}`}
                    >
                      <Download className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                      onClick={() => onDelete(file.id)}
                      aria-label={`Excluir ${file.name}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{"·"}</span>
                  <span>{formatDate(file.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
