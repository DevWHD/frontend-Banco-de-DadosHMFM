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
  X,
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
  subfolders: any[];
  folderName: string | null;
  isLoading: boolean;
  onUpload: () => void;
  onCreateSubfolder: () => void;
  onSelectFolder: (folderId: number) => void;
  onDelete: (fileId: number) => void;
  onDeleteFolder: (folderId: number) => void;
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
  subfolders,
  folderName,
  isLoading,
  onUpload,
  onCreateSubfolder,
  onSelectFolder,
  onDelete,
  onDeleteFolder,
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
        <div className="flex items-center gap-3">
          <Button onClick={onCreateSubfolder} size="lg" variant="outline" className="gap-2 shadow-md hover:shadow-lg transition-shadow border-primary/30 hover:border-primary/50 hover:bg-primary/5">
            <FolderOpen className="w-5 h-5" />
            <span className="hidden sm:inline">Nova Subpasta</span>
          </Button>
          <Button onClick={onUpload} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
            <Upload className="w-5 h-5" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
        </div>
      </div>

      {/* Files and Subfolders */}
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
        ) : subfolders.length === 0 && files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
            <div className="text-5xl opacity-40">📄</div>
            <p className="text-base font-semibold text-foreground">Nenhum conteúdo encontrado</p>
            <p className="text-sm text-muted-foreground/70">Crie subpastas ou envie documentos</p>
            <div className="flex gap-3 mt-3">
              <Button variant="outline" size="sm" onClick={onCreateSubfolder} className="gap-2 bg-background/60 hover:bg-background/80 border-border/50">
                <FolderOpen className="w-4 h-4" />
                Nova Subpasta
              </Button>
              <Button variant="outline" size="sm" onClick={onUpload} className="gap-2 bg-background/60 hover:bg-background/80 border-border/50">
                <Upload className="w-4 h-4" />
                Enviar arquivo
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Subpastas - aparecem primeiro */}
            {subfolders.map((subfolder) => (
              <div
                key={`subfolder-${subfolder.id}`}
                className={cn(
                  "group relative rounded-xl border-2 border-dashed border-primary/40 bg-gradient-to-br from-primary/5 to-primary/2 p-6 backdrop-blur-sm",
                  "hover:border-primary/70 hover:shadow-lg transition-all duration-300"
                )}
              >
                {/* Delete button */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-all duration-200 transform hover:scale-110"
                    onClick={() => onDeleteFolder(subfolder.id)}
                    aria-label={`Excluir pasta ${subfolder.name}`}
                    title="Excluir pasta"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>

                {/* Folder content */}
                <div
                  onClick={() => onSelectFolder(subfolder.id)}
                  className="flex flex-col items-center justify-center h-full text-center cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-4">
                    <FolderOpen className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate max-w-full px-2" title={subfolder.name}>
                    {subfolder.name}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-2">📁 Subpasta</p>
                </div>
              </div>
            ))}

            {/* Arquivos */}
            {files.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "group relative rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/60 p-6 backdrop-blur-sm",
                  "hover:border-primary/30 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer",
                  !file.blob_url && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {getFileIcon(file.mime_type, file.name)}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className={cn(
                        "p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 transform hover:scale-110",
                        !file.blob_url && "opacity-50 cursor-not-allowed hover:bg-transparent"
                      )}
                      onClick={() => file.blob_url && onDownload(file)}
                      disabled={!file.blob_url}
                      aria-label={`Baixar ${file.name}`}
                      title={file.blob_url ? "Baixar arquivo" : "URL de download não disponível"}
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
                {!file.blob_url && (
                  <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-yellow-500 font-semibold">Download indisponível</p>
                  </div>
                )}
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
