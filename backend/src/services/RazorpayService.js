import Razorpay from 'razorpay';
import crypto from 'crypto';

class RazorpayService {
  constructor() {
    console.log('Initializing Razorpay with:', {
      key_id: process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET',
      key_secret: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET'
    });
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing in environment variables');
      throw new Error('Razorpay credentials not configured');
    }
    
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    
    console.log('Razorpay initialized successfully');
  }

  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    try {
      console.log('Creating Razorpay order:', { amount, currency, receipt, notes });
      
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes: {
          ...notes,
          platform: 'ORDIIN',
          description: 'Gym membership payment via ORDIIN'
        }
      });
      
      console.log('Razorpay order created:', order);
      return { success: true, order };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      return { success: false, error: error.error?.description || error.message };
    }
  }

  async verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    try {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;
      return { success: true, isAuthentic };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return { success: true, payment };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async refundPayment(paymentId, amount = null) {
    try {
      const refundData = { payment_id: paymentId };
      if (amount) refundData.amount = Math.round(amount * 100);
      
      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      return { success: true, refund };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createSubscription({ planId, customerId, totalCount, notes = {} }) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        customer_id: customerId,
        total_count: totalCount,
        notes
      });
      return { success: true, subscription };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new RazorpayService();