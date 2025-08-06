import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const ApiTab: React.FC = () => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Code" size={20} />
          API Endpoints
        </CardTitle>
        <CardDescription>Интеграция с dstat и API мониторинга</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-500 text-white">GET</Badge>
              <code className="text-sm">/api/stats</code>
            </div>
            <p className="text-sm text-slate-400">Получение статистики сервера</p>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500 text-white">GET</Badge>
              <code className="text-sm">/api/logs</code>
            </div>
            <p className="text-sm text-slate-400">Получение логов запросов</p>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-500 text-white">POST</Badge>
              <code className="text-sm">/api/alerts</code>
            </div>
            <p className="text-sm text-slate-400">Настройка уведомлений</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTab;