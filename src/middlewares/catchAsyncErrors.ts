import { NextFunction, Request, RequestHandler, Response } from "express";

const catchAsyncError = (theFunc: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };

export default catchAsyncError;
