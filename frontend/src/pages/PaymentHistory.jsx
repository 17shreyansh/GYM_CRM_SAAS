import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, DatePicker, Select, Row, Col, Statistic, Button } from 'antd';
import { CreditCardOutlined, DollarOutlined, CalendarOutlined, DownloadOutlined } from '@ant-design/icons';
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
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Spent"
              value={stats.total}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Online Payments"
              value={stats.online}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Cash Payments"
              value={stats.cash}
              prefix="₹"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col span={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Status"
            >
              <Option value="all">All Status</Option>
              <Option value="completed">Completed</Option>
              <Option value="pending">Pending</Option>
              <Option value="failed">Failed</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={sourceFilter}
              onChange={setSourceFilter}
              style={{ width: '100%' }}
              placeholder="Method"
            >
              <Option value="all">All Methods</Option>
              <Option value="razorpay">Online</Option>
              <Option value="cash">Cash</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={exportPayments}
              disabled={filteredPayments.length === 0}
            >
              Export CSV
            </Button>
          </Col>
          <Col span={4}>
            <Button 
              onClick={() => {
                setDateRange([]);
                setStatusFilter('all');
                setSourceFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Payments Table */}
      <Card title="Payment History">
        <Table
          dataSource={filteredPayments}
          columns={columns}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} payments`,
          }}
        />
      </Card>
    </div>
  );
};

export default PaymentHistory;