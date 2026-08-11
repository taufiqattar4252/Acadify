import { v2 as cloudinary } from 'cloudinary';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export const uploadImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('No file uploaded', 400));
  }

  // Upload to Cloudinary using upload_stream for memory storage
  const streamUpload = (req: Request) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'acadify_questions' },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      if (req.file) {
        stream.end(req.file.buffer);
      }
    });
  };

  try {
    const result: any = await streamUpload(req);
    res.status(200).json({
      status: 'success',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
      }
    });
  } catch (error) {
    return next(new AppError('Failed to upload image', 500));
  }
});
