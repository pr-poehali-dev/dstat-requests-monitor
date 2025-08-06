import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsTabProps {
  wsConnected: boolean;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ wsConnected }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>Настройки сервера</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">IP сервера</label>
            <input 
              type="text" 
              value="77.110.99.3" 
              className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md text-white"
              readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium">Порт мониторинга</label>
            <input 
              type="text" 
              defaultValue="8080" 
              className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Интервал обновления (сек)</label>
            <input 
              type="number" 
              defaultValue="2" 
              className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle>WebSocket соединение</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${wsConnected ? 'text-green-400' : 'text-red-400'}`}>
              {wsConnected ? 'Подключено' : 'Отключено'}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium">WebSocket URL</label>
            <input 
              type="text" 
              value="ws://77.110.99.3:8080/ws" 
              className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md text-white font-mono text-sm"
              readOnly
            />
          </div>
          <p className="text-sm text-slate-400">
            {wsConnected 
              ? 'Получение данных в реальном времени от dstat'
              : 'Соединение недоступно, используются демо-данные'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;