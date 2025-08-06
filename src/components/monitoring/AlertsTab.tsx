import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const AlertsTab: React.FC = () => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Bell" size={20} />
          Система уведомлений
        </CardTitle>
        <CardDescription>Настройка алертов для критических событий</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-slate-700 rounded-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-400">Высокий уровень ошибок</h4>
                <p className="text-sm text-slate-400">Более 10% запросов завершаются с ошибкой</p>
              </div>
              <Badge variant="destructive">Активен</Badge>
            </div>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-400">Медленные запросы</h4>
                <p className="text-sm text-slate-400">Время ответа больше 2 секунд</p>
              </div>
              <Badge variant="secondary">Отключен</Badge>
            </div>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-400">Высокая нагрузка</h4>
                <p className="text-sm text-slate-400">Более 1000 запросов в минуту</p>
              </div>
              <Badge variant="secondary">Отключен</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsTab;