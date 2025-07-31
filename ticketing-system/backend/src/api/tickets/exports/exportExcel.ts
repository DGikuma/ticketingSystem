import { Request, Response } from "express";
export const exportExcel = async (req: Request, res: Response) => {
  res.download("path/to/generated-excel.xlsx"); // Replace with actual logic
};