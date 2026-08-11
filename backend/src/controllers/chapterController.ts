import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Chapter from '../models/Chapter';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

export const getAllChapters = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search as string;
  const subjectFilter = req.query.subject as string;

  let query: any = { isDeleted: false };
  
  if (subjectFilter) {
    query.subject = subjectFilter;
  }

  if (search) {
    query = {
      ...query,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const chapters = await Chapter.find(query)
    .populate('subject', 'name code color')
    .sort({ 'subject': 1, displayOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Chapter.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: chapters.length,
    data: {
      chapters,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getChapter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any)
    .populate('subject', 'name code color');
  
  if (!chapter) {
    return next(new AppError('No chapter found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { chapter }
  });
});

export const createChapter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, name, subject } = req.body;

  const existingCode = await Chapter.findOne({ code, isDeleted: false } as any);
  if (existingCode) {
    return next(new AppError('A chapter with this code already exists', 400));
  }

  const existingNameInSubject = await Chapter.findOne({ name, subject, isDeleted: false } as any);
  if (existingNameInSubject) {
    return next(new AppError('A chapter with this name already exists in this subject', 400));
  }

  const chapter = await Chapter.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { chapter }
  });
});

export const updateChapter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any);

  if (!chapter) {
    return next(new AppError('No chapter found with that ID', 404));
  }

  if (req.body.code && req.body.code !== chapter.code) {
    const existingCode = await Chapter.findOne({ code: req.body.code, isDeleted: false } as any);
    if (existingCode) return next(new AppError('Chapter code already in use', 400));
  }

  const newSubject = req.body.subject || chapter.subject;
  const newName = req.body.name || chapter.name;

  if (newName !== chapter.name || newSubject.toString() !== chapter.subject.toString()) {
    const existingName = await Chapter.findOne({ 
      name: newName, 
      subject: newSubject, 
      isDeleted: false,
      _id: { $ne: chapter._id }
    } as any);
    if (existingName) return next(new AppError('Chapter name already in use within this subject', 400));
  }

  Object.assign(chapter, req.body);
  await chapter.save();

  res.status(200).json({
    status: 'success',
    data: { chapter }
  });
});

export const deleteChapter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findById(req.params.id);

  if (!chapter || chapter.isDeleted) {
    return next(new AppError('No chapter found with that ID', 404));
  }

  chapter.isDeleted = true;
  chapter.deletedAt = new Date();
  chapter.isActive = false;
  
  chapter.code = `${chapter.code}_DELETED_${Date.now()}`;
  chapter.name = `${chapter.name}_DELETED_${Date.now()}`;

  await chapter.save();

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const toggleStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any);

  if (!chapter) {
    return next(new AppError('No chapter found with that ID', 404));
  }

  chapter.isActive = !chapter.isActive;
  await chapter.save();

  res.status(200).json({
    status: 'success',
    data: { chapter }
  });
});

export const restoreChapter = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const chapter = await Chapter.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: true } as any);

  if (!chapter) {
    return next(new AppError('No deleted chapter found with that ID', 404));
  }

  chapter.code = chapter.code.split('_DELETED_')[0] as string;
  chapter.name = chapter.name.split('_DELETED_')[0] as string;

  const existingCode = await Chapter.findOne({ code: chapter.code, isDeleted: false } as any);
  if (existingCode) return next(new AppError('Cannot restore: Chapter code is now used by an active chapter', 400));

  const existingName = await Chapter.findOne({ name: chapter.name, subject: chapter.subject, isDeleted: false } as any);
  if (existingName) return next(new AppError('Cannot restore: Chapter name is now used within this subject', 400));

  chapter.isDeleted = false;
  chapter.deletedAt = null as any;
  await chapter.save();

  res.status(200).json({
    status: 'success',
    data: { chapter }
  });
});
