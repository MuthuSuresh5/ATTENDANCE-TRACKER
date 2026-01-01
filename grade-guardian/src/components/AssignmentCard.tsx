import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Assignment, AssignmentDisplayStatus } from '@/types';
import { getAssignmentStatus, getDaysUntilDeadline } from '@/data/mockData';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentCardProps {
  assignment: Assignment;
  showDescription?: boolean;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, showDescription = true }) => {
  const deadlineDate = new Date(assignment.deadline);
  const daysUntil = getDaysUntilDeadline(assignment.deadline);
  const status = getAssignmentStatus(assignment.deadline);

  const getStatusBadge = () => {
    switch (status) {
      case 'due-today':
        return (
          <Badge className="bg-attendance-warning text-white border-0">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Due Today
          </Badge>
        );
      case 'missed':
        return <Badge className="bg-attendance-danger text-white border-0">Missed</Badge>;
      case 'upcoming':
        if (daysUntil <= 2) {
          return <Badge className="bg-attendance-warning text-white border-0">Due Soon</Badge>;
        }
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const getCountdownBadge = () => {
    if (status === 'missed') return null;
    if (status === 'due-today') {
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-attendance-warning/20 attendance-warning-text">
          🚨 Due Today
        </span>
      );
    }
    if (daysUntil === 1) {
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-attendance-warning/20 attendance-warning-text">
          ⏳ 1 day left
        </span>
      );
    }
    if (daysUntil <= 3) {
      return (
        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-attendance-warning/20 attendance-warning-text">
          ⏳ {daysUntil} days left
        </span>
      );
    }
    return null;
  };

  const getTimeLabel = () => {
    if (status === 'missed') return 'Overdue';
    if (status === 'due-today') return 'Due Today';
    if (daysUntil === 1) return 'Due Tomorrow';
    return `${daysUntil} days left`;
  };

  const isMissed = status === 'missed';

  return (
    <Card className={`${isMissed ? 'border-attendance-danger bg-attendance-danger/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {getStatusBadge()}
              {getCountdownBadge()}
            </div>
            <h3 className={`font-semibold truncate ${isMissed ? 'text-attendance-danger' : 'text-foreground'}`}>
              {assignment.title}
            </h3>
            {showDescription && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {assignment.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar size={14} />
            <span>{format(deadlineDate, 'MMM d, yyyy')}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-medium ${
            isMissed ? 'attendance-danger-text' : 
            daysUntil <= 2 ? 'attendance-warning-text' : 'text-muted-foreground'
          }`}>
            <Clock size={14} />
            <span>{getTimeLabel()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
