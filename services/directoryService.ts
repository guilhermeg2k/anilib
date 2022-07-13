import axiosClient from 'library/axios';

class DirectoryService {
  async list() {
    const subtitles = await axiosClient.get<Array<string>>(`/directory`);
    return subtitles.data;
  }

  async delete(directory: string) {
    const encodedDirectory = encodeURIComponent(directory);
    await axiosClient.delete(`/directory/${encodedDirectory}`);
  }

  async create(directory: string) {
    await axiosClient.post('/directory', {
      directory,
    });
  }
}

export default DirectoryService;
