import { Communication } from '@/types';

export const mockCommunications: Communication[] = [
  {
    id: '1',
    title: 'Welcome to 2024 - Alumni Newsletter',
    content: `
      <h2>Happy New Year, Alumni!</h2>
      <p>We hope this message finds you well and thriving in the new year. As we embark on 2024, we're excited to share some updates and upcoming opportunities for our alumni community.</p>
      
      <h3>Upcoming Events</h3>
      <ul>
        <li>Annual Alumni Gala - June 15, 2024</li>
        <li>Tech Career Panel - March 20, 2024</li>
        <li>Regional Meetups starting in April</li>
      </ul>
      
      <h3>Alumni Spotlight</h3>
      <p>This month we're featuring Sarah Johnson (Class of 2018), who recently joined Google as a Senior Software Engineer...</p>
      
      <p>Stay connected and keep achieving great things!</p>
      <p>Best regards,<br>Alumni Relations Team</p>
    `,
    type: 'newsletter',
    targetAudience: ['all'],
    sentDate: new Date('2024-01-05'),
    createdBy: 'admin_1',
    status: 'sent',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '2',
    title: 'Tech Career Panel - Registration Open',
    content: `
      <h2>Join Our Tech Career Panel Discussion</h2>
      <p>Dear Tech Alumni,</p>
      
      <p>We're excited to invite you to our upcoming Tech Career Panel Discussion on March 20, 2024.</p>
      
      <h3>Event Details:</h3>
      <ul>
        <li><strong>Date:</strong> March 20, 2024</li>
        <li><strong>Time:</strong> 7:00 PM EST</li>
        <li><strong>Format:</strong> Virtual (Zoom)</li>
        <li><strong>Panelists:</strong> Alumni from Google, Microsoft, Apple, and Netflix</li>
      </ul>
      
      <p>Topics will include career advancement, interview tips, and industry trends.</p>
      
      <p><a href="#register">Register Now</a></p>
    `,
    type: 'event_invitation',
    targetAudience: ['tech', 'computer_science', 'engineering'],
    sentDate: new Date('2024-02-01'),
    createdBy: 'admin_1',
    status: 'sent',
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '3',
    title: 'Scholarship Fund Campaign Update',
    content: `
      <h2>Scholarship Fund Campaign - 35% to Goal!</h2>
      <p>Dear Generous Alumni,</p>
      
      <p>Thanks to your incredible support, we've raised $35,000 toward our $100,000 scholarship endowment goal!</p>
      
      <h3>Impact So Far:</h3>
      <ul>
        <li>15 scholarships awarded this year</li>
        <li>Average scholarship amount: $2,500</li>
        <li>Recipients from diverse backgrounds and majors</li>
      </ul>
      
      <p>Every contribution makes a difference in a student's life. Consider making a donation today.</p>
      
      <p><a href="#donate">Donate Now</a></p>
    `,
    type: 'fundraising',
    targetAudience: ['donors', 'major_donors'],
    sentDate: new Date('2024-02-10'),
    createdBy: 'admin_2',
    status: 'sent',
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: '4',
    title: 'Alumni Startup Showcase - Call for Participants',
    content: `
      <h2>Showcase Your Startup!</h2>
      <p>Entrepreneurial Alumni,</p>
      
      <p>We're organizing an Alumni Startup Showcase on April 10, 2024, and we want to feature YOUR company!</p>
      
      <h3>What We're Looking For:</h3>
      <ul>
        <li>Startups founded or co-founded by alumni</li>
        <li>Companies in any stage (seed to Series A+)</li>
        <li>Innovative solutions across all industries</li>
      </ul>
      
      <h3>Benefits:</h3>
      <ul>
        <li>5-minute pitch presentation</li>
        <li>Networking with potential investors</li>
        <li>Alumni community exposure</li>
        <li>Media coverage opportunities</li>
      </ul>
      
      <p>Application deadline: March 15, 2024</p>
      
      <p><a href="#apply">Apply Now</a></p>
    `,
    type: 'announcement',
    targetAudience: ['entrepreneurs', 'business'],
    sentDate: null, // Draft
    createdBy: 'admin_2',
    status: 'draft',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-18')
  },
  {
    id: '5',
    title: 'Mentorship Program Launch Invitation',
    content: `
      <h2>Be a Mentor, Make a Difference</h2>
      <p>Experienced Alumni,</p>
      
      <p>We're launching our new Alumni Mentorship Program and need dedicated mentors like you!</p>
      
      <h3>Program Details:</h3>
      <ul>
        <li>6-month mentorship commitments</li>
        <li>Monthly virtual meetings</li>
        <li>Structured guidance framework</li>
        <li>Support from our alumni team</li>
      </ul>
      
      <h3>Who Can Benefit:</h3>
      <ul>
        <li>Recent graduates (2020-2023)</li>
        <li>Career changers</li>
        <li>Alumni seeking industry connections</li>
      </ul>
      
      <p>Join us at the launch event on July 12, 2024.</p>
      
      <p><a href="#mentor">Sign Up as Mentor</a> | <a href="#mentee">Request a Mentor</a></p>
    `,
    type: 'program_launch',
    targetAudience: ['experienced', 'leadership'],
    sentDate: null, // Scheduled
    createdBy: 'admin_1',
    status: 'scheduled',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-22')
  }
];

