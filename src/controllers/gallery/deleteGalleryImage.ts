import { Request, Response } from "express";

export async function deleteGalleryImage(req: Request, res: Response) {
  try {
    const { expeditionId } = req.params as { expeditionId: string };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error deleting image";
    res.status(500).json({
      success: false,
      message,
    });
  }
}
