import { Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

function isValidObjectId(id: string): boolean {
  if (!Types.ObjectId.isValid(id)) {
    return false;
  }
  const castedId = new Types.ObjectId(id).toHexString();
  if (castedId === id) return true;
  else return false;
}

const validObjectId = (paramName: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!paramName) {
    throw new Error('Missing parameter name.');
  }

  const id = req.params[paramName];
  if (isValidObjectId(id)) {
    next();
  }
  return res.status(400).send();
};

export default validObjectId;
