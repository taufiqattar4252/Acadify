import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Question, { QuestionStatus } from '../models/Question';
import Subject from '../models/Subject';
import Chapter from '../models/Chapter';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import * as xlsx from 'xlsx';
import { IAdmin } from '../models/Admin';

// GET /api/admin/questions
export const getAllQuestions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  
  const search = req.query.search as string;
  const subject = req.query.subject as string;
  const chapter = req.query.chapter as string;
  const difficulty = req.query.difficulty as string;
  const status = req.query.status as string;
  const createdBy = req.query.createdBy as string;
  const pyqYear = req.query.pyqYear as string;
  const sort = req.query.sort as string || '-createdAt';

  let query: any = { isDeleted: false };

  if (subject) query.subject = new mongoose.Types.ObjectId(subject);
  if (chapter) query.chapter = new mongoose.Types.ObjectId(chapter);
  if (difficulty) query.difficulty = difficulty;
  if (status) query.status = status;
  if (createdBy) query.createdBy = new mongoose.Types.ObjectId(createdBy);
  if (pyqYear) query.pyqYears = Number(pyqYear);

  if (search) {
    query = {
      ...query,
      $or: [
        { questionText: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ]
    };
  }

  // Create sort object
  let sortObj: any = {};
  if (sort.startsWith('-')) {
    sortObj[sort.substring(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  // Use lean() for massive performance gains when fetching lists
  const questions = await Question.find(query)
    .populate('subject', 'name code color')
    .populate('chapter', 'name code')
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName')
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Question.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: questions.length,
    data: {
      questions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const getQuestion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const question = await Question.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any)
    .populate('subject', 'name code color')
    .populate('chapter', 'name code')
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName');
  
  if (!question) {
    return next(new AppError('No question found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { question }
  });
});

export const createQuestion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;
  
  // Clean pyqYears array: remove duplicates, sort desc
  let pyqYears = req.body.pyqYears || [];
  if (Array.isArray(pyqYears)) {
    pyqYears = (Array.from(new Set(pyqYears.map(Number))) as number[]).sort((a, b) => b - a);
  }

  const newQuestion = await Question.create({
    ...req.body,
    pyqYears,
    createdBy: adminId,
    updatedBy: adminId,
  });

  res.status(201).json({
    status: 'success',
    data: { question: newQuestion }
  });
});

export const updateQuestion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;

  const updateData = { ...req.body, updatedBy: adminId };
  if (updateData.pyqYears && Array.isArray(updateData.pyqYears)) {
    updateData.pyqYears = (Array.from(new Set(updateData.pyqYears.map(Number))) as number[]).sort((a, b) => b - a);
  }

  const question = await Question.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any,
    updateData,
    { new: true, runValidators: true }
  );

  if (!question) {
    return next(new AppError('No question found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { question }
  });
});

export const deleteQuestion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;
  const question = await Question.findById(req.params.id);

  if (!question || question.isDeleted) {
    return next(new AppError('No question found with that ID', 404));
  }

  await Question.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const toggleStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;
  const question = await Question.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: false } as any);

  if (!question) {
    return next(new AppError('No question found with that ID', 404));
  }

  question.status = question.status === QuestionStatus.PUBLISHED ? QuestionStatus.DRAFT : QuestionStatus.PUBLISHED;
  question.updatedBy = adminId;
  await question.save();

  res.status(200).json({
    status: 'success',
    data: { question }
  });
});

export const restoreQuestion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;
  const question = await Question.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string), isDeleted: true } as any);

  if (!question) {
    return next(new AppError('No deleted question found with that ID', 404));
  }

  question.isDeleted = false;
  question.deletedAt = null as any;
  question.status = QuestionStatus.DRAFT;
  question.updatedBy = adminId;
  await question.save();

  res.status(200).json({
    status: 'success',
    data: { question }
  });
});

export const duplicateQuestion = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req.user as IAdmin)._id;
  const original = await Question.findOne({ _id: new mongoose.Types.ObjectId(req.params.id as string) } as any).lean();

  if (!original) {
    return next(new AppError('No question found with that ID', 404));
  }

  const { _id, createdAt, updatedAt, id, ...rest } = original as any;

  const duplicatedOptions = rest.options.map((opt: any) => {
    const { _id, ...optRest } = opt;
    return optRest;
  });

  const duplicate = await Question.create({
    ...rest,
    options: duplicatedOptions,
    status: QuestionStatus.DRAFT, // Always draft on duplicate
    questionText: `${rest.questionText} (Copy)`,
    createdBy: adminId,
    updatedBy: adminId,
  });

  res.status(201).json({
    status: 'success',
    data: { question: duplicate }
  });
});

