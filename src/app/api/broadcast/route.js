import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const getPusher = () => {
  if (!process.env.PUSHER_APP_ID) {
    throw new Error('Missing PUSHER_APP_ID environment variable');
  }
  return new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    useTLS: true,
  });
};

export async function POST(req) {
  try {
    const pusher = getPusher();
    const { teacherId, payload } = await req.json();

    if (!teacherId || !payload) {
      return NextResponse.json({ error: 'Missing teacherId or payload' }, { status: 400 });
    }

    // Broadcast the state to the specific teacher's channel
    await pusher.trigger(`channel-${teacherId}`, 'topology-update', payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error broadcasting to Pusher:', error);
    return NextResponse.json({ error: 'Failed to broadcast' }, { status: 500 });
  }
}
