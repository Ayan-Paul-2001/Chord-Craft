import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import BillingSettings from '@/models/BillingSettings';
import { getSession, requireAuth } from '@/lib/authGuard';

// GET /api/orders — Admin gets all orders; Student gets ONLY their own orders
export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const paymentStatus = searchParams.get('paymentStatus');
    const orderStatus = searchParams.get('orderStatus');

    const query: Record<string, unknown> = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (orderStatus) query.orderStatus = orderStatus;

    if (session.role === 'admin') {
      const studentId = searchParams.get('studentId');
      if (studentId) query.studentId = studentId;
    } else {
      const ownIds = Array.from(
        new Set([session.id, session.firebaseUid].filter(Boolean))
      );
      query.$or = [
        { studentId: { $in: ownIds } },
        { customerEmail: session.email.toLowerCase().trim() },
      ];
    }

    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json(
      {
        success: true,
        orders: orders.map((o) => ({
          id: o._id.toString(),
          studentId: o.studentId,
          customerName: o.customerName,
          customerMobile: o.customerMobile,
          customerEmail: o.customerEmail,
          deliveryAddress: o.deliveryAddress,
          deliveryMethod: o.deliveryMethod,
          deliveryCharge: o.deliveryCharge,
          items: o.items.map((item) => ({
            product: {
              id: item.productId,
              name: item.productName,
              price: item.productPrice,
              images: [item.productImage],
            },
            quantity: item.quantity,
          })),
          subtotal: o.subtotal,
          totalAmount: o.totalAmount,
          paymentMethod: o.paymentMethod,
          bKashTransactionId: o.bKashTransactionId,
          bKashSenderMobile: o.bKashSenderMobile,
          paymentStatus: o.paymentStatus,
          orderStatus: o.orderStatus,
          notes: o.notes,
          createdAt:
            o.createdAt instanceof Date
              ? o.createdAt.toISOString().replace('T', ' ').slice(0, 16)
              : String(o.createdAt),
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders — Public/student order creation (always forces Pending statuses + safe server-side coupon increment)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = getSession(req);
    const body = await req.json();

    const orderItems = (body.items || []).map((item: any) => ({
      productId: item.product?.id || item.productId,
      productName: item.product?.name || item.productName,
      productPrice: Number(item.product?.price ?? item.productPrice) || 0,
      productImage: item.product?.images?.[0] || item.productImage || '',
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    const resolvedStudentId =
      session?.role === 'student' ? session.id : body.studentId || 'guest';

    const order = await OrderModel.create({
      studentId: resolvedStudentId,
      customerName: String(body.customerName || '').trim(),
      customerMobile: String(body.customerMobile || '').trim(),
      customerEmail: String(body.customerEmail || session?.email || '').trim().toLowerCase(),
      deliveryAddress: String(body.deliveryAddress || '').trim(),
      deliveryMethod: body.deliveryMethod,
      deliveryCharge: Math.max(0, Number(body.deliveryCharge) || 0),
      items: orderItems,
      subtotal: Math.max(0, Number(body.subtotal) || 0),
      totalAmount: Math.max(0, Number(body.totalAmount) || 0),
      paymentMethod: body.paymentMethod,
      bKashTransactionId: body.bKashTransactionId || '',
      bKashSenderMobile: body.bKashSenderMobile || '',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      notes: body.notes || '',
    });

    // Atomically increment coupon usage server-side if a valid couponCode was applied
    if (body.couponCode && typeof body.couponCode === 'string') {
      const cleanCode = body.couponCode.trim().toUpperCase();
      try {
        const settings = await BillingSettings.findOne();
        if (settings && Array.isArray(settings.coupons)) {
          let modified = false;
          settings.coupons = settings.coupons.map((c: any) => {
            if (String(c.code || '').toUpperCase() === cleanCode) {
              modified = true;
              return { ...c, usageCount: (Number(c.usageCount) || 0) + 1 };
            }
            return c;
          });
          if (modified) {
            settings.markModified('coupons');
            await settings.save();
          }
        }
      } catch (couponErr) {
        console.warn('Coupon usage increment notice:', couponErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order._id.toString(),
          ...order.toObject(),
          createdAt: order.createdAt.toISOString().replace('T', ' ').slice(0, 16),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to place order' }, { status: 500 });
  }
}
