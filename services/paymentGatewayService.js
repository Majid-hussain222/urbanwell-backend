// services/payment-gateway-service.js
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

/**
 * Create a Stripe payment intent
 * @param {Object} paymentData - { amount: Number (in cents), currency: String, payment_method_types: Array }
 * @returns {Promise<Object>} - Stripe PaymentIntent object
 */
async function createPaymentIntent(paymentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: paymentData.amount,
      currency: paymentData.currency || 'usd',
      payment_method_types: paymentData.payment_method_types || ['card'],
      metadata: paymentData.metadata || {},
    });
    return paymentIntent;
  } catch (error) {
    throw new Error(`Stripe Payment Intent creation failed: ${error.message}`);
  }
}

/**
 * Confirm a payment intent
 * @param {String} paymentIntentId
 * @returns {Promise<Object>} - Stripe PaymentIntent confirmation object
 */
async function confirmPaymentIntent(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Stripe Payment Intent confirmation failed: ${error.message}`);
  }
}

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
};
