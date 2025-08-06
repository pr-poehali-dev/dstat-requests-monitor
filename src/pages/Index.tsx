import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
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
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    errors: 0,
    avgResponseTime: 0
  });
  const [isLive, setIsLive] = useState(true);
  const [filters, setFilters] = useState({
    ip: '',
    domain: '',
    method: '',
    statusCode: '',
    minResponseTime: 0
  });
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  // WebSocket connection setup
  const connectWebSocket = useCallback(() => {
    try {
      // Simulate WebSocket connection to dstat server
      const wsUrl = `ws://77.110.99.3:8080/ws`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected to dstat server');
        setWsConnected(true);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const newRequest = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date()
          };
          setRequests(prev => [newRequest, ...prev.slice(0, 199)]); // Keep last 200 requests
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onerror = () => {
        console.log('WebSocket error, falling back to mock data');
        setWsConnected(false);
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setWsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (isLive) connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.log('WebSocket not available, using mock data');
      setWsConnected(false);
    }
  }, [isLive]);

  useEffect(() => {
    // Initialize with some mock data
    const initialRequests = Array.from({ length: 20 }, generateMockRequest);
    setRequests(initialRequests);
    updateStats(initialRequests);
    updateChartData(initialRequests);

    // Try to connect WebSocket, fallback to mock data
    if (isLive) {
      connectWebSocket();
    }

    // Fallback: simulate real-time updates if WebSocket fails
    const interval = setInterval(() => {
      if (isLive && !wsConnected) {
        const newRequest = generateMockRequest();
        setRequests(prev => [newRequest, ...prev.slice(0, 199)]);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isLive, connectWebSocket, wsConnected]);

  useEffect(() => {
    updateStats(requests);
    updateChartData(requests);
    applyFilters();
  }, [requests]);

  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

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

  const updateChartData = (requestsList: any[]) => {
    // Group requests by minute for chart
    const groupedData = requestsList.reduce((acc, req) => {
      const minute = new Date(req.timestamp).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      if (!acc[minute]) {
        acc[minute] = {
          time: minute,
          requests: 0,
          successful: 0,
          errors: 0,
          avgResponseTime: 0,
          totalResponseTime: 0
        };
      }
      
      acc[minute].requests += 1;
      acc[minute].totalResponseTime += req.responseTime;
      acc[minute].avgResponseTime = Math.round(acc[minute].totalResponseTime / acc[minute].requests);
      
      if (req.status >= 200 && req.status < 400) {
        acc[minute].successful += 1;
      } else {
        acc[minute].errors += 1;
      }
      
      return acc;
    }, {} as any);

    const chartDataArray = Object.values(groupedData)
      .sort((a: any, b: any) => a.time.localeCompare(b.time))
      .slice(-20); // Last 20 minutes

    setChartData(chartDataArray);
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (filters.ip) {
      filtered = filtered.filter(req => req.ip.includes(filters.ip));
    }

    if (filters.domain) {
      filtered = filtered.filter(req => req.url.includes(filters.domain));
    }

    if (filters.method) {
      filtered = filtered.filter(req => req.method === filters.method);
    }

    if (filters.statusCode) {
      filtered = filtered.filter(req => req.status.toString().startsWith(filters.statusCode));
    }

    if (filters.minResponseTime > 0) {
      filtered = filtered.filter(req => req.responseTime >= filters.minResponseTime);
    }

    setFilteredRequests(filtered);
  };

  const clearFilters = () => {
    setFilters({
      ip: '',
      domain: '',
      method: '',
      statusCode: '',
      minResponseTime: 0
    });
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-sm">{isLive ? 'Live' : 'Paused'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-sm">{wsConnected ? 'WebSocket' : 'Mock Data'}</span>
              </div>
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

          {/* Filters */}
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
                    Найдено запросов: <span className="font-bold text-blue-400">{filteredRequests.length}</span> из {requests.length}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time Requests */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Activity" size={20} className="text-blue-400" />
                Запросы в реальном времени
              </CardTitle>
              <CardDescription>
                Последние HTTP/HTTPS запросы с сервера 
                {(filters.ip || filters.domain || filters.method || filters.statusCode || filters.minResponseTime > 0) 
                  ? '(с учетом фильтров)' 
                  : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(filteredRequests.length > 0 ? filteredRequests : requests).slice(0, 8).map((request) => (
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
                {filteredRequests.length === 0 && (filters.ip || filters.domain || filters.method || filters.statusCode || filters.minResponseTime > 0) && (
                  <div className="text-center py-8 text-slate-400">
                    <Icon name="Search" size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Нет запросов, соответствующих выбранным фильтрам</p>
                  </div>
                )}
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
              <CardTitle className="flex items-center justify-between">
                <div>Подробные логи запросов</div>
                <Badge variant="outline" className="text-slate-300">
                  {(filteredRequests.length > 0 ? filteredRequests : requests).length} записей
                </Badge>
              </CardTitle>
              <CardDescription>Полная информация о HTTP/HTTPS запросах {(filters.ip || filters.domain || filters.method || filters.statusCode || filters.minResponseTime > 0) ? '(с учетом фильтров)' : ''}</CardDescription>
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
                  {(filteredRequests.length > 0 ? filteredRequests : requests).slice(0, 25).map((request) => (
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