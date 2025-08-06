import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/monitoring/Header';
import StatsCards from '@/components/monitoring/StatsCards';
import TrafficCharts from '@/components/monitoring/TrafficCharts';
import FiltersPanel from '@/components/monitoring/FiltersPanel';
import RealTimeRequests from '@/components/monitoring/RealTimeRequests';
import StatisticsTab from '@/components/monitoring/StatisticsTab';
import LogsTab from '@/components/monitoring/LogsTab';
import ApiTab from '@/components/monitoring/ApiTab';
import SettingsTab from '@/components/monitoring/SettingsTab';
import AlertsTab from '@/components/monitoring/AlertsTab';

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
      <Header 
        isLive={isLive} 
        wsConnected={wsConnected} 
        onToggleLive={() => setIsLive(!isLive)} 
      />
      
      <StatsCards stats={stats} />

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
          <TrafficCharts chartData={chartData} />
          
          <FiltersPanel 
            filters={filters}
            setFilters={setFilters}
            clearFilters={clearFilters}
            filteredCount={filteredRequests.length}
            totalCount={requests.length}
          />

          <RealTimeRequests
            requests={requests}
            filteredRequests={filteredRequests}
            filters={filters}
            getMethodColor={getMethodColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsTab
            requests={requests}
            stats={stats}
            getMethodColor={getMethodColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="logs">
          <LogsTab
            requests={requests}
            filteredRequests={filteredRequests}
            filters={filters}
            getMethodColor={getMethodColor}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="api">
          <ApiTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab wsConnected={wsConnected} />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;