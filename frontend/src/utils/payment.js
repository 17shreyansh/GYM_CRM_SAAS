// Manual QR Payment System - No longer using Razorpay
// All payments are now handled through QR codes and manual verification

export const initiatePayment = async (gymId, planId) => {
  // This function is deprecated in favor of manual QR payment flow
  // Users should be redirected to /payment/:gymId/:planId instead
  throw new Error('Please use the QR payment system instead');
};

// Helper function to format payment status
export const getPaymentStatusColor = (status) => {
  const colors = {
    paid: 'green',
    unpaid: 'red',
    pending_verification: 'orange'
  };
  return colors[status] || 'default';
};

// Helper function to format payment status label
export const getPaymentStatusLabel = (status) => {
  const labels = {
    paid: 'Paid',
    unpaid: 'Unpaid',
    pending_verification: 'Pending Verification'
  };
  return labels[status] || status;
};