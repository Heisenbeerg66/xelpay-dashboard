import { NextRequest, NextResponse } from 'next/server';
import { withMobileAuth, type AuthContext } from '@/lib/mobile/auth-middleware';
import { getMobileDb } from '@/lib/mobile/db';
import { auditLog, AUDIT } from '@/lib/mobile/audit';

async function handler(req: NextRequest, ctx: AuthContext) {
  const db = getMobileDb();

  if (ctx.connection_type === 'merchant') {
    await db
      .from('merchant_devices_vault')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ctx.device_id);
  } else {
    await db
      .from('business_devices')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ctx.device_id);
  }

  await auditLog({
    action: AUDIT.DEVICE_DISCONNECTED,
    entity_id: ctx.device_id,
    ip: ctx.ip,
    details: {
      merchant_id: ctx.merchant_id,
      business_id: ctx.business_id,
      connection_type: ctx.connection_type,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Device disconnected successfully.',
  });
}

export const POST = withMobileAuth(handler);