import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Request {
  id: string;
  method: string;
  url: string;
  status: number;
  responseTime: number;
  timestamp: Date;
  size: number;
  ip: string;
}

interface Filters {
  ip: string;
  domain: string;
  method: string;
  statusCode: string;
  minResponseTime: number;
}

interface RealTimeRequestsProps {
  requests: Request[];
  filteredRequests: Request[];
  filters: Filters;
  getMethodColor: (method: string) => string;
  getStatusColor: (status: number) => string;
}

const RealTimeRequests: React.FC<RealTimeRequestsProps> = ({
  requests,
  filteredRequests,
  filters,
  getMethodColor,
  getStatusColor
}) => {
  const hasFilters = filters.ip || filters.domain || filters.method || filters.statusCode || filters.minResponseTime > 0;
  const displayRequests = filteredRequests.length > 0 ? filteredRequests : requests;

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Activity" size={20} className="text-blue-400" />
          Запросы в реальном времени
        </CardTitle>
        <CardDescription>
          Последние HTTP/HTTPS запросы с сервера 
          {hasFilters ? '(с учетом фильтров)' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayRequests.slice(0, 8).map((request) => (
            <div key={request.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
              <div className="flex items-center gap-4">
                <Badge className={`${getMethodColor(request.method)} text-white border-0`}>
                  {request.method}
                </Badge>
                <div className="flex-1">
                  <div className="font-mono text-sm text-white truncate max-w-md">{request.url}</div>
                  <div className="text-xs text-slate-400">{request.ip}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(request.status)} inline-block mr-2`}></div>
                  <span className="font-mono text-sm">{request.status}</span>
                </div>
                <div className="text-right text-sm">
                  <div className="text-white">{request.responseTime}ms</div>
                  <div className="text-slate-400">{Math.round(request.size / 1024)}KB</div>
                </div>
                <div className="text-xs text-slate-400 w-20">
                  {request.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {filteredRequests.length === 0 && hasFilters && (
            <div className="text-center py-8 text-slate-400">
              <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Нет запросов, соответствующих выбранным фильтрам</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeRequests;