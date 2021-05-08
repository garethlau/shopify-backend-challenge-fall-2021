import { Request, Response, NextFunction } from 'express';

export default function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  return res.status(500).send(`
  <div style="padding: 10px; background-color: lightpink;">
    <pre>${err}</pre>
    <pre>
    ${err.stack}
    </pre>
  </div>
  `);
}
