import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Subject from '../models/Subject';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// Get all subjects with search and pagination
export const getAllSubjects = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;

  let query: any = { isDeleted: false };
  
  if (search) {
    query = {
      ...query,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    };
  }

  // Aggregate chapters count
  const subjects = await Subject.aggregate([
    { $match: query },
    { $sort: { displayOrder: 1, createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: 'chapters',
        localField: '_id',
        foreignField: 'subject',
        pipeline: [{ $match: { isDeleted: false } }],
        as: 'chapters'
      }
    },
    {
      $addFields: {
        chaptersCount: { $size: '$chapters' },
        id: '$_id'
      }
    },
    { $project: { chapters: 0 } }
  ]);

  const total = await Subject.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: {
      subjects,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getSubject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subject = await Subject.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any);
  
  if (!subject) {
    return next(new AppError('No subject found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { subject }
  });
});

export const createSubject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check for uniqueness manually for better error messages
  const existingCode = await Subject.findOne({ code: req.body.code, isDeleted: false } as any);
  if (existingCode) {
    return next(new AppError('A subject with this code already exists', 400));
  }

  const existingName = await Subject.findOne({ name: req.body.name, isDeleted: false } as any);
  if (existingName) {
    return next(new AppError('A subject with this name already exists', 400));
  }

  const subject = await Subject.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { subject }
  });
});

export const updateSubject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subject = await Subject.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any);

  if (!subject) {
    return next(new AppError('No subject found with that ID', 404));
  }

  if (req.body.code && req.body.code !== subject.code) {
    const existingCode = await Subject.findOne({ code: req.body.code, isDeleted: false } as any);
    if (existingCode) return next(new AppError('Subject code already in use', 400));
  }

  if (req.body.name && req.body.name !== subject.name) {
    const existingName = await Subject.findOne({ name: req.body.name, isDeleted: false } as any);
    if (existingName) return next(new AppError('Subject name already in use', 400));
  }

  Object.assign(subject, req.body);
  await subject.save();

  res.status(200).json({
    status: 'success',
    data: { subject }
  });
});

export const deleteSubject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject || subject.isDeleted) {
    return next(new AppError('No subject found with that ID', 404));
  }

  // Soft delete
  subject.isDeleted = true;
  subject.deletedAt = new Date();
  subject.isActive = false;
  
  // Note: we can also append a timestamp to the name/code so they can be reused
  subject.code = `${subject.code}_DELETED_${Date.now()}`;
  subject.name = `${subject.name}_DELETED_${Date.now()}`;

  await subject.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const toggleStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subject = await Subject.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any);

  if (!subject) {
    return next(new AppError('No subject found with that ID', 404));
  }

  subject.isActive = !subject.isActive;
  await subject.save();

  res.status(200).json({
    status: 'success',
    data: { subject }
  });
});

export const restoreSubject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const subject = await Subject.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: true } as any);

  if (!subject) {
    return next(new AppError('No deleted subject found with that ID', 404));
  }

  // Clean up the _DELETED_ suffix
  subject.code = subject.code.split('_DELETED_')[0] as string;
  subject.name = subject.name.split('_DELETED_')[0] as string;

  // Verify there's no conflict with active subjects
  const existingCode = await Subject.findOne({ code: subject.code, isDeleted: false } as any);
  if (existingCode) return next(new AppError('Cannot restore: Subject code is now used by an active subject', 400));

  const existingName = await Subject.findOne({ name: subject.name, isDeleted: false } as any);
  if (existingName) return next(new AppError('Cannot restore: Subject name is now used by an active subject', 400));

  subject.isDeleted = false;
  subject.deletedAt = null as any;
  await subject.save();

  res.status(200).json({
    status: 'success',
    data: { subject }
  });
});
