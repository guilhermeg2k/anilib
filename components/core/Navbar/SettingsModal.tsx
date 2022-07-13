import React, { FunctionComponent, useEffect, useState } from 'react';
import Modal from '@components/core/Modal';
import TextField from '@components/core/TextField';
import DirectoryService from '@services/directoryService';
import DataField from '../DataField';
import Label from '../Label';
import { TrashIcon } from '@heroicons/react/solid';
import Button from '@components/core/Button';

const directoryService = new DirectoryService();

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const SettingsModal: FunctionComponent<SettingsModalProps> = ({
  open,
  onClose,
}) => {
  const [newDirectory, setNewDirectory] = useState('');
  const [directoriesList, setDirectoriesList] = useState(Array<string>());

  const loadDirectories = async () => {
    const directories = await directoryService.list();
    setDirectoriesList(directories);
  };

  const onNewDirectoryChangeHandler = (value: string) => {
    setNewDirectory(value);
  };

  const onNewDirectorySubmitHandler = async (event: React.FormEvent) => {
    event.preventDefault();
    await directoryService.create(newDirectory);
    setNewDirectory('');
    await loadDirectories();
  };

  const onDeleteDirectoryHandler = async (directory: string) => {
    await directoryService.delete(directory);
    await loadDirectories();
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
  }, [open]);

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
      <Button color="green">Update Library</Button>
    </Modal>
  );
};

export default SettingsModal;
