import { NextResponse } from 'next/server';

// Opsional: Untuk deploy di Vercel Edge agar 0ms latency
export const runtime = 'edge';

export async function POST(req) {
  try {
    const { issues } = await req.json();

    if (!issues || issues.length === 0) {
      return NextResponse.json({ hint: "Jaringanmu sudah mantap! Tidak ada masalah." });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    
    // Fallback jika API key belum di-set di environment variables
    if (!groqApiKey) {
      return NextResponse.json({ 
        hint: `(Fallback Offline) Guru AI melihat ada masalah ini: ${issues.join(' ')} Coba periksa lagi IP dan kabelnya ya!` 
      });
    }

    const prompt = `
      Berperanlah sebagai guru pembimbing jaringan untuk anak SMK kelas 2.
      Siswa sedang mencoba menghubungkan simulasi jaringan dan menemui kendala (error) berikut:
      ${issues.map(i => `- ${i}`).join('\n')}
      
      Tugasmu:
      Berikan HINT (petunjuk) 1 hingga 2 kalimat pendek yang ramah, memotivasi, dan menggunakan bahasa Indonesia santai ala anak muda. 
      Jangan berikan jawaban persisnya, pancing mereka untuk berpikir.
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192', // Model ultra cepat Groq
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    const hint = data.choices[0].message.content;

    return NextResponse.json({ hint });
  } catch (error) {
    console.error("Grader API Error:", error);
    return NextResponse.json({ hint: "Waduh, Guru AI sedang sibuk. Coba cek lagi konfigurasi IP-mu ya!" }, { status: 500 });
  }
}
