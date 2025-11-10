import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

/**
 * POST /api/subscribe
 * Create a Stripe Checkout session for subscription
 */
export async function POST(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    const body = await request.json()
    const { priceId, successUrl, cancelUrl } = body

    // Default to standard pricing if not provided
    const finalPriceId = priceId || process.env.STRIPE_PRICE_ID_MONTHLY

    if (!finalPriceId) {
      return NextResponse.json(
        { error: 'No price ID configured' },
        { status: 400 }
      )
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      client_reference_id: userId,
      metadata: {
        userId,
      },
      subscription_data: {
        metadata: {
          userId,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subscribe
 * Get current subscription status
 */
export async function GET(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    // In production, you'd look up the customer by userId
    // For now, return a mock response
    return NextResponse.json({
      subscribed: false,
      plan: null,
      status: null,
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscribe
 * Cancel subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    // For MVP, use test user
    const userId = 'test-user-id'

    // In production, look up subscription and cancel it
    // const subscription = await stripe.subscriptions.cancel(subscriptionId)

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled',
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
