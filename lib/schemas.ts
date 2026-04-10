import { z } from 'zod';

/**
 * Schema para validar arquivo (FileItem) em runtime
 * Zod vai garantir que os dados do backend têm a estrutura correta
 */
export const FileItemSchema = z.object({
  id: z.number().int().positive("ID deve ser um número positivo"),
  name: z.string().min(1, "Nome do arquivo é obrigatório"),
  folder_id: z.number().int().nonnegative("Folder ID deve ser >= 0"),
  blob_url: z.string().url("blob_url deve ser uma URL válida"),
  size: z.number().int().nonnegative("Tamanho deve ser >= 0"),
  mime_type: z.string().min(1, "MIME type é obrigatório"),
  created_at: z.string(),
});

export type FileItem = z.infer<typeof FileItemSchema>;

/**
 * Schema para validar pasta (FolderItem) em runtime
 */
export const FolderItemSchema = z.object({
  id: z.number().int().positive("ID deve ser um número positivo"),
  name: z.string().min(1, "Nome da pasta é obrigatório"),
  parent_id: z.number().int().nonnegative("Parent ID deve ser >= 0").nullable(),
  created_at: z.string().optional(),
});

export type FolderItem = z.infer<typeof FolderItemSchema>;