export const importQuestions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new AppError('Please upload an excel or csv file', 400));
  }

  const adminId = (req.user as IAdmin)._id;
  const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return next(new AppError('Excel file has no sheets', 400));
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) return next(new AppError('Failed to read worksheet', 400));
  const rows: any[] = xlsx.utils.sheet_to_json(worksheet);

  if (!rows || rows.length === 0) {
    return next(new AppError('No data found in the file', 400));
  }

  const subjects = await Subject.find({ isDeleted: false }).lean();
  const chapters = await Chapter.find({ isDeleted: false }).lean();

  const subjectMap = new Map();
  subjects.forEach(s => {
    subjectMap.set(s.name.toLowerCase().trim(), s._id.toString());
    subjectMap.set(s._id.toString(), s._id.toString());
  });

  const chapterMap = new Map();
  chapters.forEach(c => {
    chapterMap.set(c.name.toLowerCase().trim(), c._id.toString());
    chapterMap.set(c._id.toString(), c._id.toString());
  });

  const questionsToInsert = [];
  const errors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Basic extraction from flat row to nested object
      // Expected headers: subject, chapter, questionType, difficulty, positiveMarks, negativeMarks, estimatedTime, questionText, questionImage, explanation, explanationImage, opt1_text, opt1_isCorrect, opt2_text, opt2_isCorrect, opt3_text, opt3_isCorrect, opt4_text, opt4_isCorrect, tags
      
      const options = [];
      for (let j = 1; j <= 4; j++) {
        if (row[`opt${j}_text`]) {
          options.push({
            text: row[`opt${j}_text`],
            isCorrect: row[`opt${j}_isCorrect`] === 'true' || row[`opt${j}_isCorrect`] === true || row[`opt${j}_isCorrect`] === 1,
            image: row[`opt${j}_image`] || undefined
          });
        }
      }

      const subjectInput = row.subject ? String(row.subject).trim() : '';
      const chapterInput = row.chapter ? String(row.chapter).trim() : '';

      const subjectId = subjectMap.get(subjectInput.toLowerCase()) || subjectMap.get(subjectInput);
      const chapterId = chapterMap.get(chapterInput.toLowerCase()) || chapterMap.get(chapterInput);

      if (!subjectId) {
        throw new Error(`Subject "${subjectInput}" not found. Please provide a valid Subject name or ID.`);
      }
      if (!chapterId) {
        throw new Error(`Chapter "${chapterInput}" not found. Please provide a valid Chapter name or ID.`);
      }

      const q = {
        subject: new mongoose.Types.ObjectId(subjectId),
        chapter: new mongoose.Types.ObjectId(chapterId),
        questionType: row.questionType || 'Single Correct MCQ',
        difficulty: row.difficulty || 'Medium',
        positiveMarks: (row.positiveMarks !== undefined && row.positiveMarks !== '') ? Number(row.positiveMarks) : 4,
        negativeMarks: (row.negativeMarks !== undefined && row.negativeMarks !== '') ? Number(row.negativeMarks) : 1,
        estimatedTime: (row.estimatedTime !== undefined && row.estimatedTime !== '') ? Number(row.estimatedTime) : 60,
        pyqYears: row.pyqYears ? (Array.from(new Set(String(row.pyqYears).split(',').map(y => Number(y.trim())).filter(y => !isNaN(y)))) as number[]).sort((a, b) => b - a) : [],
        questionText: row.questionText,
        questionImage: row.questionImage,
        explanation: row.explanation,
        explanationImage: row.explanationImage,
        tags: row.tags ? String(row.tags).split(',').map(t => t.trim()) : [],
        options,
        status: (() => {
          if (row.status) {
            const inputStatus = String(row.status).trim();
            const formattedStatus = inputStatus.charAt(0).toUpperCase() + inputStatus.slice(1).toLowerCase();
            if (Object.values(QuestionStatus).includes(formattedStatus as QuestionStatus)) {
              return formattedStatus as QuestionStatus;
            }
          }
          return QuestionStatus.DRAFT;
        })(),
        createdBy: adminId,
        updatedBy: adminId,
      };

      // Ensure single correct MCQ
      const correctCount = options.filter(o => o.isCorrect).length;
      if (options.length < 2) throw new Error('Less than 2 options provided');
      if (q.questionType === 'Single Correct MCQ' && correctCount !== 1) {
        throw new Error('Single Correct MCQ must have exactly 1 correct option');
      }
      if (!row.questionText) throw new Error('questionText is required');

      questionsToInsert.push(q);
    } catch (err: any) {
      errors.push({ row: i + 2, error: err.message });
    }
  }

  if (questionsToInsert.length > 0) {
    await Question.insertMany(questionsToInsert);
  }

  res.status(200).json({
    status: 'success',
    data: {
      totalRows: rows.length,
      imported: questionsToInsert.length,
      errors
    }
  });
});

export const exportQuestions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search as string;
  const subject = req.query.subject as string;
  const chapter = req.query.chapter as string;
  const difficulty = req.query.difficulty as string;
  const status = req.query.status as string;
  const pyqYear = req.query.pyqYear as string;

  let query: any = { isDeleted: false };
  if (subject) query.subject = new mongoose.Types.ObjectId(subject);
  if (chapter) query.chapter = new mongoose.Types.ObjectId(chapter);
  if (difficulty) query.difficulty = difficulty;
  if (status) query.status = status;
  if (pyqYear) query.pyqYears = Number(pyqYear);
  if (search) {
    query = {
      ...query,
      $or: [
        { questionText: { $regex: search, $options: 'i' } },
      ]
    };
  }

  const questions = await Question.find(query)
    .populate('subject', 'name')
    .populate('chapter', 'name')
    .lean();

  const data = questions.map((q: any) => {
    const row: any = {
      subject: q.subject?._id?.toString() || '',
      subjectName: q.subject?.name || '',
      chapter: q.chapter?._id?.toString() || '',
      chapterName: q.chapter?.name || '',
      questionType: q.questionType,
      difficulty: q.difficulty,
      positiveMarks: q.positiveMarks,
      negativeMarks: q.negativeMarks,
      estimatedTime: q.estimatedTime,
      pyqYears: q.pyqYears ? q.pyqYears.join(', ') : '',
      questionText: q.questionText,
      questionImage: q.questionImage || '',
      explanation: q.explanation || '',
      explanationImage: q.explanationImage || '',
      tags: q.tags?.join(', ') || '',
      status: q.status,
    };

    q.options.forEach((opt: any, index: number) => {
      row[`opt${index + 1}_text`] = opt.text;
      row[`opt${index + 1}_isCorrect`] = opt.isCorrect;
      row[`opt${index + 1}_image`] = opt.image || '';
    });

    return row;
  });

  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Questions');

  const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="questions.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.status(200).send(buffer);
});
