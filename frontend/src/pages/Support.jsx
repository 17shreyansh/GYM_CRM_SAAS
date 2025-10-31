import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, Tag, List, message, Upload, Image, Card, Row, Col } from 'antd';
import { PlusOutlined, CustomerServiceOutlined, MessageOutlined, ClockCircleOutlined, UploadOutlined, FileImageOutlined, VideoCameraOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [fileList, setFileList] = useState([]);
  const [replyFileList, setReplyFileList] = useState([]);

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
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });
      
      // Add files to FormData
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('attachments', file.originFileObj);
        }
      });
      
      await api.post('/support', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success('Support ticket created successfully');
      setTicketModal(false);
      form.resetFields();
      setFileList([]);
      fetchTickets();
    } catch (error) {
      message.error('Failed to create ticket');
      console.error('Failed to create ticket:', error);
    }
  };

  const replyToTicket = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });
      
      // Add files to FormData
      replyFileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('attachments', file.originFileObj);
        }
      });
      
      const response = await api.post(`/support/${selectedTicket._id}/reply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      message.success('Reply sent successfully');
      replyForm.resetFields();
      setReplyFileList([]);
      
      // Update selected ticket with new data
      setSelectedTicket(response.data);
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

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleReplyFileChange = ({ fileList: newFileList }) => {
    setReplyFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
    if (!isValidType) {
      message.error('You can only upload image or video files!');
      return false;
    }
    const isLt50M = file.size / 1024 / 1024 < 50;
    if (!isLt50M) {
      message.error('File must be smaller than 50MB!');
      return false;
    }
    return false; // Prevent auto upload
  };

  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;
    
    return (
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {attachments.map((attachment, index) => (
            <div key={index} style={{ position: 'relative' }}>
              {attachment.type === 'image' ? (
                <Image
                  width={100}
                  height={100}
                  src={`${import.meta.env.VITE_BACKEND_URL}${attachment.url}`}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  preview={{
                    src: `${import.meta.env.VITE_BACKEND_URL}${attachment.url}`
                  }}
                />
              ) : (
                <a 
                  href={`${import.meta.env.VITE_BACKEND_URL}${attachment.url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    width: 100, 
                    height: 100, 
                    background: '#f0f0f0', 
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid #d9d9d9'
                  }}>
                    <VideoCameraOutlined style={{ fontSize: 24, color: '#666' }} />
                    <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>
                      Video
                    </div>
                  </div>
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
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
      <div className="mobile-stats-grid">
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon">
            <CustomerServiceOutlined />
          </div>
          <div className="mobile-stat-value">{stats.total}</div>
          <div className="mobile-stat-label">Total Tickets</div>
        </div>
        
        <div className="mobile-stat-card">
          <div className="mobile-stat-icon" style={{ background: 'var(--error-color)' }}>
            <ClockCircleOutlined />
          </div>
          <div className="mobile-stat-value" style={{ color: 'var(--error-color)' }}>{stats.open}</div>
          <div className="mobile-stat-label">Open Tickets</div>
        </div>
        
        <div className="mobile-stat-card gradient-card">
          <div className="mobile-stat-icon">
            <MessageOutlined />
          </div>
          <div className="mobile-stat-value">{stats.resolved}</div>
          <div className="mobile-stat-label">Resolved</div>
        </div>
      </div>

      <div className="mobile-action-grid" style={{ marginBottom: 20 }}>
        <div className="mobile-action-card" onClick={() => setTicketModal(true)}>
          <div className="mobile-action-icon">
            <PlusOutlined />
          </div>
          <div className="mobile-action-title">New Ticket</div>
        </div>
      </div>

      {tickets.length > 0 ? (
        <div style={{ display: 'grid', gap: '12px' }}>
          {tickets.map(ticket => (
            <div key={ticket._id} className="mobile-card">
              <div className="mobile-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>
                    {ticket.title}
                  </h4>
                  <Tag color={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </Tag>
                </div>
                
                <div style={{ display: 'grid', gap: '8px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Type:</span>
                    <Tag color="blue" size="small">
                      {ticket.type.replace('_', ' ').toUpperCase()}
                    </Tag>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Assigned:</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {ticket.assignedTo === 'admin' ? 'Platform Admin' : 'Gym Owner'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Created:</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {ticket.attachments && ticket.attachments.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Attachments:</span>
                      <span style={{ fontSize: '14px', color: 'var(--primary-color)' }}>
                        <FileImageOutlined /> {ticket.attachments.length} file(s)
                      </span>
                    </div>
                  )}
                </div>
                
                <Button 
                  type="primary"
                  icon={<MessageOutlined />}
                  onClick={() => { 
                    setSelectedTicket(ticket); 
                    setReplyModal(true); 
                  }}
                  block
                >
                  View Chat
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mobile-card">
          <div className="mobile-card-body" style={{ textAlign: 'center', padding: 40 }}>
            <CustomerServiceOutlined style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>No Support Tickets</h3>
            <p style={{ color: 'var(--text-muted)' }}>Create your first support ticket to get help</p>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal 
        title="Create Support Ticket" 
        open={ticketModal} 
        onCancel={() => {
          setTicketModal(false);
          form.resetFields();
          setFileList([]);
        }} 
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
          
          <Form.Item label="Screenshots/Videos (Optional)">
            <Upload
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={beforeUpload}
              multiple
              accept="image/*,video/*"
              listType="picture-card"
            >
              {fileList.length >= 5 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
              Upload screenshots or videos to help us understand your issue better. Max 5 files, 50MB each.
            </div>
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
        onCancel={() => {
          setReplyModal(false);
          replyForm.resetFields();
          setReplyFileList([]);
        }} 
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
                      description={
                        <div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</div>
                          {renderAttachments(msg.attachments)}
                        </div>
                      }
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
                
                <Form.Item label="Attachments (Optional)">
                  <Upload
                    fileList={replyFileList}
                    onChange={handleReplyFileChange}
                    beforeUpload={beforeUpload}
                    multiple
                    accept="image/*,video/*"
                    listType="picture-card"
                  >
                    {replyFileList.length >= 5 ? null : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
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