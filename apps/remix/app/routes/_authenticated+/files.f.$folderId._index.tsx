import { useEffect, useMemo, useState } from 'react';

import { Trans } from '@lingui/react/macro';
import { FolderIcon, HomeIcon, Loader2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { z } from 'zod';

import { FolderType } from '@documenso/lib/types/folder-type';
import { formatAvatarUrl } from '@documenso/lib/utils/avatars';
import { formatFilesPath } from '@documenso/lib/utils/teams';
import { trpc } from '@documenso/trpc/react';
import { ZFindContractsInternalRequestSchema } from '@documenso/trpc/server/contracts-router/schema';
import { type TFolderWithSubfolders } from '@documenso/trpc/server/folder-router/schema';
import { Avatar, AvatarFallback, AvatarImage } from '@documenso/ui/primitives/avatar';
import { Button } from '@documenso/ui/primitives/button';

import { MoveToFolderDialog } from '~/components/dialogs/files-move-to-folder-dialog';
import { CreateFolderDialog } from '~/components/dialogs/folder-create-dialog';
import { FolderDeleteDialog } from '~/components/dialogs/folder-delete-dialog';
import { FolderMoveDialog } from '~/components/dialogs/folder-move-dialog';
import { FolderSettingsDialog } from '~/components/dialogs/folder-settings-dialog';
import { DocumentSearch } from '~/components/general/document/document-search';
import { UploadDropzone } from '~/components/general/files/files-document-upload';
import { FileDropZoneWrapper } from '~/components/general/files/files-drop-zone-wrapper';
import { FolderCard } from '~/components/general/folder/folder-card';
import { FilesTable } from '~/components/tables/files-table';
import { GeneralTableEmptyState } from '~/components/tables/general-table-empty-state';
import { useOptionalCurrentTeam } from '~/providers/team';
import { appMetaTags } from '~/utils/meta';

export function meta() {
  return appMetaTags('Files');
}

const ZSearchParamsSchema = ZFindContractsInternalRequestSchema.pick({
  period: true,
  page: true,
  perPage: true,
  status: true,
  query: true,
});

const sortColumns = z.enum(['id', 'title', 'createdAt']).optional();

export const TypeSearchParams = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string()), z.undefined()]),
);

