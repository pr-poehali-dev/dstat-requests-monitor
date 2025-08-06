import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Request {
  method: string;
  status: number;
}

interface Stats {
  total: number;
}

interface StatisticsTabProps {
  requests: Request[];
  stats: Stats;
  getMethodColor: (method: string) => string;
  getStatusColor: (status: number) => string;
}

const StatisticsTab: React.FC<StatisticsTabProps> = ({ 
  requests, 
  stats, 
  getMethodColor, 
  getStatusColor 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Статистика по методам</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['GET', 'POST', 'PUT', 'DELETE'].map(method => {
              const count = requests.filter(r => r.method === method).length;
              const percentage = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getMethodColor(method)} text-white border-0 w-16`}>
                      {method}
                    </Badge>
                    <span className="text-sm">{count} запросов</span>
                  </div>
                  <div className="text-sm text-slate-400">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Коды ответов</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[200, 404, 500, 401].map(status => {
              const count = requests.filter(r => r.status === status).length;
              const percentage = stats.total ? (count / stats.total) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                    <span className="font-mono">{status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{count}</span>
                    <div className="text-sm text-slate-400 w-12">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsTab;