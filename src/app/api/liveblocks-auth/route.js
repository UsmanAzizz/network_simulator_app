import { Liveblocks } from "@liveblocks/node";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const liveblocks = new Liveblocks({
      secret: process.env.LIVEBLOCKS_SECRET_KEY,
    });

    const body = await request.json();
    const { room } = body;
    const { teacherId, isTeacher } = body.userInfo || {};
    
    // For MVP, we assign random color and extract name
    const colors = ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const username = isTeacher ? "Guru Usman Aziz" : "Siswa";

    // Create a session for the user
    const session = liveblocks.prepareSession(
      `user-${Math.random()}`,
      {
        userInfo: {
          name: username,
          color: randomColor,
          isTeacher: isTeacher
        }
      }
    );

    // Give the user access to the requested room
    if (room) {
      session.allow(room, session.FULL_ACCESS);
    }

    // Authorize the user and return the result
    const { status, body: authBody } = await session.authorize();
    
    return new NextResponse(authBody, { status });
  } catch (error) {
    console.error("Liveblocks auth error:", error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
