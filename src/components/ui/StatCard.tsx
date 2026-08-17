import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'positive',
  iconBgColor = 'bg-amber-100',
  iconColor = 'text-amber-700',
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-5 border border-amber-100/60 shadow-festive hover:shadow-festive-lg transition-all duration-300 flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
        </div>
        <div className={cn('p-3 rounded-xl flex items-center justify-center', iconBgColor)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-gray-500 font-medium">{subtitle}</span>}
          {trend && (
            <span
              className={cn(
                'font-bold px-2 py-0.5 rounded-full text-[10px]',
                trendType === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : trendType === 'negative'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-gray-100 text-gray-700'
              )}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
