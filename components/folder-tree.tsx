"use client";

import { useState, useCallback } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type FolderNode = {
  id: number;
  name: string;
  parent_id: number | null;
  children: FolderNode[];
};

type FolderTreeProps = {
  folders: FolderNode[];
  selectedFolderId: number | null;
  onSelectFolder: (id: number) => void;
  onCreateFolder: (parentId: number | null) => void;
  onRenameFolder: (id: number, name: string) => void;
  onDeleteFolder: (id: number) => void;
};

function buildTree(
  flatFolders: { id: number; name: string; parent_id: number | null }[]
): FolderNode[] {
  const map = new Map<number, FolderNode>();
  const roots: FolderNode[] = [];

  for (const f of flatFolders) {
    map.set(f.id, { ...f, children: [] });
  }

  for (const f of flatFolders) {
    const node = map.get(f.id)!;
    if (f.parent_id && map.has(f.parent_id)) {
      map.get(f.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots.sort((a, b) => a.name.localeCompare(b.name));
}

function FolderItem({
  node,
  level,
  selectedFolderId,
  expandedIds,
  onToggle,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: {
  node: FolderNode;
  level: number;
  selectedFolderId: number | null;
  expandedIds: Set<number>;
  onToggle: (id: number) => void;
  onSelectFolder: (id: number) => void;
  onCreateFolder: (parentId: number | null) => void;
  onRenameFolder: (id: number, name: string) => void;
  onDeleteFolder: (id: number) => void;
}) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedFolderId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-2 py-2 px-3 cursor-pointer rounded-lg text-sm transition-all duration-200",
          isSelected
            ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-semibold border-l-2 border-primary shadow-sm"
            : "hover:bg-muted/60 text-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${level * 14 + 12}px` }}
        onClick={() => {
          onSelectFolder(node.id);
          if (hasChildren && !isExpanded) {
            onToggle(node.id);
          }
        }}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        {/* Seta de Expansão/Collapse */}
        <button
          className={cn(
            "flex-shrink-0 w-5 h-5 flex items-center justify-center transition-transform duration-200 rounded hover:bg-accent/50",
            !hasChildren && "cursor-default"
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) {
              onToggle(node.id);
            }
          }}
          aria-label={isExpanded ? "Recolher pasta" : "Expandir pasta"}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-primary/60 transition-transform" />
            ) : (
              <ChevronRight className="w-4 h-4 text-primary/60 transition-transform" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
        </button>

        {/* Ícone da Pasta */}
        {isExpanded ? (
          <FolderOpen className="w-4 h-4 flex-shrink-0 text-primary" />
        ) : (
          <Folder className="w-4 h-4 flex-shrink-0 text-primary/70" />
        )}

        {/* Nome da Pasta */}
        <span className="truncate flex-1 font-medium">{node.name}</span>

        {/* Botão de Criar Subpasta (Visível ao passar o mouse) */}
        <button
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md hover:bg-primary/10 transition-all duration-200 hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onCreateFolder(node.id);
          }}
          aria-label="Criar subpasta"
          title="Criar subpasta"
        >
          <FolderPlus className="w-4 h-4" />
        </button>

        {/* Botão de Excluir (Visível ao passar o mouse) */}
        <button
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md hover:bg-destructive/10 transition-all duration-200 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteFolder(node.id);
          }}
          aria-label="Excluir pasta"
          title="Excluir pasta"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md hover:bg-accent transition-all duration-200 -mr-1"
              onClick={(e) => e.stopPropagation()}
              aria-label="Mais opções"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-48">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(node.id);
              }}
              className="gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Nova subpasta</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onRenameFolder(node.id, node.name);
              }}
              className="gap-2 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Renomear</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && hasChildren && (
        <div role="group" className="relative">
          {node.children
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((child, index) => (
              <div key={child.id} className="relative">
                {/* Linha vertical para indicar continuação */}
                {level < 3 && (
                  <div
                    className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-border/50 to-border/20"
                    style={{ left: `${level * 14 + 28}px` }}
                  />
                )}
                <FolderItem
                  node={child}
                  level={level + 1}
                  selectedFolderId={selectedFolderId}
                  expandedIds={expandedIds}
                  onToggle={onToggle}
                  onSelectFolder={onSelectFolder}
                  onCreateFolder={onCreateFolder}
                  onRenameFolder={onRenameFolder}
                  onDeleteFolder={onDeleteFolder}
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default function FolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const onToggle = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const tree = buildTree(
    folders.map((f) => ({ id: f.id, name: f.name, parent_id: f.parent_id }))
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-card/50 to-transparent">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-primary/70" />
          <h2 className="text-sm font-semibold text-foreground/90">
            Setores & Departamentos
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/15 hover:text-primary transition-all duration-200"
          onClick={() => onCreateFolder(null)}
          aria-label="Nova pasta raiz"
          title="Criar novo setor"
        >
          <FolderPlus className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2 px-1" role="tree" aria-label="Navegação de pastas">
          {tree.length > 0 ? (
            tree.map((node) => (
              <FolderItem
                key={node.id}
                node={node}
                level={0}
                selectedFolderId={selectedFolderId}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onSelectFolder={onSelectFolder}
                onCreateFolder={onCreateFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
              />
            ))
          ) : (
            <div className="py-8 px-4 text-center">
              <FolderOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhuma pasta encontrada</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-xs"
                onClick={() => onCreateFolder(null)}
              >
                <FolderPlus className="w-3 h-3 mr-1" />
                Criar primeira pasta
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export { buildTree };
