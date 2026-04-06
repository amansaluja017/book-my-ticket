import type { Response } from "express";

class ApiResponse {
  static ok(res: Response, message: string, data: any = null) {
    return res.status(200).json({ message, data });
  }

  static createdUser(res: Response, message: string, data: any) {
    return res.status(201).json({ message, data });
  }
}

export default ApiResponse;
