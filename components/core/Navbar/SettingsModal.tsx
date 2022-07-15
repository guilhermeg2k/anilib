import Button from '@components/core/Button';
import Modal from '@components/core/Modal';
import TextField from '@components/core/TextField';
import { TrashIcon } from '@heroicons/react/solid';
import DirectoryService from '@services/directoryService';
import LibraryService from '@services/libraryService';
import { toastError, toastSuccess } from 'library/toastify';
import React, { FunctionComponent, useEffect, useState } from 'react';
import Backdrop from '../Backdrop';
import DataField from '../DataField';
import Label from '../Label';
import { useRouter } from 'next/router';

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
  const [isLoading, setIsLoading] = useState(false);
  const [newDirectory, setNewDirectory] = useState('');
  const [directoriesList, setDirectoriesList] = useState(Array<string>());
  const router = useRouter();

  const loadDirectories = async () => {
    try {
      setIsLoading(true);
      const directories = await directoryService.list();
      setDirectoriesList(directories);
    } finally {
      setIsLoading(false);
    }
  };

  const onNewDirectoryChangeHandler = (value: string) => {
    setNewDirectory(value);
  };

  const onNewDirectorySubmitHandler = async (event: React.FormEvent) => {
    try {
      setIsLoading(true);
      event.preventDefault();
      await directoryService.create(newDirectory);
      setNewDirectory('');
      await loadDirectories();
      toastSuccess('Directory added');
    } catch (error) {
      toastError('Failed to add directory');
    } finally {
      setIsLoading(false);
    }
  };

  const onDeleteDirectoryHandler = async (directory: string) => {
    try {
      setIsLoading(true);
      await directoryService.delete(directory);
      await loadDirectories();
      toastSuccess('Directory removed');
    } catch (error) {
      toastError('Failed to remove directory');
    } finally {
      setIsLoading(false);
    }
  };

  const onLibraryUpdateHandler = async () => {
    try {
      setIsLoading(true);
      await libraryService.updateLibrary();
      toastSuccess('Library updated');
      router.replace(window.location.pathname);
    } catch {
      toastError('Failed to update library');
    } finally {
      setIsLoading(false);
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
      <Label>Update Library</Label>
      <Button color="green" onClick={onLibraryUpdateHandler}>
        Update Library
      </Button>
    </Modal>
  );
};

export default SettingsModal;
