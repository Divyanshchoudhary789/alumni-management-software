import { Event, EventRegistration } from '@/types';

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Annual Alumni Gala 2024',
    description:
      'Join us for an elegant evening celebrating our alumni achievements and networking with fellow graduates. Featuring keynote speakers, awards ceremony, and dinner.',
    eventDate: new Date('2024-06-15T18:00:00'),
    location: 'Grand Ballroom, Marriott Downtown',
    capacity: 200,
    registrationDeadline: new Date('2024-06-01T23:59:59'),
    status: 'published',
    eventType: 'paid',
    ticketPrice: 75,
    paymentMethods: ['stripe', 'paypal'],
    imageUrl:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    createdBy: 'admin_1',
    registrations: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    title: 'Tech Career Panel Discussion',
    description:
      'Panel discussion with alumni working at top tech companies. Learn about career paths, interview tips, and industry trends.',
    eventDate: new Date('2024-03-20T19:00:00'),
    location: 'Virtual Event (Zoom)',
    capacity: 100,
    registrationDeadline: new Date('2024-03-18T23:59:59'),
    status: 'completed',
    eventType: 'free',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
    createdBy: 'admin_1',
    registrations: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-21'),
  },
  {
    id: '3',
    title: 'Alumni Startup Showcase',
    description:
      'Showcase of innovative startups founded by our alumni. Pitch presentations, networking, and investor meetups.',
    eventDate: new Date('2024-04-10T17:30:00'),
    location: 'Innovation Hub, Campus Center',
    capacity: 150,
    registrationDeadline: new Date('2024-04-05T23:59:59'),
    status: 'published',
    eventType: 'paid',
    ticketPrice: 25,
    paymentMethods: ['stripe'],
    imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
    createdBy: 'admin_2',
    registrations: [],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    id: '4',
    title: 'Regional Meetup - San Francisco',
    description:
      'Casual networking event for Bay Area alumni. Drinks, appetizers, and great conversations.',
    eventDate: new Date('2024-05-08T18:30:00'),
    location: 'Rooftop Bar, Financial District',
    capacity: 50,
    registrationDeadline: new Date('2024-05-06T23:59:59'),
    status: 'published',
    imageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    createdBy: 'admin_1',
    registrations: [],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    id: '5',
    title: 'Mentorship Program Launch',
    description:
      'Official launch of our new mentorship program connecting experienced alumni with recent graduates.',
    eventDate: new Date('2024-07-12T16:00:00'),
    location: 'Alumni Center Auditorium',
    capacity: 80,
    registrationDeadline: new Date('2024-07-10T23:59:59'),
    status: 'draft',
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    createdBy: 'admin_2',
    registrations: [],
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const mockEventRegistrations: EventRegistration[] = [
  // Annual Alumni Gala registrations
  {
    id: '1',
    eventId: '1',
    alumniId: '1',
    registrationDate: new Date('2024-01-25'),
    status: 'registered',
  },
  {
    id: '2',
    eventId: '1',
    alumniId: '2',
    registrationDate: new Date('2024-01-26'),
    status: 'registered',
  },
  {
    id: '3',
    eventId: '1',
    alumniId: '3',
    registrationDate: new Date('2024-01-28'),
    status: 'registered',
  },

  // Tech Career Panel registrations (completed event)
  {
    id: '4',
    eventId: '2',
    alumniId: '1',
    registrationDate: new Date('2024-02-15'),
    status: 'attended',
  },
  {
    id: '5',
    eventId: '2',
    alumniId: '4',
    registrationDate: new Date('2024-02-16'),
    status: 'attended',
  },
  {
    id: '6',
    eventId: '2',
    alumniId: '5',
    registrationDate: new Date('2024-02-18'),
    status: 'registered',
  },

  // Startup Showcase registrations
  {
    id: '7',
    eventId: '3',
    alumniId: '2',
    registrationDate: new Date('2024-03-01'),
    status: 'registered',
  },
  {
    id: '8',
    eventId: '3',
    alumniId: '3',
    registrationDate: new Date('2024-03-02'),
    status: 'registered',
  },

  // SF Meetup registrations
  {
    id: '9',
    eventId: '4',
    alumniId: '1',
    registrationDate: new Date('2024-03-10'),
    status: 'registered',
  },
  {
    id: '10',
    eventId: '4',
    alumniId: '5',
    registrationDate: new Date('2024-03-12'),
    status: 'cancelled',
  },
];

// Generate additional events with varied statuses
export const generateMockEvents = (count: number = 20): Event[] => {
  const eventTypes = [
    'Networking Mixer',
    'Career Workshop',
    'Industry Panel',
    'Social Gathering',
    'Professional Development',
    'Reunion',
    'Fundraising Event',
    'Awards Ceremony',
  ];

  const locations = [
    'Campus Alumni Center',
    'Downtown Conference Center',
    'Virtual Event (Zoom)',
    'Hotel Ballroom',
    'Restaurant Private Room',
    'Company Office',
    'Community Center',
  ];

  const statuses: Array<'draft' | 'published' | 'cancelled' | 'completed'> = [
    'draft',
    'published',
    'cancelled',
    'completed',
  ];

  const additionalEvents: Event[] = [];

  for (let i = 6; i <= count + 5; i++) {
    const eventCategory = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const eventLocation = locations[Math.floor(Math.random() * locations.length)];
    const eventStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate dates based on status
    let eventDate: Date;
    if (eventStatus === 'completed') {
      eventDate = new Date(
        2024,
        Math.floor(Math.random() * 3),
        Math.floor(Math.random() * 28) + 1
      ); // Past dates
    } else {
      eventDate = new Date(
        2024,
        3 + Math.floor(Math.random() * 8),
        Math.floor(Math.random() * 28) + 1
      ); // Future dates
    }

    const registrationDeadline = new Date(
      eventDate.getTime() - 2 * 24 * 60 * 60 * 1000
    ); // 2 days before

    // Randomly assign event type and pricing
    const pricingType = Math.random() > 0.4 ? 'free' : 'paid'; // 60% free, 40% paid
    const ticketPrice = pricingType === 'paid' ? Math.floor(Math.random() * 100) + 10 : undefined; // $10-110 for paid events
    const paymentMethods = pricingType === 'paid' ? ['stripe'] : undefined;

    additionalEvents.push({
      id: i.toString(),
      title: `${pricingType === 'paid' ? 'Premium ' : ''}${eventCategory} ${i}`,
      description: `Join us for this ${pricingType.toLowerCase()} ${eventCategory.toLowerCase()} event featuring networking opportunities and professional development.`,
      eventDate,
      location: eventLocation,
      capacity: 30 + Math.floor(Math.random() * 170), // 30-200 capacity
      registrationDeadline,
      status: eventStatus,
      eventType: pricingType,
      ticketPrice,
      paymentMethods,
      imageUrl: `https://images.unsplash.com/photo-${1500000000000 + i}?w=800`,
      createdBy: `admin_${Math.floor(Math.random() * 2) + 1}`,
      registrations: [],
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1),
      updatedAt: new Date(2024, 1, Math.floor(Math.random() * 15) + 1),
    });
  }

  return [...mockEvents, ...additionalEvents];
};

