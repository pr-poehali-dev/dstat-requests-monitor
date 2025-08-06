import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface LogsTabProps {
  requests: Request[];
  filteredRequests: Request[];
  filters: Filters;
  getMethodColor: (method: string) => string;
  getStatusColor: (status: number) => string;
}

const LogsTab: React.FC<LogsTabProps> = ({
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
        <CardTitle className="flex items-center justify-between">
          <div>Подробные логи запросов</div>
          <Badge variant="outline" className="text-slate-300">
            {displayRequests.length} записей
          </Badge>
        </CardTitle>
        <CardDescription>
          Полная информация о HTTP/HTTPS запросах {hasFilters ? '(с учетом фильтров)' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Время</TableHead>
              <TableHead>Метод</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Размер</TableHead>
              <TableHead>Время ответа</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRequests.slice(0, 25).map((request) => (
              <TableRow key={request.id} className="hover:bg-slate-700 transition-colors">
                <TableCell className="font-mono text-xs">
                  {request.timestamp.toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  <Badge className={`${getMethodColor(request.method)} text-white border-0 text-xs`}>
                    {request.method}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs max-w-xs">
                  <div className="truncate" title={request.url}>
                    {request.url}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`}></div>
                    <span className="font-mono text-sm">{request.status}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{request.ip}</TableCell>
                <TableCell className="text-xs">{Math.round(request.size / 1024)}KB</TableCell>
                <TableCell className="font-mono text-xs">
                  <span className={request.responseTime > 1000 ? 'text-red-400' : request.responseTime > 500 ? 'text-yellow-400' : 'text-green-400'}>
                    {request.responseTime}ms
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default LogsTab;