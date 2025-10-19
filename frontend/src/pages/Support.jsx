import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, Table, Tag, List } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [ticketModal, setTicketModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/support' : '/support/my';
      const response = await api.get(endpoint);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const createTicket = async (values) => {
    try {
      await api.post('/support', values);
      setTicketModal(false);
      form.resetFields();
      fetchTickets();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const replyToTicket = async (values) => {
    try {
      await api.post(`/support/${selectedTicket._id}/reply`, values);
      setReplyModal(false);
      replyForm.resetFields();
      fetchTickets();
    } catch (error) {
      console.error('Failed to reply:', error);
    }
  };

  const columns = [
    { title: 'Title', dataIndex: 'title' },
    { title: 'Type', dataIndex: 'type' },
    { title: 'Status', dataIndex: 'status', render: (status) => <Tag color={status === 'resolved' ? 'green' : 'orange'}>{status}</Tag> },
    { title: 'Created', dataIndex: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
    { title: 'Actions', render: (_, record) => (
      <Button size="small" onClick={() => { setSelectedTicket(record); setReplyModal(true); }}>
        View/Reply
      </Button>
    )}
  ];

  return (
    <div>
      <Card title="Support Tickets" extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setTicketModal(true)}>
          New Ticket
        </Button>
      }>
        <Table dataSource={tickets} columns={columns} rowKey="_id" />
      </Card>

      {/* Create Ticket Modal */}
      <Modal title="Create Support Ticket" open={ticketModal} onCancel={() => setTicketModal(false)} footer={null}>
        <Form form={form} onFinish={createTicket} layout="vertical">
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="bug">Bug Report</Select.Option>
              <Select.Option value="payment">Payment Issue</Select.Option>
              <Select.Option value="account">Account Issue</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="assignedTo" label="Assign To" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="message" label="Message" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Create Ticket</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reply Modal */}
      <Modal title={selectedTicket?.title} open={replyModal} onCancel={() => setReplyModal(false)} footer={null} width={600}>
        {selectedTicket && (
          <>
            <List
              dataSource={selectedTicket.messages}
              renderItem={(msg) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${msg.sender} - ${new Date(msg.timestamp).toLocaleString()}`}
                    description={msg.message}
                  />
                </List.Item>
              )}
            />
            <Form form={replyForm} onFinish={replyToTicket} style={{ marginTop: 16 }}>
              <Form.Item name="message" rules={[{ required: true }]}>
                <Input.TextArea placeholder="Type your reply..." />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">Send Reply</Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Support;