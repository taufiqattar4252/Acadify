import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Clock, Eye } from 'lucide-react';
import { Question } from '@/services/questionApi';

interface SortableQuestionItemProps {
  id: string;
  question: Question;
  index: number;
  onRemove: (id: string) => void;
  onPreview: (question: Question) => void;
}

export function SortableQuestionItem({ id, question, index, onRemove, onPreview }: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-4 p-4 rounded-xl border bg-white transition-all ${
        isDragging ? 'shadow-lg border-primary-500 scale-[1.02] z-10' : 'border-border hover:border-border'
      }`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-muted-foreground rounded"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-2 items-start">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <div 
              className="text-sm text-foreground font-medium line-clamp-2"
              dangerouslySetInnerHTML={{ __html: question.questionText }}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPreview(question)}
              className="p-1.5 text-muted-foreground hover:text-primary-600 rounded transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(question._id)}
              className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 ml-8 text-xs text-muted-foreground">
          <span className="font-medium text-muted-foreground">{question.subject?.name} - {question.chapter?.name}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {question.estimatedTime}s</span>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${
            question.difficulty === 'Easy' ? 'bg-success-light text-success' : 
            question.difficulty === 'Medium' ? 'bg-warning-light text-warning' : 
            'bg-destructive-light text-destructive'
          }`}>
            {question.difficulty}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground border border-border">
            +{question.positiveMarks} / -{question.negativeMarks}
          </span>
          {question.pyqYears && question.pyqYears.length > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-primary-light text-primary border border-purple-200">
              PYQ {question.pyqYears[0]} {question.pyqYears.length > 1 ? `+${question.pyqYears.length - 1}` : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
