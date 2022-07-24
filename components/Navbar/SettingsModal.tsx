import Button from '@components/Button';
import Modal from '@components/Modal';
import TextField from '@components/TextField';
import { TrashIcon } from '@heroicons/react/solid';
import DirectoryService from '@services/directoryService';
import LibraryService from '@services/libraryService';
import SettingsService from '@services/settingsService';
import { toastError, toastSuccess } from 'library/toastify';
import { useRouter } from 'next/router';
import React, { FunctionComponent, useEffect, useState } from 'react';
import Backdrop from '@components/Backdrop';
import CheckBox from '@components/CheckBox';
import DataField from '@components/DataField';
import Label from '@components/Label';

const settingsService = new SettingsService();
const directoryService = new DirectoryService();
const libraryService = new LibraryService();

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: FunctionComponent<SettingsModalProps> = ({
  open,
  onClose,
}) => {
  const [newDirectory, setNewDirectory] = useState('');
  const [isLoadingDirectories, setIsLoadingDirectories] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isToDeleteConvertedData, setIsToDeleteConvertedData] = useState(false);
  const [isToDeleteInvalidData, setIsToDeleteInvalidData] = useState(false);
  const [directoriesList, setDirectoriesList] = useState(Array<string>());
  const router = useRouter();
  const isLoading = isLoadingDirectories || isLoadingSettings;

  const loadDirectories = async () => {
    try {
      setIsLoadingDirectories(true);
      const directories = await directoryService.list();
      setDirectoriesList(directories);
    } catch (error) {
      toastError('Failed to load directories');
    } finally {
      setIsLoadingDirectories(false);
    }
  };

  const loadSettings = async () => {
    try {
      setIsLoadingSettings(true);
      const settings = await settingsService.get();
      setIsToDeleteConvertedData(settings.isToDeleteConvertedData);
      setIsToDeleteInvalidData(settings.isToDeleteInvalidData);
    } catch (error) {
      toastError('Failed to load settings');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const onNewDirectoryChangeHandler = (value: string) => {
    setNewDirectory(value);
  };

  const onNewDirectorySubmitHandler = async (event: React.FormEvent) => {
    try {
      setIsLoadingDirectories(true);
      event.preventDefault();
      await directoryService.create(newDirectory);
      setNewDirectory('');
      await loadDirectories();
      toastSuccess('Directory added');
    } catch (error) {
      toastError('Failed to add directory');
    } finally {
      setIsLoadingDirectories(false);
    }
  };

  const onDeleteDirectoryHandler = async (directory: string) => {
    try {
      setIsLoadingDirectories(true);
      await directoryService.delete(directory);
      await loadDirectories();
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
      await settingsService.setIsToDeleteConvertedData(value);
    } catch (error) {
      toastError('Failed to update delete converted data');
    }
  };

  const onIsToDeleteInvalidDataChangeHandler = async (value: boolean) => {
    try {
      setIsToDeleteInvalidData(value);
      await settingsService.setIsToDeleteInvalidData(value);
    } catch (error) {
      toastError('Failed to update delete invalid data');
    }
  };

  const onLibraryUpdateHandler = async () => {
    try {
      setIsLoadingDirectories(true);
      await libraryService.updateLibrary();
      toastSuccess('Library updated');
      router.replace(window.location.pathname);
    } catch {
      toastError('Failed to update library');
    } finally {
      setIsLoadingDirectories(false);
    }
  };

  const directories = directoriesList.map((directory) => (
    <li key={directory} className="flex items-center justify-between">
      <span>{directory}</span>
      <button onClick={() => onDeleteDirectoryHandler(directory)}>
        <TrashIcon className="w-5 h-5 text-rose-600 hover:text-rose-400" />
      </button>
    </li>
  ));

  useEffect(() => {
    loadDirectories();
    loadSettings();
  }, []);

  return (
    <Modal title="Settings" open={open} onClose={onClose} disableBackdropClick>
      <Backdrop open={isLoading} />
      <form onSubmit={onNewDirectorySubmitHandler}>
        <Label>Add New Directory</Label>
        <div className="flex items-center justify-between gap-2">
          <TextField
            id="settings-new-directory"
            value={newDirectory}
            placeHolder="/home/Videos/Animes"
            className="w-full"
            onChange={onNewDirectoryChangeHandler}
          />
          <Button color="green" onClick={onNewDirectorySubmitHandler}>
            add
          </Button>
        </div>
      </form>
      <Label>Directories</Label>
      <DataField className="max-h-[500px]">
        <ul>{directories}</ul>
      </DataField>
      <div>
        <Label>Update library settings</Label>
        <div className="flex flex-col gap-1">
          <CheckBox
            className="text-sm"
            value={isToDeleteInvalidData}
            onChange={onIsToDeleteInvalidDataChangeHandler}
          >
            Delete invalid data (animes, episodes and subtitles with invalid
            files)
          </CheckBox>
          <CheckBox
            className="text-sm"
            value={isToDeleteConvertedData}
            onChange={onIsToDeleteConvertedDataChangeHandler}
          >
            Delete original files of converted files
          </CheckBox>
        </div>
      </div>
      <Label>Update Library</Label>
      <Button color="green" onClick={onLibraryUpdateHandler}>
        Update Library
      </Button>
      <div className="text-xs text-right">Version 0.1 (Jujutsu)</div>
    </Modal>
  );
};

export default SettingsModal;
