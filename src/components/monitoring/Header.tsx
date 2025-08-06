import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface HeaderProps {
  isLive: boolean;
  wsConnected: boolean;
  onToggleLive: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLive, wsConnected, onToggleLive }) => {
  return (
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
            onClick={onToggleLive}
            className="gap-2"
          >
            <Icon name={isLive ? "Pause" : "Play"} size={16} />
            {isLive ? 'Pause' : 'Start'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;