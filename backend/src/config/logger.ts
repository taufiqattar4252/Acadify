import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

const transport = pino.transport({
  targets: [
    ...(isDevelopment ? [{
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    }] : [{
      target: 'pino/file', // Fallback for production if loki is missing or in addition
      options: { destination: 1 } // write to stdout
    }]),
    ...(process.env.LOKI_HOST ? [{
      target: 'pino-loki',
      options: {
        batching: true,
        interval: 5,
        host: process.env.LOKI_HOST,
        basicAuth: process.env.LOKI_USERNAME && process.env.LOKI_PASSWORD ? {
          username: process.env.LOKI_USERNAME,
          password: process.env.LOKI_PASSWORD,
        } : undefined,
        labels: {
          app: process.env.APP_NAME || 'acadify-backend',
          environment: process.env.NODE_ENV || 'development',
          service: 'api'
        }
      }
    }] : [])
  ]
});

const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  base: {
    service: 'api',
    environment: process.env.NODE_ENV || 'development'
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'currentPassword',
      'newPassword',
      'confirmPassword',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'razorpayKey',
      'razorpaySecret',
      'LOKI_PASSWORD'
    ],
    censor: '[Redacted]'
  }
}, transport);

export default logger;
