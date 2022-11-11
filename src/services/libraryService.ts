import { LibraryStatus } from '@backend/constants/libraryStatus';
import axiosClient from 'library/axios';

class LibraryService {
  static async update() {
    await axiosClient.put('/library');
  }

  static async getStatus() {
    const status = await axiosClient.get<LibraryStatus>('/library/status');
    return status.data;
  }
}

export default LibraryService;
