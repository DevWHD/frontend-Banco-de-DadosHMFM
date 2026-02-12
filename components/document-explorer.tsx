"use client";

import React from "react"

import { useState, useCallback, useRef } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { toast } from "sonner";
import { Hospital, PanelLeftClose, PanelLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import FolderTree from "@/components/folder-tree";
import FileGrid, { type FileItem } from "@/components/file-grid";
import PasswordDialog from "@/components/password-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import API_URL from "@/lib/config";
import { checkFolderPassword } from "@/lib/folder-passwords";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DocumentExplorer() {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Password protection state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [pendingFolderId, setPendingFolderId] = useState<number | null>(null);
  const [passwordError, setPasswordError] = useState<string>("");
  const [unlockedFolders, setUnlockedFolders] = useState<Set<number>>(new Set());

  // Folder dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<
    "create" | "rename"
  >("create");
  const [folderDialogParentId, setFolderDialogParentId] = useState<
    number | null
  >(null);
  const [folderDialogId, setFolderDialogId] = useState<number | null>(null);
  const [folderName, setFolderName] = useState("");
  const [folderSaving, setFolderSaving] = useState(false);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Upload state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SWR: fetch folders
  const { data: folders = [], isLoading: foldersLoading } = useSWR(
    `${API_URL}/api/folders`,
    fetcher
  );

  // SWR: fetch files for selected folder
  const { data: files = [], isLoading: filesLoading } = useSWR(
    selectedFolderId ? `${API_URL}/api/files?folder_id=${selectedFolderId}` : null,
    fetcher
  );

  // Find selected folder name
  const selectedFolder = folders.find(
    (f: { id: number; name: string }) => f.id === selectedFolderId
  );

  // Password protection
  const handleSelectFolder = useCallback((folderId: number) => {
    // Check if folder is already unlocked
    if (unlockedFolders.has(folderId)) {
      setSelectedFolderId(folderId);
      return;
    }

    // Show password dialog
    setPendingFolderId(folderId);
    setPasswordError("");
    setPasswordDialogOpen(true);
  }, [unlockedFolders]);

  const handlePasswordSubmit = useCallback((password: string) => {
    if (pendingFolderId === null) return;

    // Find folder name
    const folder = folders.find((f: { id: number; name: string }) => f.id === pendingFolderId);
    if (!folder) return;

    if (checkFolderPassword(folder.name, password)) {
      // Password correct - unlock folder
      setUnlockedFolders((prev) => new Set(prev).add(pendingFolderId));
      setSelectedFolderId(pendingFolderId);
      setPasswordDialogOpen(false);
      setPasswordError("");
      setPendingFolderId(null);
      toast.success("Pasta desbloqueada com sucesso");
    } else {
      // Password incorrect
      setPasswordError("Senha incorreta. Tente novamente.");
      toast.error("Senha incorreta");
    }
  }, [pendingFolderId, folders]);

  const handlePasswordCancel = useCallback(() => {
    setPasswordDialogOpen(false);
    setPasswordError("");
    setPendingFolderId(null);
  }, []);

  // Find pending folder name
  const pendingFolder = folders.find(
    (f: { id: number; name: string }) => f.id === pendingFolderId
  );

  // Folder CRUD
  const handleCreateFolder = useCallback((parentId: number | null) => {
    setFolderDialogMode("create");
    setFolderDialogParentId(parentId);
    setFolderDialogId(null);
    setFolderName("");
    setFolderDialogOpen(true);
  }, []);

  const handleRenameFolder = useCallback((id: number, name: string) => {
    setFolderDialogMode("rename");
    setFolderDialogId(id);
    setFolderDialogParentId(null);
    setFolderName(name);
    setFolderDialogOpen(true);
  }, []);

  const handleDeleteFolder = useCallback((id: number) => {
    setDeleteFolderId(id);
    setDeleteDialogOpen(true);
  }, []);

  const submitFolder = async () => {
    if (!folderName.trim()) return;
    setFolderSaving(true);

    try {
      if (folderDialogMode === "create") {
        const res = await fetch(`${API_URL}/api/folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: folderName.trim(),
            parent_id: folderDialogParentId,
          }),
        });
        if (!res.ok) throw new Error("Falha ao criar pasta");
        toast.success("Pasta criada com sucesso");
      } else {
        const res = await fetch(`${API_URL}/api/folders/${folderDialogId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: folderName.trim() }),
        });
        if (!res.ok) throw new Error("Falha ao renomear pasta");
        toast.success("Pasta renomeada com sucesso");
      }

      globalMutate(`${API_URL}/api/folders`);
      setFolderDialogOpen(false);
    } catch (err) {
      toast.error(
        folderDialogMode === "create"
          ? "Erro ao criar pasta"
          : "Erro ao renomear pasta"
      );
      console.error(err);
    } finally {
      setFolderSaving(false);
    }
  };

  const confirmDeleteFolder = async () => {
    if (!deleteFolderId) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/folders/${deleteFolderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao excluir pasta");

      toast.success("Pasta excluída com sucesso");
      globalMutate(`${API_URL}/api/folders`);

      if (selectedFolderId === deleteFolderId) {
        setSelectedFolderId(null);
      }

      setDeleteDialogOpen(false);
    } catch (err) {
      toast.error("Erro ao excluir pasta");
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // File operations
  const handleUpload = useCallback(() => {
    setUploadFiles([]);
    setUploadProgress(0);
    setUploadDialogOpen(true);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setUploadFiles(selected);
  };

  const submitUpload = async () => {
    if (!uploadFiles.length || !selectedFolderId) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("folder_id", String(selectedFolderId));
      for (const file of uploadFiles) {
        formData.append("files", file);
      }

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) throw new Error("Falha no upload");

      setUploadProgress(100);
      toast.success(
        `${uploadFiles.length} arquivo${uploadFiles.length > 1 ? "s" : ""} enviado${uploadFiles.length > 1 ? "s" : ""} com sucesso`
      );
      globalMutate(`${API_URL}/api/files?folder_id=${selectedFolderId}`);

      setTimeout(() => {
        setUploadDialogOpen(false);
        setUploadFiles([]);
        setUploadProgress(0);
      }, 500);
    } catch (err) {
      toast.error("Erro no upload de arquivos");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/files/${fileId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir arquivo");

      toast.success("Arquivo excluído");
      globalMutate(`${API_URL}/api/files?folder_id=${selectedFolderId}`);
    } catch (err) {
      toast.error("Erro ao excluir arquivo");
      console.error(err);
    }
  };

  const handleDownload = (file: FileItem) => {
    const a = document.createElement("a");
    a.href = file.blob_url;
    a.download = file.name;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Baixando ${file.name}`);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? "Fechar painel" : "Abrir painel"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-handleSelectFoldermary flex items-center justify-center">
            <Hospital className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground leading-tight">
              HMFM
            </span>
            <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
              Hospital Maternidade Fernando Magalhães
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden md:block">
            Explorer de Documentos
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "border-r border-border bg-sidebar-background transition-all duration-200 flex-shrink-0 overflow-hidden",
            sidebarOpen ? "w-72" : "w-0"
          )}
        >
          <div className="w-72 h-full">
            {foldersLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={`skel-${i}`}
                    className="h-6 rounded bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <FolderTree
                folders={folders}
                selectedFolderId={selectedFolderId}
                onSelectFolder={handleSelectFolder}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <FileGrid
            files={files}
            folderName={selectedFolder?.name || null}
            isLoading={filesLoading}
            onUpload={handleUpload}
            onDelete={handleDeleteFile}
            onDownload={handleDownload}
          />
        </main>
      </div>

      {/* Password protection dialog */}
      <PasswordDialog
        open={passwordDialogOpen}
        folderName={pendingFolder?.name || ""}
        onCancel={handlePasswordCancel}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />

      {/* Folder create/rename dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {folderDialogMode === "create" ? "Nova Pasta" : "Renomear Pasta"}
            </DialogTitle>
            <DialogDescription>
              {folderDialogMode === "create"
                ? "Insira o nome da nova pasta."
                : "Edite o nome da pasta."}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nome da pasta"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitFolder();
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFolderDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={submitFolder} disabled={folderSaving || !folderName.trim()}>
              {folderSaving
                ? "Salvando..."
                : folderDialogMode === "create"
                  ? "Criar"
                  : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete folder confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Pasta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta pasta? Todos os arquivos e
              subpastas serão removidos permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteFolder}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Arquivos</DialogTitle>
            <DialogDescription>
              Selecione os arquivos para enviar para{" "}
              <strong>{selectedFolder?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                "hover:border-primary/50 hover:bg-accent/50",
                uploadFiles.length > 0
                  ? "border-primary/30 bg-accent/30"
                  : "border-border"
              )}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp"
              />
              {uploadFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {uploadFiles.length} arquivo
                    {uploadFiles.length > 1 ? "s" : ""} selecionado
                    {uploadFiles.length > 1 ? "s" : ""}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-auto">
                    {uploadFiles.map((f, i) => (
                      <li key={`upload-${i}`} className="truncate">
                        {f.name}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Clique para alterar a seleção
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar arquivos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DOCX, XLSX, imagens
                  </p>
                </div>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Enviando... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={submitUpload}
              disabled={uploading || uploadFiles.length === 0}
            >
              {uploading ? "Enviando..." : "Enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
