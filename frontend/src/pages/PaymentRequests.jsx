import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Image, Input, message, Descriptions } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, DollarOutlined } from '@ant-design/icons';
import api from '../utils/api';

const { TextArea } = Input;

const PaymentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPaymentRequests();
  }, []);

  const fetchPaymentRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/gym/payment-requests');
      setRequests(response.data.payment_requests);
    } catch (error) {
      message.error('Failed to fetch payment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (requestId, status) => {
    setActionLoading(true);
    try {
      await api.patch(`/gym/payment-requests/${requestId}/verify`, {
        status,
        notes: verificationNotes
      });
      
      message.success(`Payment ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setVerificationModal(false);
      setVerificationNotes('');
      fetchPaymentRequests();
    } catch (error) {
      message.error('Failed to verify payment');
    } finally {
      setActionLoading(false);
    }
  };

  const showVerificationModal = (request, action) => {
    setSelectedRequest({ ...request, action });
    setVerificationModal(true);
  };

  const columns = [
    {
      title: 'Member',
      dataIndex: 'member',
      key: 'member',
      render: (member) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {member.isOfflineMember 
              ? member.offlineDetails?.name 
              : member.user?.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {member.isOfflineMember 
              ? member.offlineDetails?.phone 
              : member.user?.phone}
          </div>
        </div>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Tag color="blue" style={{ fontSize: '14px' }}>
          ₹{amount}
        </Tag>
      )
    },
    {
      title: 'Transaction ID',
      dataIndex: 'paymentProof',
      key: 'transaction_id',
      render: (proof) => proof?.transaction_id || 'N/A'
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentProof',
      key: 'payment_date',
      render: (proof) => proof?.payment_date 
        ? new Date(proof.payment_date).toLocaleDateString()
        : 'N/A'
    },
    {
      title: 'Submitted',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'pending_verification' ? 'orange' : 'default'}>
          {status === 'pending_verification' ? 'Pending' : status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedRequest(record);
              setModalVisible(true);
            }}
          >
            View
          </Button>
          {record.status === 'pending_verification' && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => showVerificationModal(record, 'approved')}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => showVerificationModal(record, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title={
          <Space>
            <DollarOutlined />
            Payment Requests
          </Space>
        }
        extra={
          <Button onClick={fetchPaymentRequests} loading={loading}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* View Details Modal */}
      <Modal
        title="Payment Request Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedRequest && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Member">
                {selectedRequest.member.isOfflineMember 
                  ? selectedRequest.member.offlineDetails?.name 
                  : selectedRequest.member.user?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                {selectedRequest.member.isOfflineMember 
                  ? selectedRequest.member.offlineDetails?.phone 
                  : selectedRequest.member.user?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">₹{selectedRequest.amount}</Descriptions.Item>
              <Descriptions.Item label="Transaction ID">
                {selectedRequest.paymentProof?.transaction_id || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Payment Date">
                {selectedRequest.paymentProof?.payment_date 
                  ? new Date(selectedRequest.paymentProof.payment_date).toLocaleDateString()
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Notes">
                {selectedRequest.paymentProof?.notes || 'No notes provided'}
              </Descriptions.Item>
            </Descriptions>

            {selectedRequest.paymentProof?.image && (
              <div style={{ marginTop: 16 }}>
                <h4>Payment Screenshot:</h4>
                <Image
                  src={selectedRequest.paymentProof.image}
                  alt="Payment Proof"
                  style={{ maxWidth: '100%', maxHeight: 400 }}
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Verification Modal */}
      <Modal
        title={`${selectedRequest?.action === 'approved' ? 'Approve' : 'Reject'} Payment`}
        open={verificationModal}
        onCancel={() => {
          setVerificationModal(false);
          setVerificationNotes('');
        }}
        footer={[
          <Button key="cancel" onClick={() => setVerificationModal(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type={selectedRequest?.action === 'approved' ? 'primary' : 'danger'}
            loading={actionLoading}
            onClick={() => handleVerifyPayment(selectedRequest?._id, selectedRequest?.action)}
          >
            {selectedRequest?.action === 'approved' ? 'Approve' : 'Reject'}
          </Button>
        ]}
      >
        <div>
          <p>
            Are you sure you want to {selectedRequest?.action} this payment request?
          </p>
          <TextArea
            placeholder="Add notes (optional)"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            rows={3}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PaymentRequests;