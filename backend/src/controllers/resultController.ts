import { Request, Response, NextFunction } from 'express';
import Attempt from '../models/Attempt';
import Question, { QuestionDifficulty, IQuestion } from '../models/Question';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import mongoose from 'mongoose';

// @desc    Get all attempts for the logged-in student
// @route   GET /api/student/results
// @access  Private (Student)
export const getStudentAttempts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const attempts = await Attempt.find({ user: req.user._id })
    .populate({
      path: 'mockTest',
      select: 'title titleSlug duration totalMarks questions',
    })
    .sort({ createdAt: -1 })
    .lean();

  // We map the attempts to add some derived stats if needed
  const enrichedAttempts = attempts.map((attempt: any) => ({
    _id: attempt._id,
    mockTestId: attempt.mockTest?._id,
    mockTestTitle: attempt.mockTest?.title,
    mockTestSlug: attempt.mockTest?.titleSlug,
    score: attempt.score,
    totalMarks: attempt.mockTest?.totalMarks || 0,
    percentage: attempt.percentage,
    correct: attempt.correct,
    wrong: attempt.wrong,
    skipped: attempt.skipped,
    timeTaken: attempt.duration,
    submittedAt: attempt.submittedAt || attempt.createdAt,
  }));

  res.status(200).json({
    success: true,
    data: enrichedAttempts,
  });
});

