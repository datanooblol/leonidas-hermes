'use client';

import { useEffect } from 'react';
import SalesDashboard from '../organisms/SalesDashboard';
import { useWebSocket } from '../../hooks/useWebSocket';

export default function SalesDashboardPage() {
  const { customerInfo, connect, isConnected } = useWebSocket();

  useEffect(() => {
    connect();
  }, [connect]);
  
  console.log('WebSocket connected:', isConnected);
  console.log('Customer info from WebSocket:', customerInfo);

  return <SalesDashboard customerInfo={customerInfo} />;
}