// Generate event registrations for events
export const generateMockEventRegistrations = (
  events: Event[],
  alumni: any[]
): EventRegistration[] => {
  const registrations: EventRegistration[] = [...mockEventRegistrations];
  let registrationId = 11;

  events.forEach(event => {
    if (event.status === 'published' || event.status === 'completed') {
      const numRegistrations = Math.floor(
        Math.random() * Math.min(event.capacity * 0.8, alumni.length)
      );
      const shuffledAlumni = [...alumni].sort(() => 0.5 - Math.random());

      for (let i = 0; i < numRegistrations; i++) {
        const alumniId = shuffledAlumni[i].id;
        const registrationDate = new Date(
          event.createdAt.getTime() +
            Math.random() *
              (event.registrationDeadline.getTime() - event.createdAt.getTime())
        );

        let status: 'registered' | 'attended' | 'cancelled' = 'registered';
        if (event.status === 'completed') {
          status = Math.random() > 0.1 ? 'attended' : 'registered'; // 90% attendance for completed events
        } else if (Math.random() < 0.05) {
          status = 'cancelled'; // 5% cancellation rate
        }

        registrations.push({
          id: registrationId.toString(),
          eventId: event.id,
          alumniId,
          registrationDate,
          status,
        });

        registrationId++;
      }
    }
  });

  return registrations;
};
