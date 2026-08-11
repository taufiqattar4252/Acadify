import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import MockTest from '../models/MockTest';
import Question from '../models/Question';
import catchAsync from '../utils/catchAsync';
import { IAdmin } from '../models/Admin';

// @desc    Get all mock tests
// @route   GET /api/admin/mock-tests
// @access  Private/Admin
export const getAllMockTests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search as string;
  const status = req.query.status as string;
  const category = req.query.category as string;
  const createdBy = req.query.createdBy as string;
  const sort = req.query.sort as string || '-createdAt';

  let query: any = { isDeleted: false };
  if (status) query.status = status;
  if (category) query.category = category;
  if (createdBy) query.createdBy = new mongoose.Types.ObjectId(createdBy);

  if (search) {
    query = {
      ...query,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ],
    };
  }

  // Handle sorting (e.g., 'price', '-questionsCount')
  // We can't directly sort by questions array length in standard mongoose without aggregation, 
  // but if the user wants 'Questions Count', we might need an aggregation or we just sort normally for others.
  // We'll support Newest/Oldest/Price/Duration for now.
  let sortOption: any = {};
  if (sort === 'Newest') sortOption = { createdAt: -1 };
  else if (sort === 'Oldest') sortOption = { createdAt: 1 };
  else if (sort === 'Price') sortOption = { price: 1 };
  else if (sort === '-Price') sortOption = { price: -1 };
  else if (sort === 'Duration') sortOption = { duration: 1 };
  else if (sort === '-Duration') sortOption = { duration: -1 };
  else if (sort.startsWith('-')) sortOption[sort.substring(1)] = -1;
  else sortOption[sort] = 1;

  const tests = await MockTest.find(query)
    .populate('createdBy', 'name email')
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean(); // Lean for performance

  const total = await MockTest.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      tests,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get mock test by ID
// @route   GET /api/admin/mock-tests/:id
// @access  Private/Admin
export const getMockTestById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const test = await MockTest.findOne({
    _id: req.params.id,
    isDeleted: false,
  } as any)
    .populate({
      path: 'questions',
      select: 'questionText subject chapter difficulty positiveMarks negativeMarks estimatedTime pyqYears status tags',
      populate: [
        { path: 'subject', select: 'name' },
        { path: 'chapter', select: 'name' },
      ]
    })
    .lean();

  if (!test) {
    res.status(404);
    throw new Error('Mock test not found');
  }

  res.status(200).json({
    success: true,
    data: { test },
  });
});

// @desc    Create mock test
// @route   POST /api/admin/mock-tests
// @access  Private/Admin
export const createMockTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;

  // Ensure unique slug
  const existing = await MockTest.findOne({ slug: req.body.slug } as any);
  if (existing) {
    res.status(400);
    throw new Error('A mock test with this slug already exists');
  }

  // Deduplicate questions array
  let questions = req.body.questions || [];
  if (Array.isArray(questions)) {
    questions = [...new Set(questions)]; // ensure unique ObjectIds strings
  }

  const newTest = await MockTest.create({
    ...req.body,
    questions,
    createdBy: adminId,
    updatedBy: adminId,
  });

  res.status(201).json({
    success: true,
    data: { test: newTest },
  });
});

// @desc    Update mock test
// @route   PUT /api/admin/mock-tests/:id
// @access  Private/Admin
export const updateMockTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;

  if (req.body.slug) {
    const existing = await MockTest.findOne({ slug: req.body.slug, _id: { $ne: req.params.id } } as any);
    if (existing) {
      res.status(400);
      throw new Error('A mock test with this slug already exists');
    }
  }

  const updateData = { ...req.body, updatedBy: adminId };

  if (updateData.questions && Array.isArray(updateData.questions)) {
    updateData.questions = [...new Set(updateData.questions)];
  }

  const test = await (MockTest as any).findOneAndUpdate(
    { _id: req.params.id, isDeleted: false } as any,
    updateData as any,
    { new: true, runValidators: true }
  );

  if (!test) {
    res.status(404);
    throw new Error('Mock test not found');
  }

  res.status(200).json({
    success: true,
    data: { test },
  });
});

// @desc    Update mock test status
// @route   PATCH /api/admin/mock-tests/:id/status
// @access  Private/Admin
export const updateMockTestStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;
  const { status } = req.body;

  const test = await (MockTest as any).findOneAndUpdate(
    { _id: req.params.id, isDeleted: false } as any,
    { status, updatedBy: adminId } as any,
    { new: true, runValidators: true }
  );

  if (!test) {
    res.status(404);
    throw new Error('Mock test not found');
  }

  res.status(200).json({
    success: true,
    data: { test },
  });
});

// @desc    Hard delete mock test
// @route   DELETE /api/admin/mock-tests/:id
// @access  Private/Admin
export const deleteMockTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const test = await (MockTest as any).findByIdAndDelete(req.params.id);

  if (!test) {
    res.status(404);
    throw new Error('Mock test not found');
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Restore soft-deleted mock test
// @route   PATCH /api/admin/mock-tests/:id/restore
// @access  Private/Admin
export const restoreMockTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;

  const test = await (MockTest as any).findOneAndUpdate(
    { _id: req.params.id, isDeleted: true } as any,
    { isDeleted: false, $unset: { deletedAt: 1 }, updatedBy: adminId } as any,
    { new: true }
  );

  if (!test) {
    res.status(404);
    throw new Error('Mock test not found or not deleted');
  }

  res.status(200).json({
    success: true,
    data: { test },
  });
});

// @desc    Clone a mock test
// @route   POST /api/admin/mock-tests/:id/clone
// @access  Private/Admin
export const cloneMockTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;

  const originalTest = await MockTest.findOne({ _id: req.params.id, isDeleted: false } as any).lean();
  if (!originalTest) {
    res.status(404);
    throw new Error('Mock test not found');
  }

  // Exclude unique identifiers and meta fields
  const { _id, slug, title, status, createdAt, updatedAt, ...clonedData } = originalTest as any;

  // Generate unique slug for the clone
  let newSlug = `${slug}-copy`;
  let counter = 1;
  while (await MockTest.findOne({ slug: newSlug } as any)) {
    newSlug = `${slug}-copy-${counter}`;
    counter++;
  }

  const newTest = await MockTest.create({
    ...clonedData,
    title: `${title} - Copy`,
    slug: newSlug,
    status: 'Draft',
    createdBy: adminId,
    updatedBy: adminId,
  });

  res.status(201).json({
    success: true,
    data: { test: newTest },
  });
});
