import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
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
  console.log('Webhook body:', body);

  switch (eventType) {
    case 'user.created':
      // Handle user creation
      console.log('User created:', evt.data);
      // TODO: Sync user with backend database
      break;
    
    case 'user.updated':
      // Handle user update
      console.log('User updated:', evt.data);
      // TODO: Update user in backend database
      break;
    
    case 'user.deleted':
      // Handle user deletion
      console.log('User deleted:', evt.data);
      // TODO: Delete user from backend database
      break;
    
    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
  }

  return NextResponse.json({ message: 'Webhook received' });
}