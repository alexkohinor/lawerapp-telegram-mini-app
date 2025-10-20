'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TimelineEvent as TimelineEventType } from '@/types/dispute';

interface TimelineProps {
  events: TimelineEventType[];
  className?: string;
  showIcons?: boolean;
}

interface TimelineItemProps {
  event: TimelineEventType;
  isLast?: boolean;
  showIcon?: boolean;
}

const eventIcons = {
  CREATED: '🆕',
  UPDATED: '✏️',
  DOCUMENT_ADDED: '📄',
  STATUS_CHANGED: '🔄',
  COMMENT_ADDED: '💬',
};

const eventColors = {
  CREATED: 'bg-green-100 text-green-800',
  UPDATED: 'bg-blue-100 text-blue-800',
  DOCUMENT_ADDED: 'bg-purple-100 text-purple-800',
  STATUS_CHANGED: 'bg-orange-100 text-orange-800',
  COMMENT_ADDED: 'bg-gray-100 text-gray-800',
};

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  event, 
  isLast = false, 
  showIcon = true 
}) => {
  const icon = eventIcons[event.type] || '📝';
  const colorClass = eventColors[event.type] || eventColors.COMMENT_ADDED;

  return (
    <div className="relative flex items-start space-x-3">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-4 top-8 h-full w-0.5 bg-gray-200" />
      )}
      
      {/* Icon */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
            colorClass
          )}
        >
          {showIcon ? icon : event.type.charAt(0)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {event.description}
          </p>
          <time className="text-xs text-gray-500">
            {new Date(event.createdAt).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
        <div className="mt-1">
          <span className="text-xs text-gray-500">
            {event.type.replace('_', ' ').toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({ 
  events, 
  className = '',
  showIcons = true 
}) => {
  if (events.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <div className="text-gray-500 text-sm">
          События не найдены
        </div>
      </div>
    );
  }

  return (
    <div className={cn('timeline', className)}>
      <div className="flow-root">
        <ul className="-mb-8">
          {events.map((event, index) => (
            <li key={event.id} className="relative pb-8">
              <TimelineItem
                event={event}
                isLast={index === events.length - 1}
                showIcon={showIcons}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Timeline;
