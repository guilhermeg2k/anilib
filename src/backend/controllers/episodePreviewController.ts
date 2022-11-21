import { getFileInBase64 } from '@backend/utils/fileUtils';
import EpisodePreviewService from 'backend/service/episodePreviewService';
import { NextApiRequest, NextApiResponse } from 'next';

class EpisodePreviewController {
  static async listBase64ByEpisodeId(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    try {
      const { episodeId } = req.query;
      if (episodeId && typeof episodeId === 'string') {
        const previews = EpisodePreviewService.listByEpisodeId(episodeId);

        const previewsWithBase64Promises = previews.map(async (preview) => ({
          ...preview,
          base64: await getFileInBase64(preview.filePath),
        }));
        const previewsWithBase64 = await Promise.all(
          previewsWithBase64Promises
        );

        res.json(previewsWithBase64.flat(Infinity));
        return;
      }
      res.status(400).end();
    } catch (error) {
      res.status(500).end();
      console.error(error);
    }
  }
}

export default EpisodePreviewController;
