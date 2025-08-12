import React from 'react';

interface ActivityItemProps {
  title: string;
  description: string;
  timestamp: string;
  status: 'submitted' | 'approved' | 'pending' | 'rejected' | 'verified';
  user?: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  title,
  description,
  timestamp,
  status,
  user
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-info';
      case 'approved':
        return 'bg-success';
      case 'pending':
        return 'bg-warning';
      case 'rejected':
        return 'bg-destructive';
      case 'verified':
        return 'bg-accent';
      default:
        return 'bg-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex items-start space-x-4 p-4 hover:bg-card-hover rounded-lg transition-colors">
      <div className="flex-shrink-0 mt-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {user && (
            <span className="text-xs text-muted-foreground">by {user}</span>
          )}
          <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;