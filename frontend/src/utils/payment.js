import api from './api';

export const initiatePayment = async (gymId, planId) => {
  try {
    // Create order
    const orderResponse = await api.post('/payment/create-order', { gymId, planId });
    const { orderId, amount, currency, key } = orderResponse.data;

    // Razorpay options
    const options = {
      key,
      amount,
      currency,
      name: 'Gym SaaS',
      description: 'Gym Membership Payment',
      order_id: orderId,
      handler: async (response) => {
        // Verify payment
        await api.post('/payment/verify', {
          ...response,
          gymId,
          planId
        });
        return true;
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com',
      },
      theme: {
        color: '#1890ff'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
};