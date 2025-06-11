import { z } from 'zod';

export const FolderType = {
  DOCUMENT: 'DOCUMENT',
  TEMPLATE: 'TEMPLATE',
  CHAT: 'CHAT',
  CONTRACT: 'CONTRACT',
} as const;

export const ZFolderTypeSchema = z.enum([
  FolderType.DOCUMENT,
  FolderType.TEMPLATE,
  FolderType.CHAT,
  FolderType.CONTRACT,
]);
export type TFolderType = z.infer<typeof ZFolderTypeSchema>;
