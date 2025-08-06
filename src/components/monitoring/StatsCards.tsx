import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Stats {
  total: number;
  successful: number;
  errors: number;
  avgResponseTime: number;
}

interface StatsCardsProps {
  stats: Stats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Globe" size={20} className="text-blue-400" />
            Всего запросов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <p className="text-slate-400 text-sm">За последние 24 часа</p>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="CheckCircle" size={20} className="text-green-400" />
            Успешные
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-400">{stats.successful}</div>
          <Progress 
            value={stats.total ? (stats.successful / stats.total) * 100 : 0} 
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="AlertTriangle" size={20} className="text-red-400" />
            Ошибки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-400">{stats.errors}</div>
          <Progress 
            value={stats.total ? (stats.errors / stats.total) * 100 : 0} 
            className="mt-2 h-2"
          />
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Clock" size={20} className="text-purple-400" />
            Время ответа
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.avgResponseTime}ms</div>
          <p className="text-slate-400 text-sm">Среднее время</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;