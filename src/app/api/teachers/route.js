import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const secret = process.env.LIVEBLOCKS_SECRET_KEY;
    if (!secret) return NextResponse.json({});

    const response = await fetch('https://api.liveblocks.io/v2/rooms', {
      headers: {
        Authorization: `Bearer ${secret}`
      }
    });

    const knownTeachers = {
      'usman_aziz': 'Usman Aziz, S.Kom.'
    };

    const onlineTeachers = {};

    // Check each known teacher's room for active users
    for (const tId of Object.keys(knownTeachers)) {
      const response = await fetch(`https://api.liveblocks.io/v2/rooms/room-${tId}/active_users`, {
        headers: {
          Authorization: `Bearer ${secret}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          onlineTeachers[tId] = {
            name: knownTeachers[tId],
            lastActive: Date.now()
          };
        }
      }
    }

    return NextResponse.json(onlineTeachers);
  } catch (error) {
    console.error('Error fetching Liveblocks rooms:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
