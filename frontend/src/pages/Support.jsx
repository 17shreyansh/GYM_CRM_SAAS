import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, Table, Tag, List, Row, Col, Statistic, message } from 'antd';
import { PlusOutlined, CustomerServiceOutlined, MessageOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [ticketModal, setTicketModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [stats, setStats] = useState({ open: 0, resolved: 0, total: 0 });

  useEffect(() => {
    fetchTickets();
    if (user.role === 'member') {
      fetchUserGyms();
    }
  }, []);

  const fetchTickets = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/support' : '/support/my';
      const response = await api.get(endpoint);
      setTickets(response.data);
      
      // Calculate stats
      const open = response.data.filter(t => t.status === 'open').length;
      const resolved = response.data.filter(t => t.status === 'resolved').length;
      setStats({ open, resolved, total: response.data.length });
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const fetchUserGyms = async () => {
    try {
      const response = await api.get('/user/memberships');
      const userGyms = response.data.map(membership => membership.gym);
      setGyms(userGyms);
    } catch (error) {
      console.error('Failed to fetch user gyms:', error);
    }
  };

  const createTicket = async (values) => {
    try {
      await api.post('/support', values);
      message.success('Support ticket created successfully');
      setTicketModal(false);
      form.resetFields();
      fetchTickets();
    } catch (error) {
      message.error('Failed to create ticket');
      console.error('Failed to create ticket:', error);
    }
  };

  const replyToTicket = async (values) => {
    try {
      await api.post(`/support/${selectedTicket._id}/reply`, values);
      message.success('Reply sent successfully');
      setReplyModal(false);
      replyForm.resetFields();
      fetchTickets();
    } catch (error) {
      message.error('Failed to send reply');
      console.error('Failed to reply:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'red';
      case 'in_progress': return 'orange';
      case 'resolved': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Type', dataIndex: 'type', key: 'type',
      render: (type) => (
        <Tag color="blue">{type.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo',
      render: (assignedTo) => assignedTo === 'admin' ? 'Platform Admin' : 'Gym Owner'
    },
    { title: 'Status', dataIndex: 'status', key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    { title: 'Created', dataIndex: 'createdAt', key: 'created',
      render: (date) => new Date(date).toLocaleDateString()
    },
    { title: 'Last Updated', dataIndex: 'updatedAt', key: 'updated',
      render: (date) => new Date(date).toLocaleDateString()
    },
    { title: 'Actions', key: 'actions',
      render: (_, record) => (
        <Button 
          size="small" 
          icon={<MessageOutlined />}
          onClick={() => { 
            setSelectedTicket(record); 
            setReplyModal(true); 
          }}
        >
          View Chat
        </Button>
      )
    }
  ];

  return (
    <div>
      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Tickets"
              value={stats.total}
              prefix={<CustomerServiceOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Open Tickets"
              value={stats.open}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Resolved Tickets"
              value={stats.resolved}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tickets Table */}
      <Card title="Support Tickets" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setTicketModal(true)}>
          New Ticket
        </Button>
      }>
        <Table 
          dataSource={tickets} 
          columns={columns} 
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Create Ticket Modal */}
      <Modal 
        title="Create Support Ticket" 
        open={ticketModal} 
        onCancel={() => setTicketModal(false)} 
        footer={null}
        width={600}
      >
        <Form form={form} onFinish={createTicket} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="Brief description of your issue" />
          </Form.Item>
          
          <Form.Item name="type" label="Issue Type" rules={[{ required: true }]}>
            <Select placeholder="Select issue type">
              <Select.Option value="bug">Bug Report</Select.Option>
              <Select.Option value="payment">Payment Issue</Select.Option>
              <Select.Option value="account">Account Issue</Select.Option>
              <Select.Option value="membership">Membership Issue</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="assignedTo" label="Contact" rules={[{ required: true }]}>
            <Select placeholder="Who should handle this?">
              <Select.Option value="admin">Platform Admin</Select.Option>
              {gyms.map(gym => (
                <Select.Option key={gym._id} value={gym._id}>
                  {gym.name} (Gym Owner)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="message" label="Detailed Description" rules={[{ required: true }]}>
            <Input.TextArea 
              rows={4} 
              placeholder="Please provide detailed information about your issue..."
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Create Ticket
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Chat Modal */}
      <Modal 
        title={`Ticket: ${selectedTicket?.title}`} 
        open={replyModal} 
        onCancel={() => setReplyModal(false)} 
        footer={null} 
        width={700}
      >
        {selectedTicket && (
          <>
            {/* Ticket Info */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedTicket.status)} style={{ marginLeft: 8 }}>
                    {selectedTicket.status.replace('_', ' ').toUpperCase()}
                  </Tag>
                </Col>
                <Col span={8}>
                  <strong>Type:</strong> {selectedTicket.type.replace('_', ' ').toUpperCase()}
                </Col>
                <Col span={8}>
                  <strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </Col>
              </Row>
            </Card>

            {/* Messages */}
            <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
              <List
                dataSource={selectedTicket.messages}
                renderItem={(msg, index) => (
                  <List.Item
                    style={{
                      padding: '12px',
                      backgroundColor: msg.sender === 'user' ? '#f0f2f5' : '#e6f7ff',
                      marginBottom: '8px',
                      borderRadius: '8px'
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>
                            {msg.sender === 'user' ? 'You' : 
                             msg.sender === 'admin' ? 'Platform Admin' : 'Gym Owner'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(msg.timestamp).toLocaleString()}
                          </span>
                        </div>
                      }
                      description={<div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>}
                    />
                  </List.Item>
                )}
              />
            </div>

            {/* Reply Form */}
            {selectedTicket.status !== 'resolved' && (
              <Form form={replyForm} onFinish={replyToTicket}>
                <Form.Item name="message" rules={[{ required: true }]}>
                  <Input.TextArea 
                    placeholder="Type your message..." 
                    rows={3}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" icon={<MessageOutlined />}>
                    Send Message
                  </Button>
                </Form.Item>
              </Form>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default Support;