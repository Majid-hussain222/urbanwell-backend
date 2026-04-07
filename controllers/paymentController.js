/**
 * ============================================================
 * PAYMENT CONTROLLER - Stripe Integration
 * ============================================================
 * 
 * WHAT IS THIS?
 * Handles all payment-related operations using Stripe:
 * - Create payment intents
 * - Process payments
 * - Handle webhooks
 * - Manage subscriptions
 * 
 * HOW STRIPE WORKS:
 * 1. Frontend calls /create-payment-intent with amount
 * 2. Backend creates a PaymentIntent with Stripe
 * 3. Stripe returns a client_secret
 * 4. Frontend uses client_secret to show payment form
 * 5. User enters card details (handled securely by Stripe)
 * 6. Payment is processed
 * 7. Webhook confirms payment success
 * 
 * ============================================================
 */

const Stripe = require('stripe');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Package = require('../models/Package');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

/**
 * Create a Payment Intent
 * Called when user wants to pay for something
 * 
 * POST /api/payments/create-intent
 * Body: { amount, currency, description, metadata }
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'pkr', description, metadata = {} } = req.body;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents/paisa
      currency: currency.toLowerCase(),
      description: description || 'Spicers Fitness Payment',
      metadata: {
        userId: req.user._id.toString(),
        ...metadata
      },
      // Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create Payment Intent for Gym Package
 * 
 * POST /api/payments/package/:packageId
 */
exports.createPackagePayment = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    // Find the package
    const gymPackage = await Package.findById(packageId).populate('gym');
    
    if (!gymPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(gymPackage.price * 100), // Convert to paisa
      currency: 'pkr',
      description: `${gymPackage.name} - ${gymPackage.gym.name}`,
      metadata: {
        userId: req.user._id.toString(),
        packageId: packageId,
        gymId: gymPackage.gym._id.toString(),
        type: 'gym_package'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      package: {
        name: gymPackage.name,
        price: gymPackage.price,
        gym: gymPackage.gym.name
      }
    });
    
  } catch (error) {
    console.error('Package Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Create Payment for Trainer Booking
 * 
 * POST /api/payments/booking/:bookingId
 */
exports.createBookingPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate('trainer', 'name hourlyRate')
      .populate('user', 'name email');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user owns this booking
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Calculate amount
    const amount = booking.totalAmount || booking.trainer.hourlyRate;
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'pkr',
      description: `Trainer Session - ${booking.trainer.name}`,
      metadata: {
        userId: req.user._id.toString(),
        bookingId: bookingId,
        trainerId: booking.trainer._id.toString(),
        type: 'trainer_booking'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      booking: {
        trainer: booking.trainer.name,
        amount: amount,
        date: booking.date
      }
    });
    
  } catch (error) {
    console.error('Booking Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Confirm Payment Success
 * Called after frontend confirms payment was successful
 * 
 * POST /api/payments/confirm
 * Body: { paymentIntentId }
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status
      });
    }
    
    // Get metadata to determine what was purchased
    const { type, bookingId, packageId, userId } = paymentIntent.metadata;
    
    // Handle different payment types
    if (type === 'trainer_booking' && bookingId) {
      // Update booking status
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        paymentIntentId: paymentIntentId,
        paidAt: new Date()
      });
    }
    
    if (type === 'gym_package' && packageId) {
      // Create membership record or update user
      await User.findByIdAndUpdate(userId, {
        $push: {
          memberships: {
            package: packageId,
            startDate: new Date(),
            paymentIntentId: paymentIntentId
          }
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Payment confirmed',
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: paymentIntent.status
      }
    });
    
  } catch (error) {
    console.error('Confirm Payment Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get Payment History
 * 
 * GET /api/payments/history
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    // List payment intents for this user from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 20,
    });
    
    // Filter by user ID in metadata
    const userPayments = paymentIntents.data.filter(
      pi => pi.metadata.userId === req.user._id.toString()
    );
    
    const history = userPayments.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      status: pi.status,
      description: pi.description,
      type: pi.metadata.type,
      createdAt: new Date(pi.created * 1000)
    }));
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
    
  } catch (error) {
    console.error('Payment History Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Stripe Webhook Handler
 * Receives events from Stripe (payment success, failure, etc.)
 * 
 * POST /api/payments/webhook
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('✅ Payment succeeded:', paymentIntent.id);
      // Handle successful payment
      await handleSuccessfulPayment(paymentIntent);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('❌ Payment failed:', failedPayment.id);
      // Handle failed payment
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
};

// Helper function to handle successful payments
async function handleSuccessfulPayment(paymentIntent) {
  const { type, bookingId, packageId, userId } = paymentIntent.metadata;
  
  try {
    if (type === 'trainer_booking' && bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentIntentId: paymentIntent.id
      });
    }
    
    if (type === 'gym_package' && packageId && userId) {
      // Add membership to user
      const gymPackage = await Package.findById(packageId);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + gymPackage.duration);
      
      await User.findByIdAndUpdate(userId, {
        $push: {
          memberships: {
            package: packageId,
            startDate: new Date(),
            endDate: endDate,
            paymentIntentId: paymentIntent.id,
            status: 'active'
          }
        }
      });
    }
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * Get Stripe Publishable Key
 * Frontend needs this to initialize Stripe
 * 
 * GET /api/payments/config
 */
exports.getStripeConfig = async (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
};