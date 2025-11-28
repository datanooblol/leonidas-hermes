'use client';

import { useWebSocket } from '../../hooks/useWebSocket';
import { useEffect } from 'react';
import SalesDashboard from '../organisms/SalesDashboard';

export default function SalesDashboardPage() {
  const webSocketData = useWebSocket();

  useEffect(() => {
    webSocketData.connect();
  }, [webSocketData.connect]);

  return <SalesDashboard webSocketData={webSocketData} />;
}