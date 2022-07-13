import axiosClient from 'library/axios';

class LibraryService {
  async updateLibrary() {
    await axiosClient.put('/library');
  }
}

export default LibraryService;
