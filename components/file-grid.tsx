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
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4 bg-gradient-to-b from-background to-muted/20">
        <div className="text-6xl animate-bounce">📁</div>
        <p className="text-lg font-semibold text-foreground">Selecione um setor</p>
        <p className="text-sm text-muted-foreground/70">
          Escolha uma pasta no painel lateral para ver os arquivos
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background via-background to-muted/10">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border/40 bg-gradient-to-r from-card/60 to-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-bold text-foreground text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {folderName}
          </h2>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {isLoading
              ? "Carregando arquivos..."
              : `${files.length} arquivo${files.length !== 1 ? "s" : ""} encontrado${files.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={onUpload} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Upload className="w-5 h-5" />
          <span className="hidden sm:inline">Upload</span>
        </Button>
      </div>

      {/* Files */}
      <div className="flex-1 overflow-auto p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="rounded-xl border border-border/40 bg-card p-6 animate-pulse backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-lg bg-muted/60 mb-4" />
                <div className="h-4 bg-muted/60 rounded-lg w-4/5 mb-3" />
                <div className="h-3 bg-muted/40 rounded-lg w-3/5" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
            <div className="text-5xl opacity-40">📄</div>
            <p className="text-base font-semibold text-foreground">Nenhum arquivo encontrado</p>
            <p className="text-sm text-muted-foreground/70">Envie seus primeiros documentos agora</p>
            <Button variant="outline" size="sm" onClick={onUpload} className="gap-2 mt-2 bg-background/60 hover:bg-background/80 border-border/50">
              <Upload className="w-4 h-4" />
              Enviar arquivo
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "group relative rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/60 p-6 backdrop-blur-sm",
                  "hover:border-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {getFileIcon(file.mime_type, file.name)}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 transform hover:scale-110"
                      onClick={() => onDownload(file)}
                      aria-label={`Baixar ${file.name}`}
                      title="Baixar arquivo"
                    >
                      <Download className="w-5 h-5 text-primary" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-all duration-200 transform hover:scale-110"
                      onClick={() => onDelete(file.id)}
                      aria-label={`Excluir ${file.name}`}
                      title="Excluir arquivo"
                    >
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-foreground truncate" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground/70">
                  <span className="font-medium">{formatFileSize(file.size)}</span>
                  <span className="opacity-50">·</span>
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
