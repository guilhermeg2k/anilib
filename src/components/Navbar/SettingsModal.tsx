import AutoAnimate from '@components/AutoAnimate';
import Backdrop from '@components/Backdrop';
import Button from '@components/Button';
import CheckBox from '@components/CheckBox';
import DataDisplay from '@components/DataField';
import Label from '@components/Label';
import MaterialIcon from '@components/MaterialIcon';
import Modal from '@components/Modal';
import TextField from '@components/TextField';
import DirectoryService from 'services/directoryService';
import LibraryService from 'services/libraryService';
import SettingsService from 'services/settingsService';
import { toastError, toastSuccess } from 'library/toastify';
import { useRouter } from 'next/router';
import PackageJSON from '../../../package.json';

import React, { useEffect, useState } from 'react';
import useLibraryStatusStore from 'store/libraryStatusStore';
import { LibraryStatus } from '@backend/constants/libraryStatus';
import { trpc } from '@utils/trpc';

const VERSION = `Version ${PackageJSON.version} (${PackageJSON.versionName})`;

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onClose }) => {
  const [newDirectory, setNewDirectory] = useState('');
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isToDeleteConvertedData, setIsToDeleteConvertedData] = useState(false);
  const [isToDeleteInvalidData, setIsToDeleteInvalidData] = useState(false);
  const [shouldUseNVENC, setShouldUseNVENC] = useState(false);
  const { status } = useLibraryStatusStore();
  const router = useRouter();
  const isLibraryUpdating = status === LibraryStatus.Updating;
  const {
    data: directories,
    isLoading: isLoadingDirectories,
    isError: hasLoadingDirectoriesFailed,
    refetch: refreshDirectories,
  } = trpc.directory.list.useQuery();

  const { mutate: deleteDirectory } = trpc.directory.delete.useMutation();
  const { mutate: createDirectory } = trpc.directory.create.useMutation({
    onSuccess: () => toastSuccess('Directory added'),
    onError: () => toastError('Failed to add directory'),
  });

  if (isLoadingDirectories) {
    return <Backdrop open={isLoadingDirectories} />;
  }

  if (hasLoadingDirectoriesFailed) {
    return <div>Failed to load directories</div>;
  }

  const isDirectoriesEmpty = directories.length === 0;

  const loadSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const [isToDeleteConvertedData, isToDeleteInvalidData, shouldUseNVENC] =
        await Promise.all([
          SettingsService.get('isToDeleteConvertedData'),
          SettingsService.get('isToDeleteInvalidData'),
          SettingsService.get('shouldUseNVENC'),
        ]);
      setIsToDeleteConvertedData(isToDeleteConvertedData);
      setIsToDeleteInvalidData(isToDeleteInvalidData);
      setShouldUseNVENC(shouldUseNVENC);
    } catch (error) {
      toastError('Failed to load settings');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const onNewDirectorySubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    await createDirectory({ directory: newDirectory });
    setNewDirectory('');
    refreshDirectories();
  };

  const onDeleteDirectoryHandler = async (directory: string) => {
    try {
      setIsLoadingDirectories(true);
      await DirectoryService.delete(directory);
      await loadDirectories();
      router.replace(router.asPath);
      toastSuccess('Directory removed');
    } catch (error) {
      toastError('Failed to remove directory');
    } finally {
      setIsLoadingDirectories(false);
    }
  };

  const onIsToDeleteConvertedDataChangeHandler = async (value: boolean) => {
    try {
      setIsToDeleteConvertedData(value);
      await SettingsService.update('isToDeleteConvertedData', value);
    } catch (error) {
      toastError('Failed to update is to delete converted data setting');
    }
  };

  const onIsToDeleteInvalidDataChangeHandler = async (value: boolean) => {
    try {
      setIsToDeleteInvalidData(value);
      await SettingsService.update('isToDeleteInvalidData', value);
    } catch (error) {
      toastError('Failed to update is to delete invalid data setting');
    }
  };

  const onShouldUseNVENCChangeHandler = async (value: boolean) => {
    try {
      setShouldUseNVENC(value);
      await SettingsService.update('shouldUseNVENC', value);
    } catch (error) {
      toastError('Failed to update should use nvenc setting');
    }
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
            directories.map((directory) => (
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
            value={isToDeleteInvalidData}
            onChange={onIsToDeleteInvalidDataChangeHandler}
          >
            Remove invalid data (animes, episodes and subtitles with invalid
            files)
          </CheckBox>
          <CheckBox
            className="text-sm"
            value={isToDeleteConvertedData}
            onChange={onIsToDeleteConvertedDataChangeHandler}
          >
            Delete original converted files
          </CheckBox>
          <CheckBox
            className="text-sm"
            value={shouldUseNVENC}
            onChange={onShouldUseNVENCChangeHandler}
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
