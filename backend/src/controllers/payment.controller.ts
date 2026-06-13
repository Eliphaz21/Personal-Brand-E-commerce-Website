import { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../config/stripe';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import Cart from '../models/Cart.model';
import Coupon from '../models/Coupon.model';
import Notification from '../models/Notification.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { env } from '../config/env';

/**
 * @desc    Create a Stripe PaymentIntent for a pending order
 * @route   POST /api/payments/create-intent
 * @access  Private (Authenticated)
 */
export const createPaymentIntent = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  if (!orderId) {
    throw new AppError('Order ID is required.', 400);
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  if (order.userId.toString() !== userId) {
    throw new AppError('You do not have permission to pay for this order.', 403);
  }

  if (order.paymentStatus !== 'pending') {
    throw new AppError(`Order is already ${order.paymentStatus}`, 400);
  }

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // Stripe expects amounts in cents
    currency: 'usd',
    metadata: {
      orderId: order._id.toString(),
      userId,
    },
  });

  // Save the intent ID to the order
  order.stripePaymentIntentId = paymentIntent.id;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment intent created successfully.',
    clientSecret: paymentIntent.client_secret,
  });
});

/**
 * @desc    Stripe Webhook handler
 * @route   POST /api/payments/webhook
 * @access  Public (Called by Stripe)
 */
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    res.status(400).json({ success: false, message: 'Missing stripe signature header.' });
    return;
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ success: false, message: 'Webhook secret is not configured on the server.' });
    return;
  }

  let event: Stripe.Event;

  try {
    // req.body must be the raw buffer here, not JSON
    event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Find the order with this payment intent
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      
      if (order && order.paymentStatus === 'pending') {
        order.paymentStatus = 'paid';
        await order.save();

        // Decrement product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.qty },
          });
        }

        // Clear the user's cart
        await Cart.findOneAndUpdate(
          { userId: order.userId },
          { $set: { items: [], totalAmount: 0 } }
        );

        // Increment coupon used count if a coupon was used
        if (order.couponCode) {
          await Coupon.findOneAndUpdate(
            { code: order.couponCode },
            { $inc: { usedCount: 1 } }
          );
        }

        // Create an order success notification
        await Notification.create({
          userId: order.userId,
          title: 'Order Payment Successful',
          body: `Your payment for order ${order._id} was successful and is now being processed.`,
          type: 'order_status',
        });

        console.log(`✅ Order ${order._id} successfully marked as PAID. Stock updated, Cart cleared, and Coupon count incremented.`);
      }
      break;
    }
    
    case 'payment_intent.payment_failed': {
      const failedIntent = event.data.object as Stripe.PaymentIntent;
      const failedOrder = await Order.findOne({ stripePaymentIntentId: failedIntent.id });
      if (failedOrder) {
        failedOrder.paymentStatus = 'failed';
        await failedOrder.save();
        
        // Create an order failure notification
        await Notification.create({
          userId: failedOrder.userId,
          title: 'Order Payment Failed',
          body: `Your payment for order ${failedOrder._id} failed. Please try again.`,
          type: 'order_status',
        });

        console.log(`❌ Order ${failedOrder._id} payment failed.`);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send({ received: true });
};
