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
        const previewsInBase64 =
          await EpisodePreviewService.listByEpisodeIdInBase64(episodeId);
        res.json(previewsInBase64);
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
