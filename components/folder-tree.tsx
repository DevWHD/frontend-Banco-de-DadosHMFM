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
        <button
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center transition-transform duration-200"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          aria-label={isExpanded ? "Recolher pasta" : "Expandir pasta"}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        {isExpanded ? (
          <FolderOpen className="w-4 h-4 flex-shrink-0 text-primary" />
        ) : (
          <Folder className="w-4 h-4 flex-shrink-0 text-primary/70" />
        )}

        <span className="truncate flex-1">{node.name}</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md hover:bg-accent transition-all duration-200 -mr-1"
              onClick={(e) => e.stopPropagation()}
              aria-label="Opções da pasta"
            >
              <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-44">
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
            <DropdownMenuItem
              className="text-destructive focus:text-destructive gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(node.id);
              }}
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && hasChildren && (
        <div role="group">
          {node.children
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((child) => (
              <FolderItem
                key={child.id}
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
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 bg-gradient-to-r from-accent/30 to-transparent">
        <h2 className="text-sm font-bold text-foreground">
          Setores & Departamentos
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10 transition-colors"
          onClick={() => onCreateFolder(null)}
          aria-label="Nova pasta raiz"
          title="Criar novo setor"
        >
          <FolderPlus className="w-4 h-4 text-primary" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2 px-1" role="tree" aria-label="Navegação de pastas">
          {tree.map((node) => (
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export { buildTree };
