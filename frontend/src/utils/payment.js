import api from './api';

export const initiatePayment = async (gymId, planId) => {
  try {
    // Create order
    const orderResponse = await api.post('/payment/create-order', {
      gymId,
      planId
    });

    const { orderId, amount, currency } = orderResponse.data;

    // Razorpay options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: amount * 100, // Convert to paise
      currency,
      name: 'Gym SaaS',
      description: 'Gym Membership Payment',
      order_id: orderId,
      handler: async (response) => {
        try {
          // Verify payment
          await api.post('/payment/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            gymId,
            planId
          });
          
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#2563eb'
      }
    };

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    const razorpay = new window.Razorpay(options);
    
    return new Promise((resolve, reject) => {
      razorpay.on('payment.failed', (response) => {
        reject(new Error('Payment failed'));
      });
      
      razorpay.open();
      
      // Resolve when payment handler completes successfully
      const originalHandler = options.handler;
      options.handler = async (response) => {
        try {
          await originalHandler(response);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
    });

  } catch (error) {
    throw new Error('Failed to initiate payment');
  }
};