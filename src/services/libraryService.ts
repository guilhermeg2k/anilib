import axiosClient from 'library/axios';

class LibraryService {
  static async updateLibrary() {
    await axiosClient.put('/library');
  }
}

export default LibraryService;
