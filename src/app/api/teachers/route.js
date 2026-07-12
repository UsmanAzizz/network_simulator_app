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

    if (response.ok) {
      const data = await response.json();
      const onlineTeachers = {};
      
      const knownTeachers = {
        'usman_aziz': 'Usman Aziz, S.Kom.'
      };

      if (data.data) {
        data.data.forEach(room => {
          if (room.id.startsWith('room-')) {
            const tId = room.id.replace('room-', '');
            onlineTeachers[tId] = {
              name: knownTeachers[tId] || tId,
              lastActive: Date.now() // Liveblocks doesn't give last active easily in the list, but if room exists, it might be active
            };
          }
        });
      }

      return NextResponse.json(onlineTeachers);
    }
    
    return NextResponse.json({});
  } catch (error) {
    console.error('Error fetching Liveblocks rooms:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