// @desc    Get detailed analytics for a specific attempt
// @route   GET /api/student/results/:attemptId
// @access  Private (Student)
export const getAttemptDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { attemptId } = req.params;

  // 1. Fetch Attempt with deep populate
  const attempt = await Attempt.findOne({ _id: attemptId, user: req.user._id } as any)
    .populate({
      path: 'mockTest',
      select: 'title titleSlug duration totalMarks questions',
    })
    .lean() as any;

  if (!attempt) {
    return next(new AppError('Attempt not found', 404));
  }

  // 2. Fetch all questions associated with this mock test to calculate analytics
  const questionIds = attempt.mockTest.questions;
  const questions = await Question.find({ _id: { $in: questionIds } })
    .populate('subject', 'name')
    .populate('chapter', 'name')
    .lean() as any[];

  // 3. Map student answers for quick lookup
  const studentAnswersMap = new Map();
  attempt.answers.forEach((ans: any) => {
    studentAnswersMap.set(ans.questionId.toString(), ans);
  });

  // 4. Analytics Data Structures
  const subjectAnalytics: Record<string, any> = {};
  const chapterAnalytics: Record<string, any> = {};
  const difficultyAnalytics: Record<string, any> = {
    [QuestionDifficulty.EASY]: { correct: 0, wrong: 0, skipped: 0, total: 0 },
    [QuestionDifficulty.MEDIUM]: { correct: 0, wrong: 0, skipped: 0, total: 0 },
    [QuestionDifficulty.HARD]: { correct: 0, wrong: 0, skipped: 0, total: 0 },
  };

  const questionReview: any[] = [];

  // 5. Process each question
  for (const q of questions) {
    const subjectName = q.subject?.name || 'Unknown Subject';
    const chapterName = q.chapter?.name || 'Unknown Chapter';
    const diff = q.difficulty || QuestionDifficulty.MEDIUM;

    // Initialize Subject
    if (!subjectAnalytics[subjectName]) {
      subjectAnalytics[subjectName] = { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxScore: 0 };
    }
    // Initialize Chapter
    if (!chapterAnalytics[chapterName]) {
      chapterAnalytics[chapterName] = { correct: 0, wrong: 0, skipped: 0, total: 0, score: 0, maxScore: 0 };
    }

    const studentAns = studentAnswersMap.get(q._id.toString());
    const isSkipped = !studentAns || !studentAns.selectedOptionId;
    let isCorrect = false;
    let isWrong = false;
    let marksAwarded = 0;

    const correctOption = q.options.find((opt: any) => opt.isCorrect);

    if (isSkipped) {
      subjectAnalytics[subjectName].skipped++;
      chapterAnalytics[chapterName].skipped++;
      if (difficultyAnalytics[diff]) difficultyAnalytics[diff].skipped++;
    } else {
      if (studentAns.selectedOptionId.toString() === correctOption?._id.toString()) {
        isCorrect = true;
        marksAwarded = q.positiveMarks;
        subjectAnalytics[subjectName].correct++;
        chapterAnalytics[chapterName].correct++;
        if (difficultyAnalytics[diff]) difficultyAnalytics[diff].correct++;
      } else {
        isWrong = true;
        marksAwarded = -q.negativeMarks;
        subjectAnalytics[subjectName].wrong++;
        chapterAnalytics[chapterName].wrong++;
        if (difficultyAnalytics[diff]) difficultyAnalytics[diff].wrong++;
      }
    }

    subjectAnalytics[subjectName].total++;
    subjectAnalytics[subjectName].maxScore += q.positiveMarks;
    subjectAnalytics[subjectName].score += marksAwarded;

    chapterAnalytics[chapterName].total++;
    chapterAnalytics[chapterName].maxScore += q.positiveMarks;
    chapterAnalytics[chapterName].score += marksAwarded;

    if (difficultyAnalytics[diff]) difficultyAnalytics[diff].total++;

    // Build Question Review object
    questionReview.push({
      _id: q._id,
      questionText: q.questionText,
      questionImage: q.questionImage,
      options: q.options.map((opt: any) => ({
        _id: opt._id,
        text: opt.text,
        image: opt.image,
        isCorrect: opt.isCorrect,
      })),
      explanation: q.explanation,
      explanationImage: q.explanationImage,
      subject: subjectName,
      chapter: chapterName,
      difficulty: diff,
      studentAnswer: studentAns?.selectedOptionId || null,
      isCorrect,
      isSkipped,
      isWrong,
      marksAwarded,
      positiveMarks: q.positiveMarks,
      negativeMarks: q.negativeMarks,
      timeSpent: studentAns?.timeSpent || 0, // if we track it per question
    });
  }

  // 6. Calculate Aggregated Metrics
  Object.values(subjectAnalytics).forEach(sub => {
    sub.accuracy = (sub.correct + sub.wrong) > 0 ? (sub.correct / (sub.correct + sub.wrong)) * 100 : 0;
    sub.percentage = sub.maxScore > 0 ? (sub.score / sub.maxScore) * 100 : 0;
  });

  Object.values(chapterAnalytics).forEach(chap => {
    chap.accuracy = (chap.correct + chap.wrong) > 0 ? (chap.correct / (chap.correct + chap.wrong)) * 100 : 0;
    chap.percentage = chap.maxScore > 0 ? (chap.score / chap.maxScore) * 100 : 0;
  });

  Object.values(difficultyAnalytics).forEach(diff => {
    diff.accuracy = (diff.correct + diff.wrong) > 0 ? (diff.correct / (diff.correct + diff.wrong)) * 100 : 0;
  });

  // 7. Calculate Rank & Percentile
  // Find how many total attempts exist for this mock test
  const totalAttemptsForMock = await Attempt.countDocuments({ mockTest: attempt.mockTest._id });
  // Find how many scored higher than this attempt
  const higherScoresCount = await Attempt.countDocuments({ 
    mockTest: attempt.mockTest._id, 
    score: { $gt: attempt.score } 
  });
  
  const rank = higherScoresCount + 1;
  const percentile = totalAttemptsForMock > 0 
    ? ((totalAttemptsForMock - rank) / totalAttemptsForMock) * 100 
    : 100;

  // 8. Generate Recommendations
  const recommendations: string[] = [];
  const lowAccuracyChapters = Object.entries(chapterAnalytics)
    .filter(([_, metrics]) => metrics.total > 0 && metrics.accuracy < 50)
    .sort((a, b) => a[1].accuracy - b[1].accuracy)
    .slice(0, 3); // Top 3 worst chapters

  if (lowAccuracyChapters.length > 0) {
    lowAccuracyChapters.forEach(([chapterName, metrics]) => {
      recommendations.push(`Revise ${chapterName} - Accuracy is currently ${metrics.accuracy.toFixed(1)}%.`);
    });
  } else {
    recommendations.push("Great job! Keep practicing to maintain your high accuracy.");
  }

  if (difficultyAnalytics[QuestionDifficulty.HARD].accuracy < 40 && difficultyAnalytics[QuestionDifficulty.HARD].total > 0) {
    recommendations.push("Focus on Hard difficulty questions to improve your top-end score.");
  }

  // 9. Format response
  res.status(200).json({
    success: true,
    data: {
      summary: {
        attemptId: attempt._id,
        mockTestTitle: attempt.mockTest.title,
        score: attempt.score,
        totalMarks: attempt.mockTest.totalMarks || Object.values(subjectAnalytics).reduce((sum, s) => sum + s.maxScore, 0),
        correct: attempt.correct,
        wrong: attempt.wrong,
        skipped: attempt.skipped,
        percentage: attempt.percentage,
        accuracy: (attempt.correct + attempt.wrong) > 0 ? (attempt.correct / (attempt.correct + attempt.wrong)) * 100 : 0,
        timeTaken: attempt.duration,
        totalDuration: attempt.mockTest.duration * 60,
        submittedAt: attempt.submittedAt || attempt.createdAt,
        rank,
        percentile: Math.max(0, percentile),
        totalStudents: totalAttemptsForMock,
      },
      analytics: {
        subjects: subjectAnalytics,
        chapters: chapterAnalytics,
        difficulty: difficultyAnalytics,
      },
      recommendations,
      questionReview,
    },
  });
});

// @desc    Get high level admin analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAdminAnalytics = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  
  // Basic stats
  const totalAttempts = await Attempt.countDocuments();
  
  // Aggregation for average score, high/low, average time
  const stats = await Attempt.aggregate([
    {
      $group: {
        _id: null,
        averageScore: { $avg: "$score" },
        highestScore: { $max: "$score" },
        lowestScore: { $min: "$score" },
        averageTimeTaken: { $avg: "$duration" },
        totalScore: { $sum: "$score" }
      }
    }
  ]);

  const result = stats.length > 0 ? stats[0] : {
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    averageTimeTaken: 0
  };

  res.status(200).json({
    success: true,
    data: {
      totalAttempts,
      averageScore: result.averageScore,
      highestScore: result.highestScore,
      lowestScore: result.lowestScore,
      averageTimeTaken: result.averageTimeTaken,
    }
  });
});

// @desc    Get paginated attempts for admin
// @route   GET /api/admin/attempts
// @access  Private (Admin)
export const getAllAttempts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // We could add search by student email/name if we populate and filter, 
  // but for simplicity we'll just populate.
  const query = {};

  const total = await Attempt.countDocuments(query);
  const attempts = await Attempt.find(query)
    .populate('user', 'fullName email')
    .populate('mockTest', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    data: attempts,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});
