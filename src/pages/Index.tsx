import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

// Mock data generator for demonstration
const generateMockRequest = () => {
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  const statuses = [200, 201, 400, 401, 403, 404, 500, 502];
  const domains = ['api.example.com', 'cdn.example.com', 'auth.example.com', 'static.example.com'];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    method: methods[Math.floor(Math.random() * methods.length)],
    url: `https://${domains[Math.floor(Math.random() * domains.length)]}/api/${Math.random().toString(36).substr(2, 6)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    responseTime: Math.floor(Math.random() * 2000) + 10,
    timestamp: new Date(),
    size: Math.floor(Math.random() * 50000) + 1000,
    userAgent: 'Mozilla/5.0 (compatible; Bot/1.0)',
    ip: '192.168.1.' + Math.floor(Math.random() * 255)
  };
};

const Index = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    errors: 0,
    avgResponseTime: 0
  });
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Initialize with some mock data
    const initialRequests = Array.from({ length: 10 }, generateMockRequest);
    setRequests(initialRequests);
    updateStats(initialRequests);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        const newRequest = generateMockRequest();
        setRequests(prev => [newRequest, ...prev.slice(0, 99)]); // Keep last 100 requests
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isLive]);

  useEffect(() => {
    updateStats(requests);
  }, [requests]);

  const updateStats = (requestsList: any[]) => {
    if (requestsList.length === 0) return;
    
    const total = requestsList.length;
    const successful = requestsList.filter(req => req.status >= 200 && req.status < 400).length;
    const errors = total - successful;
    const avgResponseTime = Math.round(
      requestsList.reduce((sum, req) => sum + req.responseTime, 0) / total
    );

    setStats({ total, successful, errors, avgResponseTime });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-500';
    if (status >= 300 && status < 400) return 'bg-yellow-500';
    if (status >= 400 && status < 500) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMethodColor = (method: string) => {
    const colors: { [key: string]: string } = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-orange-500',
      DELETE: 'bg-red-500',
      PATCH: 'bg-purple-500'
    };
    return colors[method] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">HTTP Monitoring System</h1>
            <p className="text-slate-400">Сервер: 77.110.99.3 • Режим реального времени</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isLive ? 'Online' : 'Offline'}</span>
            </div>
            <Button 
              variant={isLive ? "destructive" : "default"} 
              onClick={() => setIsLive(!isLive)}
              className="gap-2"
            >
              <Icon name={isLive ? "Pause" : "Play"} size={16} />
              {isLive ? 'Pause' : 'Start'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Main Content */}
      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800">
          <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
          <TabsTrigger value="statistics">Статистика</TabsTrigger>
          <TabsTrigger value="logs">Логи</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="alerts">Алерты</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          {/* Real-time Requests Chart */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={20} className="text-blue-400" />
                Запросы в реальном времени
              </CardTitle>
              <CardDescription>Последние HTTP/HTTPS запросы с сервера</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.slice(0, 8).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
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
        </TabsContent>

        <TabsContent value="logs">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Подробные логи запросов</CardTitle>
              <CardDescription>Полная информация о HTTP/HTTPS запросах</CardDescription>
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
                  {requests.slice(0, 15).map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-xs">
                        {request.timestamp.toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getMethodColor(request.method)} text-white border-0 text-xs`}>
                          {request.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-xs truncate">
                        {request.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`}></div>
                          <span className="font-mono text-sm">{request.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{request.ip}</TableCell>
                      <TableCell className="text-xs">{Math.round(request.size / 1024)}KB</TableCell>
                      <TableCell className="font-mono text-xs">{request.responseTime}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
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
        </TabsContent>

        <TabsContent value="settings">
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
                <CardTitle>Фильтры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Показывать только ошибки</label>
                  <div className="mt-2">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm">Статус коды 4xx и 5xx</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Минимальное время ответа (мс)</label>
                  <input 
                    type="number" 
                    defaultValue="0" 
                    className="w-full p-2 mt-1 bg-slate-700 border border-slate-600 rounded-md text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;