import AutoAnimate from '@components/AutoAnimate';
import Backdrop from '@components/Backdrop';
import Button from '@components/Button';
import CheckBox from '@components/CheckBox';
import DataDisplay from '@components/DataField';
import Label from '@components/Label';
import MaterialIcon from '@components/MaterialIcon';
import Modal from '@components/Modal';
import TextField from '@components/TextField';
import { toastError, toastSuccess } from 'library/toastify';
import LibraryService from 'services/libraryService';
import PackageJSON from '../../../package.json';

import { LibraryStatus } from '@backend/constants/libraryStatus';
import { Setting } from '@backend/database/types';
import { trpc } from '@utils/trpc';
import React, { useState } from 'react';
import useLibraryStatusStore from 'store/libraryStatusStore';

const VERSION = `Version ${PackageJSON.version} (${PackageJSON.versionName})`;
const SETTINGS_TO_LOAD: Readonly<Setting[]> = [
  'isToDeleteConvertedData',
  'isToDeleteInvalidData',
  'shouldUseNVENC',
] as const;

const SettingsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [newDirectory, setNewDirectory] = useState('');
  const { status } = useLibraryStatusStore();
  const isLibraryUpdating = status === LibraryStatus.Updating;

  const {
    data: directories,
    isLoading: isLoadingDirectories,
    isError: hasLoadingDirectoriesFailed,
    refetch: refreshDirectories,
  } = trpc.directory.list.useQuery();

  const settingsQueries = trpc.useQueries((t) =>
    SETTINGS_TO_LOAD.map((setting) =>
      t.settings.get({
        setting,
      })
    )
  );

  const isLoadingSettings = settingsQueries.some((query) => query.isLoading);
  const hasFailedToLoadSettings = settingsQueries.some(
    (query) => query.isError
  );
  const [isToDeleteConvertedData, isToDeleteInvalidData, shouldUseNVENC] =
    settingsQueries.map((query) => query.data);
  const [
    refetchIsToDeleteConvertedData,
    refetchIsToDeleteInvalidData,
    refetchShouldUseNVENC,
  ] = settingsQueries.map((query) => query.refetch);

  const { mutate: createDirectory, isLoading: isCreatingDirectory } =
    trpc.directory.create.useMutation({
      onSuccess: () => {
        refreshDirectories();
        toastSuccess('Directory added');
      },
      onError: () => toastError('Failed to add directory'),
    });

  const { mutate: deleteDirectory, isLoading: isDeletingDirectory } =
    trpc.directory.delete.useMutation({
      onSuccess: () => {
        refreshDirectories();
        toastSuccess('Directory removed');
      },
      onError: () => toastError('Failed to remove directory'),
    });

  const { mutate: updateSetting } = trpc.settings.update.useMutation({
    onSuccess: (_, { setting }) => {
      switch (setting) {
        case 'isToDeleteConvertedData':
          refetchIsToDeleteConvertedData();
          break;
        case 'isToDeleteInvalidData':
          refetchIsToDeleteInvalidData();
          break;
        case 'shouldUseNVENC':
          refetchShouldUseNVENC();
          break;
      }
      toastSuccess(`Setting ${setting} updated`);
    },
    onError: (_, { setting }) =>
      toastError(`Failed to update ${setting} setting`),
  });

  const isLoading =
    isLoadingSettings ||
    isCreatingDirectory ||
    isLoadingDirectories ||
    isDeletingDirectory;

  const hasError = hasLoadingDirectoriesFailed || hasFailedToLoadSettings;

  const isDirectoriesEmpty = directories?.length === 0;

  if (isLoading) {
    return <Backdrop open={isLoadingDirectories} />;
  }

  if (hasError) {
    return <div>Failed to load directories</div>;
  }

  const onNewDirectorySubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    await createDirectory({ directory: newDirectory });
    setNewDirectory('');
  };

  const onDeleteDirectoryHandler = async (directory: string) => {
    deleteDirectory({
      directory,
    });
  };

  const onLibraryUpdateHandler = async () => {
    try {
      // setIsLoadingDirectories(true);
      await LibraryService.update();
      // await loadDirectories();
    } finally {
      // setIsLoadingDirectories(false);
    }
  };

  return (
    <Modal title="Settings" open={open} onClose={onClose} disableBackdropClick>
      <form onSubmit={onNewDirectorySubmitHandler}>
        <Label>Add New Directory</Label>
        <div className="flex items-center justify-between gap-2">
          <TextField
            id="settings-new-directory"
            value={newDirectory}
            placeHolder="/home/Videos/Animes"
            className="w-full"
            onChange={(directory) => setNewDirectory(directory)}
          />
          <Button color="green" onClick={onNewDirectorySubmitHandler}>
            add
          </Button>
        </div>
      </form>
      <Label>Directories</Label>
      <DataDisplay className="max-h-[500px]">
        <AutoAnimate as="ul">
          {isDirectoriesEmpty ? (
            <div className="flex justify-center text-sm">
              You don&apos;t have directories added
            </div>
          ) : (
            directories?.map((directory) => (
              <li key={directory} className="flex items-center justify-between">
                <span>{directory}</span>
                <button
                  className="h-[24px]"
                  onClick={() => onDeleteDirectoryHandler(directory)}
                >
                  <MaterialIcon className="text-rose-600 hover:text-rose-400">
                    delete
                  </MaterialIcon>
                </button>
              </li>
            ))
          )}
        </AutoAnimate>
      </DataDisplay>
      <div>
        <Label>Update library settings</Label>
        <div className="flex flex-col gap-1">
          <CheckBox
            className="text-sm"
            value={!!isToDeleteInvalidData}
            onChange={(value) =>
              updateSetting({ setting: 'isToDeleteInvalidData', value })
            }
          >
            Remove invalid data (animes, episodes and subtitles with invalid
            files)
          </CheckBox>
          <CheckBox
            className="text-sm"
            value={!!isToDeleteConvertedData}
            onChange={(value) =>
              updateSetting({ setting: 'isToDeleteConvertedData', value })
            }
          >
            Delete original converted files
          </CheckBox>
          <CheckBox
            className="text-sm"
            value={!!shouldUseNVENC}
            onChange={(value) =>
              updateSetting({ setting: 'shouldUseNVENC', value })
            }
          >
            Use Nvidia NVENC as encoder
          </CheckBox>
        </div>
      </div>
      <Label>Update Library</Label>
      <Button
        color="green"
        onClick={onLibraryUpdateHandler}
        disabled={isLibraryUpdating}
      >
        Update Library
      </Button>
      <div className="text-right text-xs">{VERSION}</div>
    </Modal>
  );
};

export default SettingsModal;