// Communication templates
export const mockCommunicationTemplates = [
  {
    id: 'template_1',
    name: 'Event Invitation',
    subject: '[Event Name] - You\'re Invited!',
    content: `
      <h2>[Event Name]</h2>
      <p>Dear [Recipient Name],</p>
      
      <p>We're excited to invite you to [Event Name] on [Event Date].</p>
      
      <h3>Event Details:</h3>
      <ul>
        <li><strong>Date:</strong> [Event Date]</li>
        <li><strong>Time:</strong> [Event Time]</li>
        <li><strong>Location:</strong> [Event Location]</li>
      </ul>
      
      <p>[Event Description]</p>
      
      <p><a href="[Registration Link]">Register Now</a></p>
      
      <p>Best regards,<br>[Sender Name]</p>
    `,
    type: 'event_invitation'
  },
  {
    id: 'template_2',
    name: 'Monthly Newsletter',
    subject: 'Alumni Newsletter - [Month Year]',
    content: `
      <h2>Alumni Newsletter - [Month Year]</h2>
      <p>Dear Alumni,</p>
      
      <h3>This Month's Highlights</h3>
      <ul>
        <li>[Highlight 1]</li>
        <li>[Highlight 2]</li>
        <li>[Highlight 3]</li>
      </ul>
      
      <h3>Upcoming Events</h3>
      <p>[Event List]</p>
      
      <h3>Alumni Spotlight</h3>
      <p>[Alumni Feature]</p>
      
      <p>Stay connected!</p>
      <p>Alumni Relations Team</p>
    `,
    type: 'newsletter'
  },
  {
    id: 'template_3',
    name: 'Donation Thank You',
    subject: 'Thank You for Your Generous Donation',
    content: `
      <h2>Thank You!</h2>
      <p>Dear [Donor Name],</p>
      
      <p>Thank you for your generous donation of $[Amount] to [Campaign Name].</p>
      
      <p>Your contribution will help us [Impact Description].</p>
      
      <h3>Donation Details:</h3>
      <ul>
        <li><strong>Amount:</strong> $[Amount]</li>
        <li><strong>Date:</strong> [Date]</li>
        <li><strong>Purpose:</strong> [Purpose]</li>
        <li><strong>Tax ID:</strong> [Tax ID]</li>
      </ul>
      
      <p>This letter serves as your tax-deductible receipt.</p>
      
      <p>With gratitude,<br>Development Team</p>
    `,
    type: 'donation_receipt'
  }
];

// Generate additional communications
export const generateMockCommunications = (count: number = 20): Communication[] => {
  const types = ['newsletter', 'event_invitation', 'announcement', 'fundraising', 'program_launch'];
  const statuses: Array<'draft' | 'scheduled' | 'sent' | 'failed'> = ['draft', 'scheduled', 'sent', 'failed'];
  const audiences = [
    ['all'], ['tech', 'engineering'], ['business'], ['recent_graduates'], 
    ['donors'], ['entrepreneurs'], ['leadership'], ['regional_sf'], ['regional_ny']
  ];
  
  const additionalCommunications: Communication[] = [];
  
  for (let i = 6; i <= count + 5; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const targetAudience = audiences[Math.floor(Math.random() * audiences.length)];
    
    let sentDate: Date | null = null;
    if (status === 'sent') {
      sentDate = new Date(2024, Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1);
    } else if (status === 'scheduled') {
      sentDate = new Date(2024, 2 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1);
    }
    
    const createdAt = sentDate ? new Date(sentDate.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) : new Date();
    
    additionalCommunications.push({
      id: i.toString(),
      title: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${i}`,
      content: `<h2>Sample ${type} content</h2><p>This is a sample communication of type ${type}.</p>`,
      type,
      targetAudience,
      sentDate,
      createdBy: `admin_${Math.floor(Math.random() * 2) + 1}`,
      status,
      createdAt,
      updatedAt: createdAt
    });
  }
  
  return [...mockCommunications, ...additionalCommunications];
};

// Communication analytics
export const calculateCommunicationStats = (communications: Communication[]) => {
  const sent = communications.filter(c => c.status === 'sent');
  const scheduled = communications.filter(c => c.status === 'scheduled');
  const drafts = communications.filter(c => c.status === 'draft');
  
  const typeBreakdown = communications.reduce((acc, comm) => {
    acc[comm.type] = (acc[comm.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const monthlyActivity = sent.reduce((acc, comm) => {
    if (comm.sentDate) {
      const month = comm.sentDate.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalCommunications: communications.length,
    sent: sent.length,
    scheduled: scheduled.length,
    drafts: drafts.length,
    typeBreakdown,
    monthlyActivity
  };
};