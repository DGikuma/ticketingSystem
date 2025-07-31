import { Request, Response } from "express";
export const exportPDF = async (req: Request, res: Response) => {
  res.download("path/to/generated-pdf.pdf"); // Replace with actual logic
};