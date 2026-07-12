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

export async function GET() {
  try {
    const pusher = getPusher();
    // Get all occupied channels starting with 'channel-'
    const response = await pusher.get({ path: '/channels', params: { filter_by_prefix: 'channel-' } });
    
    if (response.status === 200) {
      const data = await response.json();
      const channels = Object.keys(data.channels || {});
      
      // For MVP, we map known IDs to names
      const knownTeachers = {
        'usman_aziz': 'Usman Aziz, S.Kom.'
      };

      const onlineTeachers = {};
      channels.forEach(channel => {
        const tId = channel.replace('channel-', '');
        onlineTeachers[tId] = {
          name: knownTeachers[tId] || tId,
          lastActive: Date.now()
        };
      });

      return NextResponse.json(onlineTeachers);
    }
    
    return NextResponse.json({});
  } catch (error) {
    console.error('Error fetching Pusher channels:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
