import { Router, Request, Response } from 'express';
import { CertificateService } from '../../services/certificateService';

export const certificatesRouter = Router();

// Public certificate verification endpoint (no private student info exposed)
// GET /api/v1/certificates/verify/:id
certificatesRouter.get('/certificates/verify/:id', async (req: Request, res: Response) => {
  try {
    const result = await CertificateService.verifyCertificate(req.params.id);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
});
