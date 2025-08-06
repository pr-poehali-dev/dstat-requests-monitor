import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import Icon from '@/components/ui/icon';

interface ChartDataPoint {
  time: string;
  requests: number;
  successful: number;
  errors: number;
  avgResponseTime: number;
}

interface TrafficChartsProps {
  chartData: ChartDataPoint[];
}

const TrafficCharts: React.FC<TrafficChartsProps> = ({ chartData }) => {
  return (
    <>
      {/* Traffic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-blue-400" />
              Трафик по времени
            </CardTitle>
            <CardDescription>Количество запросов за последние 20 минут</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Zap" size={20} className="text-purple-400" />
              Время ответа
            </CardTitle>
            <CardDescription>Среднее время ответа по минутам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#F8FAFC'
                    }}
                    formatter={(value) => [`${value}ms`, 'Время ответа']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgResponseTime" 
                    stroke="#A855F7" 
                    strokeWidth={3}
                    dot={{ fill: '#A855F7', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#A855F7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} className="text-green-400" />
            Успешные vs Ошибки
          </CardTitle>
          <CardDescription>Соотношение успешных запросов и ошибок</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#F8FAFC'
                  }}
                />
                <Bar dataKey="successful" fill="#10B981" name="Успешные" />
                <Bar dataKey="errors" fill="#EF4444" name="Ошибки" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TrafficCharts;