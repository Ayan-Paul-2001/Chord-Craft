import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import OrderModel from '@/models/Order';
import { requireAdmin, requireAuth } from '@/lib/authGuard';

// GET /api/orders/[id] — Admin OR Order Owner only
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;
  const { session } = auth;

  try {
    await connectToDatabase();
    const { id } = await params;
    let order: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await OrderModel.findById(id).lean();
    }
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const isOwner =
      order.studentId === session.id ||
      order.studentId === session.firebaseUid ||
      (order.customerEmail && order.customerEmail.toLowerCase() === session.email.toLowerCase());

    if (session.role !== 'admin' && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order: { id: order._id.toString(), ...order } });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch order' }, { status: 500 });
  }
}

// PATCH /api/orders/[id] — Strictly Administrator only (prevents payment self-verification)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdmin(req);
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const allowedFields: Record<string, unknown> = {};
    if (body.orderStatus !== undefined) allowedFields.orderStatus = body.orderStatus;
    if (body.paymentStatus !== undefined) allowedFields.paymentStatus = body.paymentStatus;
    if (body.notes !== undefined) allowedFields.notes = body.notes;

    let order: any = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      order = await OrderModel.findByIdAndUpdate(id, allowedFields, { new: true }).lean();
    }
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        notes: order.notes,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status: 500 });
  }
}
