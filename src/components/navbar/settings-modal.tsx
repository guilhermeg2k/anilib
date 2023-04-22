import { toastError, toastSuccess } from '@common/utils/toastify';
import AutoAnimate from '@components/auto-animate';
import Backdrop from '@components/backdrop';
import Button from '@components/button';
import CheckBox from '@components/check-box';
import DataDisplay from '@components/data-field';
import Label from '@components/label';
import MaterialIcon from '@components/material-icon';
import Modal from '@components/modal';
import TextField from '@components/text-field';
import { trpc } from 'common/utils/trpc';
import React, { useState } from 'react';
import { useLibraryStatusStore } from 'store/library-status';
import PackageJSON from '../../../package.json';

const VERSION = `Version ${PackageJSON.version} (${PackageJSON.versionName})`;

const SettingsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const [newDirectory, setNewDirectory] = useState('');
  const { status } = useLibraryStatusStore();

  const {
    data: directories,
    isLoading: isLoadingDirectories,
    isError: loadDirectoriesError,
    refetch: refreshDirectories,
  } = trpc.directory.list.useQuery();

  const {
    data: settings,
    isLoading: isLoadingSettings,
    isError: loadSettingsError,
    refetch: refreshSettings,
  } = trpc.settings.list.useQuery();

  const { mutate: createDirectory, isLoading: isCreatingDirectory } =
    trpc.directory.create.useMutation({
      onSuccess: () => {
        refreshDirectories();
        toastSuccess('Directory added');
      },
      onError: () => toastError('Failed to add directory'),
    });

  const { mutate: deleteDirectory, isLoading: isDeletingDirectory } =
    trpc.directory.deleteByPath.useMutation({
      onSuccess: () => {
        refreshDirectories();
        toastSuccess('Directory removed');
      },
      onError: () => toastError('Failed to remove directory'),
    });

  const { mutate: updateSetting } = trpc.settings.update.useMutation({
    onSuccess: () => {
      toastSuccess(`Setting updated`);
      refreshSettings();
    },
    onError: () => toastError(`Failed to update setting`),
  });

  const { mutate: updateLibrary } = trpc.ws.library.update.useMutation();

  const isLibraryUpdating = status === 'UPDATING';

  const isLoading =
    isLoadingSettings ||
    isCreatingDirectory ||
    isLoadingDirectories ||
    isDeletingDirectory;

  const hasError = loadDirectoriesError || loadSettingsError;

  const isDirectoriesEmpty = directories?.length === 0;

  if (isLoading) {
    return <Backdrop open={isLoading} />;
  }

  if (hasError) {
    onClose();
    toastError('Failed to load settings');
    return null;
  }

  const onCreateNewDirectory = async (event: React.FormEvent) => {
    event.preventDefault();
    await createDirectory({ directory: newDirectory });
    setNewDirectory('');
  };

  return (
    <Modal title="Settings" open={open} onClose={onClose} disableBackdropClick>
      <form onSubmit={onCreateNewDirectory}>
        <Label>Add New Directory</Label>
        <div className="flex items-center justify-between gap-2">
          <TextField
            id="settings-new-directory"
            value={newDirectory}
            placeHolder="/home/Videos/Animes"
            className="w-full"
            onChange={(directory) => setNewDirectory(directory)}
          />
          <Button color="green" onClick={onCreateNewDirectory}>
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
              <li
                key={directory.id}
                className="flex items-center justify-between"
              >
                <span>{directory.path}</span>
                <button
                  className="h-[24px]"
                  onClick={() =>
                    deleteDirectory({
                      path: directory.path,
                    })
                  }
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
          {settings?.map((setting) => (
            <CheckBox
              key={setting.id}
              className="text-sm"
              value={setting.value}
              onChange={(value) =>
                updateSetting({
                  id: setting.id,
                  value,
                })
              }
            >
              {setting.name}
            </CheckBox>
          ))}
        </div>
      </div>
      <Label>Update Library</Label>
      <Button
        color="green"
        onClick={() => updateLibrary()}
        disabled={isLibraryUpdating}
      >
        Update Library
      </Button>
      <div className="text-right text-xs">{VERSION}</div>
    </Modal>
  );
};

export default SettingsModal;
