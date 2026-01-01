import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-attendance-good/10 text-attendance-good';
      case 'warning':
        return 'bg-attendance-warning/10 text-attendance-warning';
      case 'danger':
        return 'bg-attendance-danger/10 text-attendance-danger';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg ${getVariantClasses()}`}>
            <Icon size={20} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
