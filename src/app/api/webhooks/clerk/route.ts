import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  if (!webhookSecret) {
    throw new Error(
      'Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${evt.data.id} and type of ${eventType}`);

  try {
    // Forward webhook to backend for processing
    const response = await fetch(`${backendUrl}/api/webhooks/clerk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      },
      body: body,
    });

    if (!response.ok) {
      console.error('Backend webhook processing failed:', response.statusText);
      return new Response('Backend processing failed', { status: 500 });
    }

    const result = await response.json();
    console.log('Backend webhook processing result:', result);

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      eventType,
      userId: evt.data.id 
    });
  } catch (error) {
    console.error('Error forwarding webhook to backend:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}
