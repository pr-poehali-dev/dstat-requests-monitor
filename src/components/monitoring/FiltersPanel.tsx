import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Filters {
  ip: string;
  domain: string;
  method: string;
  statusCode: string;
  minResponseTime: number;
}

interface FiltersPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  clearFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ 
  filters, 
  setFilters, 
  clearFilters, 
  filteredCount, 
  totalCount 
}) => {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={20} className="text-orange-400" />
            Фильтры
          </div>
          <Button onClick={clearFilters} variant="outline" size="sm">
            <Icon name="X" size={16} className="mr-1" />
            Очистить
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">IP адрес</label>
            <Input
              placeholder="192.168.1.1"
              value={filters.ip}
              onChange={(e) => setFilters(prev => ({ ...prev, ip: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Домен</label>
            <Input
              placeholder="api.example.com"
              value={filters.domain}
              onChange={(e) => setFilters(prev => ({ ...prev, domain: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">HTTP метод</label>
            <Select value={filters.method} onValueChange={(value) => setFilters(prev => ({ ...prev, method: value }))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Все методы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все методы</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Статус код</label>
            <Select value={filters.statusCode} onValueChange={(value) => setFilters(prev => ({ ...prev, statusCode: value }))}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Все коды" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Все коды</SelectItem>
                <SelectItem value="2">2xx (Успешные)</SelectItem>
                <SelectItem value="3">3xx (Перенаправления)</SelectItem>
                <SelectItem value="4">4xx (Клиентские ошибки)</SelectItem>
                <SelectItem value="5">5xx (Серверные ошибки)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">Мин. время (мс)</label>
            <Input
              type="number"
              placeholder="0"
              value={filters.minResponseTime || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, minResponseTime: parseInt(e.target.value) || 0 }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        {(filters.ip || filters.domain || filters.method || filters.statusCode || filters.minResponseTime > 0) && (
          <div className="mt-4 p-3 bg-slate-700 rounded-lg">
            <p className="text-sm text-slate-300">
              Найдено запросов: <span className="font-bold text-blue-400">{filteredCount}</span> из {totalCount}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltersPanel;