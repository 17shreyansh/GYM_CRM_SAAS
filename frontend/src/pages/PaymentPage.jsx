import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Form, Input, Upload, message, Image, Space, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, CheckOutlined, QrcodeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Step } = Steps;
const { TextArea } = Input;

const PaymentPage = () => {
  const { gymId, planId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [gym, setGym] = useState(null);
  const [plan, setPlan] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [membership, setMembership] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [gymId, planId]);

  const fetchData = async () => {
    try {
      // Fetch gym details
      const gymResponse = await api.get(`/user/gyms`);
      const gymData = gymResponse.data.find(g => g._id === gymId);
      setGym(gymData);

      // Fetch plan details
      const planResponse = await api.get(`/user/gyms/${gymId}/plans`);
      const planData = planResponse.data.find(p => p._id === planId);
      setPlan(planData);

      // Fetch payment settings
      const settingsResponse = await api.get(`/user/gyms/${gymId}/payment-settings`);
      setPaymentSettings(settingsResponse.data.payment_settings);

      // Check if user already has membership for this gym
      const membershipResponse = await api.get('/user/memberships');
      const existingMembership = membershipResponse.data.find(m => 
        m.gym._id === gymId && m.status === 'pending'
      );
      
      if (existingMembership) {
        setMembership(existingMembership);
        if (existingMembership.paymentStatus === 'pending_verification') {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }
      }
    } catch (error) {
      message.error('Failed to load payment details');
      navigate('/gyms');
    }
  };

  const handleProceedToPaymentProof = async () => {
    if (!membership) {
      // Create membership only when user proceeds with payment
      try {
        setLoading(true);
        const response = await api.post('/user/join', { 
          gymId, 
          planId, 
          joinMethod: 'manual' 
        });
        setMembership(response.data);
        message.success('Membership request created! Please upload payment proof.');
        setCurrentStep(1);
      } catch (error) {
        message.error(error.response?.data?.message || 'Failed to create membership');
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(1);
    }
  };

  const handlePaymentProofUpload = async (file) => {
    try {
      const { validateImageFile, convertFileToBase64 } = await import('../utils/fileUpload');
      validateImageFile(file);
      const base64 = await convertFileToBase64(file);
      setPaymentProofFile(base64);
      message.success('Payment proof uploaded successfully');
    } catch (error) {
      message.error(error.message || 'Failed to upload payment proof');
    }
    return false;
  };

  const handleSubmitPayment = async (values) => {
    if (!paymentProofFile) {
      message.error('Please upload payment screenshot');
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/submit-payment', {
        membershipId: membership._id,
        transaction_id: values.transaction_id,
        amount: plan.price,
        payment_date: values.payment_date,
        notes: values.notes,
        paymentProofImage: paymentProofFile
      });

      message.success('Payment proof submitted successfully!');
      setCurrentStep(2);
    } catch (error) {
      message.error('Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  if (!gym || !plan || !paymentSettings) {
    return <div>Loading...</div>;
  }

  const steps = [
    {
      title: 'Payment Instructions',
      content: (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <h3>Scan QR Code to Pay</h3>
              {paymentSettings.qr_code_image ? (
                <Image
                  src={paymentSettings.qr_code_image}
                  alt="Payment QR Code"
                  style={{ maxWidth: 300, maxHeight: 300 }}
                />
              ) : (
                <div style={{ 
                  width: 300, 
                  height: 300, 
                  border: '2px dashed #d9d9d9', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <QrcodeOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                </div>
              )}
            </div>

            <Divider />

            <div>
              <h4>Payment Details:</h4>
              <p><strong>Gym:</strong> {gym.name}</p>
              <p><strong>Plan:</strong> {plan.name}</p>
              <p><strong>Amount to Pay:</strong> <Tag color="blue" style={{ fontSize: '16px' }}>₹{plan.price}</Tag></p>
              {paymentSettings.upi_id && (
                <p><strong>UPI ID:</strong> {paymentSettings.upi_id}</p>
              )}
            </div>

            <div>
              <h4>Instructions:</h4>
              <p>{paymentSettings.payment_instructions}</p>
            </div>

            <Button 
              type="primary" 
              size="large" 
              onClick={handleProceedToPaymentProof}
              block
            >
              I Have Made the Payment
            </Button>
          </Space>
        </Card>
      )
    },
    {
      title: 'Upload Payment Proof',
      content: (
        <Card>
          <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
            <h4>Gym Request Details:</h4>
            <p><strong>Gym:</strong> {gym.name}</p>
            <p><strong>Plan:</strong> {plan.name}</p>
            <p><strong>Amount Paid:</strong> <Tag color="blue">₹{plan.price}</Tag></p>
            {membership && (
              <p><strong>Request ID:</strong> {membership._id}</p>
            )}
          </div>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmitPayment}
          >
            <Form.Item
              label="Transaction ID"
              name="transaction_id"
              rules={[{ required: true, message: 'Please enter transaction ID' }]}
            >
              <Input placeholder="Enter transaction/reference ID" />
            </Form.Item>

            <Form.Item
              label="Payment Date"
              name="payment_date"
              rules={[{ required: true, message: 'Please select payment date' }]}
            >
              <Input type="date" />
            </Form.Item>

            <Form.Item
              label="Payment Screenshot"
              required
            >
              <Upload
                beforeUpload={handlePaymentProofUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>
                  Upload Screenshot
                </Button>
              </Upload>
              {paymentProofFile && (
                <div style={{ marginTop: 16 }}>
                  <Image
                    src={paymentProofFile}
                    alt="Payment Proof"
                    style={{ maxWidth: 200, maxHeight: 200 }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item
              label="Additional Notes (Optional)"
              name="notes"
            >
              <TextArea rows={3} placeholder="Any additional information..." />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button onClick={() => setCurrentStep(0)}>
                  Back
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  size="large"
                >
                  Submit Payment Proof
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      title: 'Verification Pending',
      content: (
        <Card style={{ textAlign: 'center' }}>
          <Space direction="vertical" size="large">
            <CheckOutlined style={{ fontSize: 64, color: '#52c41a' }} />
            <h2>Payment Proof Submitted!</h2>
            <p>Your payment proof has been submitted successfully.</p>
            <p>The gym owner will verify your payment and activate your membership shortly.</p>
            <p>You will receive a notification once your membership is activated.</p>
            
            <Button 
              type="primary" 
              onClick={() => navigate('/dashboard')}
              size="large"
            >
              View My Memberships
            </Button>
          </Space>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/gyms')}
        style={{ marginBottom: 24 }}
      >
        Back to Gyms
      </Button>

      <Card title={`Payment for ${gym.name} - ${plan.name}`}>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map(step => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>

        {steps[currentStep].content}
      </Card>
    </div>
  );
};

export default PaymentPage;