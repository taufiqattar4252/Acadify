import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import { Request, Response } from 'express';

export const requestLogger = pinoHttp({
  logger,
  genReqId: function (req, res) {
    const existingId = req.id ?? req.headers['x-request-id'];
    if (existingId) return existingId;
    const id = uuidv4();
    if (!res.headersSent) {
      res.setHeader('X-Request-Id', id);
    }
    return id;
  },
  customProps: function (req, res) {
    return {
      requestId: req.id,
      userId: (req as any).user?._id || (req as any).admin?._id || (req as any).partner?._id,
      userRole: (req as any).user?.role || (req as any).admin?.role || (req as any).partner?.role
    };
  },
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn';
    }
    return 'info';
  },
  customSuccessMessage: function (req, res) {
    return 'request completed';
  },
  customErrorMessage: function (req, res, err) {
    return 'request failed';
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.remoteAddress,
      userAgent: req.headers['user-agent']
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  }
});

export default requestLogger;
