import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getChatById } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const chatId = formData.get('chatId') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 },
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const chatTokenCookie = cookieStore.get(`chat_token_${chatId}`);

    if (!chatTokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (chat.token !== chatTokenCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Convert audio to buffer for OpenAI
    const audioBuffer = await audioFile.arrayBuffer();

    // Use OpenAI Whisper to transcribe the audio
    const whisperFormData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: audioFile.type });
    whisperFormData.append('file', audioBlob, 'audio.webm');
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('language', 'pt');

    const transcriptionResponse = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: whisperFormData,
      },
    );

    if (!transcriptionResponse.ok) {
      console.error(
        'OpenAI Whisper API error:',
        await transcriptionResponse.text(),
      );
      return NextResponse.json(
        { error: 'Failed to transcribe audio' },
        { status: 500 },
      );
    }

    const transcription = await transcriptionResponse.json();

    return NextResponse.json({
      transcription: transcription.text,
    });
  } catch (error) {
    console.error('Voice message API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
