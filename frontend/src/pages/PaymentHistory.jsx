import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, DatePicker, Select, Button } from 'antd';
import { CreditCardOutlined, DollarOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../utils/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, online: 0, cash: 0 });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, dateRange, statusFilter, sourceFilter]);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/user/payments');
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Date range filter
    if (dateRange.length === 2) {
      filtered = filtered.filter(payment => {
        const paymentDate = dayjs(payment.createdAt);
        return paymentDate.isAfter(dateRange[0]) && paymentDate.isBefore(dateRange[1]);
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(payment => payment.source === sourceFilter);
    }

    setFilteredPayments(filtered);

    // Calculate stats
    const total = filtered.reduce((sum, payment) => sum + payment.amount, 0);
    const online = filtered.filter(p => p.source === 'razorpay').reduce((sum, p) => sum + p.amount, 0);
    const cash = filtered.filter(p => p.source === 'cash').reduce((sum, p) => sum + p.amount, 0);
    
    setStats({ total, online, cash });
  };

  const exportPayments = () => {
    const csvContent = [
      ['Date', 'Gym', 'Amount', 'Method', 'Status'],
      ...filteredPayments.map(payment => [
        new Date(payment.createdAt).toLocaleDateString(),
        payment.gym?.name || 'N/A',
        payment.amount,
        payment.source,
        payment.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payment-history.csv';
    a.click();
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Gym',
      dataIndex: ['gym', 'name'],
      key: 'gym',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `₹${amount}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Method',
      dataIndex: 'source',
      key: 'source',
      render: (source) => (
        <Tag color={source === 'razorpay' ? 'blue' : 'green'}>
          {source === 'razorpay' ? 'Online' : 'Cash'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Transaction ID',
      dataIndex: 'razorpayPaymentId',
      key: 'transactionId',
      render: (id) => id || 'N/A',
    },
  ];

  return (
    <div>
      <div className="mobile-stats-grid">
        <div className="mobile-stat-card gradient-card">
          <div className="mobile-stat-icon">
            <DollarOutlined />
          </div>
          <div className="mobile-stat-value">₹{stats.total.toFixed(0)}</div>
          <div className="mobile-stat-label">Total Spent</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon" style={{ background: 'var(--primary-color)' }}>
            <CreditCardOutlined />
          </div>
          <div className="mobile-stat-value">₹{stats.online.toFixed(0)}</div>
          <div className="mobile-stat-label">Online Payments</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon" style={{ background: 'var(--success-color)' }}>
            <DollarOutlined />
          </div>
          <div className="mobile-stat-value">₹{stats.cash.toFixed(0)}</div>
          <div className="mobile-stat-label">Cash Payments</div>
        </div>
      </div>

      <div className="mobile-card">
        <div className="mobile-card-body">
          <div style={{ display: 'grid', gap: '12px' }}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
              >
                <Option value="all">All Status</Option>
                <Option value="completed">Completed</Option>
                <Option value="pending">Pending</Option>
                <Option value="failed">Failed</Option>
              </Select>
              
              <Select
                value={sourceFilter}
                onChange={setSourceFilter}
                placeholder="Method"
              >
                <Option value="all">All Methods</Option>
                <Option value="razorpay">Online</Option>
                <Option value="cash">Cash</Option>
              </Select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Button 
                icon={<DownloadOutlined />} 
                onClick={exportPayments}
                disabled={filteredPayments.length === 0}
              >
                Export
              </Button>
              
              <Button 
                onClick={() => {
                  setDateRange([]);
                  setStatusFilter('all');
                  setSourceFilter('all');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card title="Payment History">
        <Table
          dataSource={filteredPayments}
          columns={columns}
          rowKey="_id"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
          }}
        />
      </Card>
    </div>
  );
};

export default PaymentHistory;