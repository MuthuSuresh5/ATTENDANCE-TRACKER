import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceCardProps {
  label: string;
  present: number;
  total: number;
  percentage: number;
  compact?: boolean;
}

export const getAttendanceColor = (percentage: number): string => {
  if (percentage >= 80) return 'attendance-good';
  if (percentage >= 75) return 'attendance-warning';
  return 'attendance-danger';
};

export const getAttendanceTextColor = (percentage: number): string => {
  if (percentage >= 80) return 'attendance-good-text';
  if (percentage >= 75) return 'attendance-warning-text';
  return 'attendance-danger-text';
};

export const getAttendanceLabel = (percentage: number): string => {
  if (percentage >= 80) return 'Safe';
  if (percentage >= 75) return 'Warning';
  return 'Risk';
};

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  label,
  present,
  total,
  percentage,
  compact = false,
}) => {
  const colorClass = getAttendanceColor(percentage);
  const textColorClass = getAttendanceTextColor(percentage);
  const statusLabel = getAttendanceLabel(percentage);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
        <span className="text-sm font-medium truncate flex-1">{label}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {present}/{total}
          </span>
          <span className={`text-sm font-bold ${textColorClass}`}>
            {percentage}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className={`text-3xl font-bold ${textColorClass}`}>{percentage}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {present} of {total} days
            </p>
          </div>
          <div className={`h-12 w-12 rounded-full ${colorClass} flex items-center justify-center`}>
            <span className="text-xs font-bold text-white">{statusLabel}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClass} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceCard;