export default function FilesPage() {
  const [searchParams] = useSearchParams();
  const { folderId } = useParams();

  const navigate = useNavigate();

  const sort = useMemo(
    () => TypeSearchParams.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );

  const columnOrder = useMemo(() => {
    if (sort.sort) {
      try {
        const parsedSort = JSON.parse(sort.sort as string);
        if (Array.isArray(parsedSort) && parsedSort.length > 0) {
          const { id } = parsedSort[0];
          const isValidColumn = sortColumns.safeParse(id);
          return isValidColumn.success ? id : undefined;
        }
      } catch (error) {
        console.error('Error parsing sort parameter:', error);
        return 'id';
      }
    }
    return 'id';
  }, [sort]);

  const columnDirection = useMemo(() => {
    if (sort.sort) {
      try {
        const parsedSort = JSON.parse(sort.sort as string);
        if (Array.isArray(parsedSort) && parsedSort.length > 0) {
          const { desc } = parsedSort[0];
          return desc ? 'desc' : 'asc';
        }
      } catch (error) {
        console.error('Error parsing sort parameter:', error);
        return 'asc';
      }
    }
    return 'asc';
  }, [sort]);

  const team = useOptionalCurrentTeam();

  const [isMovingDocument, setIsMovingDocument] = useState(false);
  const [documentToMove, setDocumentToMove] = useState<number | null>(null);
  const [isMovingFolder, setIsMovingFolder] = useState(false);
  const [folderToMove, setFolderToMove] = useState<TFolderWithSubfolders | null>(null);
  const [isDeletingFolder, setIsDeletingFolder] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<TFolderWithSubfolders | null>(null);
  const [isSettingsFolderOpen, setIsSettingsFolderOpen] = useState(false);
  const [folderToSettings, setFolderToSettings] = useState<TFolderWithSubfolders | null>(null);

  const { mutateAsync: pinFolder } = trpc.folder.pinFolder.useMutation();
  const { mutateAsync: unpinFolder } = trpc.folder.unpinFolder.useMutation();

  const findDocumentSearchParams = useMemo(
    () => ZSearchParamsSchema.safeParse(Object.fromEntries(searchParams.entries())).data || {},
    [searchParams],
  );

  const { data, isLoading, isLoadingError, refetch } = trpc.files.findFilesInternal.useQuery({
    query: findDocumentSearchParams.query,
    period: findDocumentSearchParams.period,
    page: findDocumentSearchParams.page,
    perPage: findDocumentSearchParams.perPage,
    folderId: folderId,
    orderByColumn: columnOrder,
    orderByDirection: columnDirection,
  });

  const {
    data: foldersData,
    isLoading: isFoldersLoading,
    refetch: refetchFolders,
  } = trpc.folder.getFolders.useQuery({
    parentId: folderId,
    type: FolderType.FILE,
  });

  useEffect(() => {
    void refetch();
    void refetchFolders();
  }, [team?.url]);

  const navigateToFolder = (folderId?: string | null) => {
    const documentsPath = formatFilesPath(team?.url);

    if (folderId) {
      void navigate(`${formatFilesPath(team?.url)}/f/${folderId}`);
    } else {
      void navigate(documentsPath);
    }
  };

  return (
    <FileDropZoneWrapper>
      <div className="mx-auto w-full max-w-screen-xl px-4 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 pl-0 hover:bg-transparent"
              onClick={() => navigateToFolder(null)}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Home</span>
            </Button>

            {foldersData?.breadcrumbs.map((folder) => (
              <div key={folder.id} className="flex items-center space-x-2">
                <span>/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 pl-1 hover:bg-transparent"
                  onClick={() => navigateToFolder(folder.id)}
                >
                  <FolderIcon className="h-4 w-4" />
                  <span>{folder.name}</span>
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-4 sm:flex-row sm:justify-end">
            <UploadDropzone />
            <CreateFolderDialog createFrom={FolderType.FILE} />
          </div>
        </div>

        {isFoldersLoading ? (
          <div className="mt-6 flex justify-center">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {foldersData?.folders && foldersData.folders.some((folder) => folder.pinned) && (
              <div className="mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {foldersData.folders
                    .filter((folder) => folder.pinned)
                    .map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        onNavigate={navigateToFolder}
                        onMove={(folder) => {
                          setFolderToMove(folder);
                          setIsMovingFolder(true);
                        }}
                        onPin={(folderId) => void pinFolder({ folderId })}
                        onUnpin={(folderId) => void unpinFolder({ folderId })}
                        onSettings={(folder) => {
                          setFolderToSettings(folder);
                          setIsSettingsFolderOpen(true);
                        }}
                        onDelete={(folder) => {
                          setFolderToDelete(folder);
                          setIsDeletingFolder(true);
                        }}
                      />
                    ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {foldersData?.folders
                  .filter((folder) => !folder.pinned)
                  .map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onNavigate={navigateToFolder}
                      onMove={(folder) => {
                        setFolderToMove(folder);
                        setIsMovingFolder(true);
                      }}
                      onPin={(folderId) => void pinFolder({ folderId })}
                      onUnpin={(folderId) => void unpinFolder({ folderId })}
                      onSettings={(folder) => {
                        setFolderToSettings(folder);
                        setIsSettingsFolderOpen(true);
                      }}
                      onDelete={(folder) => {
                        setFolderToDelete(folder);
                        setIsDeletingFolder(true);
                      }}
                    />
                  ))}
              </div>
            </div>
          </>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-4 gap-y-8">
          <div className="flex flex-row items-center">
            {team && (
              <Avatar className="dark:border-border mr-3 h-12 w-12 border-2 border-solid border-white">
                {team.avatarImageId && <AvatarImage src={formatAvatarUrl(team.avatarImageId)} />}
                <AvatarFallback className="text-muted-foreground text-xs">
                  {team.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
            )}

            <h2 className="text-4xl font-semibold">
              <Trans>Files</Trans>
            </h2>
          </div>

          <div className="-m-1 flex flex-wrap gap-x-4 gap-y-6 overflow-hidden p-1">
            <div className="flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-4">
              <div className="flex w-48 flex-wrap items-center justify-between gap-x-2 gap-y-4">
                <DocumentSearch initialValue={findDocumentSearchParams.query} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {data && (!data?.data.length || data?.data.length === 0) ? (
            <GeneralTableEmptyState status={'ALL'} />
          ) : (
            <FilesTable
              data={data}
              isLoading={isLoading}
              isLoadingError={isLoadingError}
              onMoveDocument={(documentId) => {
                setDocumentToMove(documentId);
                setIsMovingDocument(true);
              }}
              // onMultipleDelete={handleMultipleDelete}
              // isMultipleDelete={isMultipleDelete}
              // setIsMultipleDelete={setIsMultipleDelete}

              // onAdd={openCreateDialog}
              // onEdit={handleEdit}
              // onDelete={handleDelete}
            />
          )}
        </div>

        {documentToMove && (
          <MoveToFolderDialog
            documentId={documentToMove}
            open={isMovingDocument}
            onOpenChange={(open) => {
              setIsMovingDocument(open);

              if (!open) {
                setDocumentToMove(null);
              }
            }}
          />
        )}

        <FolderMoveDialog
          foldersData={foldersData?.folders}
          folder={folderToMove}
          isOpen={isMovingFolder}
          onOpenChange={(open) => {
            setIsMovingFolder(open);

            if (!open) {
              setFolderToMove(null);
            }
          }}
        />

        <FolderSettingsDialog
          folder={folderToSettings}
          isOpen={isSettingsFolderOpen}
          onOpenChange={(open) => {
            setIsSettingsFolderOpen(open);

            if (!open) {
              setFolderToSettings(null);
            }
          }}
        />

        <FolderDeleteDialog
          folder={folderToDelete}
          isOpen={isDeletingFolder}
          onOpenChange={(open) => {
            setIsDeletingFolder(open);

            if (!open) {
              setFolderToDelete(null);
            }
          }}
        />
      </div>
    </FileDropZoneWrapper>
  );
}
