import { Donation } from '@/types';

export const mockDonations: Donation[] = [
  {
    id: '1',
    donorId: '1',
    amount: 500,
    donationDate: new Date('2024-01-15'),
    purpose: 'General Fund',
    campaignId: 'campaign_1',
    paymentMethod: 'Credit Card',
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    donorId: '2',
    amount: 1000,
    donationDate: new Date('2024-01-20'),
    purpose: 'Scholarship Fund',
    campaignId: 'campaign_2',
    paymentMethod: 'Bank Transfer',
    status: 'completed',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    donorId: '3',
    amount: 250,
    donationDate: new Date('2024-02-01'),
    purpose: 'Alumni Events',
    campaignId: 'campaign_1',
    paymentMethod: 'PayPal',
    status: 'completed',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    donorId: '4',
    amount: 2500,
    donationDate: new Date('2024-02-10'),
    purpose: 'Infrastructure Development',
    campaignId: 'campaign_3',
    paymentMethod: 'Credit Card',
    status: 'completed',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    donorId: '5',
    amount: 100,
    donationDate: new Date('2024-02-15'),
    purpose: 'General Fund',
    campaignId: 'campaign_1',
    paymentMethod: 'Credit Card',
    status: 'pending',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
  },
];

export const mockDonationCampaigns = [
  {
    id: 'campaign_1',
    name: 'Annual Giving Campaign 2024',
    description: 'Support our general operations and alumni programs',
    goal: 50000,
    raised: 15750,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    status: 'active',
  },
  {
    id: 'campaign_2',
    name: 'Scholarship Endowment',
    description: 'Create lasting scholarships for deserving students',
    goal: 100000,
    raised: 35000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-06-30'),
    status: 'active',
  },
  {
    id: 'campaign_3',
    name: 'Campus Infrastructure Fund',
    description: 'Modernize campus facilities and technology',
    goal: 200000,
    raised: 75000,
    startDate: new Date('2023-09-01'),
    endDate: new Date('2024-08-31'),
    status: 'active',
  },
];

// Generate additional donations with realistic patterns
export const generateMockDonations = (
  count: number = 100,
  alumniIds: string[]
): Donation[] => {
  const purposes = [
    'General Fund',
    'Scholarship Fund',
    'Alumni Events',
    'Infrastructure Development',
    'Research Fund',
    'Student Support',
    'Faculty Development',
    'Technology Upgrade',
    'Library Fund',
    'Athletic Programs',
  ];

  const paymentMethods = [
    'Credit Card',
    'Bank Transfer',
    'PayPal',
    'Check',
    'Cryptocurrency',
  ];
  const statuses: Array<'completed' | 'pending' | 'failed'> = [
    'completed',
    'pending',
    'failed',
  ];
  const campaigns = ['campaign_1', 'campaign_2', 'campaign_3'];

  const additionalDonations: Donation[] = [];

  for (let i = 6; i <= count + 5; i++) {
    const donorId = alumniIds[Math.floor(Math.random() * alumniIds.length)];
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    const paymentMethod =
      paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const campaignId = campaigns[Math.floor(Math.random() * campaigns.length)];

    // Generate realistic donation amounts with some larger donations
    let amount: number;
    const rand = Math.random();
    if (rand < 0.6) {
      amount = 25 + Math.floor(Math.random() * 475); // $25-$500 (60%)
    } else if (rand < 0.85) {
      amount = 500 + Math.floor(Math.random() * 1500); // $500-$2000 (25%)
    } else if (rand < 0.95) {
      amount = 2000 + Math.floor(Math.random() * 3000); // $2000-$5000 (10%)
    } else {
      amount = 5000 + Math.floor(Math.random() * 10000); // $5000-$15000 (5%)
    }

    // Most donations are completed, some pending, few failed
    let status: 'completed' | 'pending' | 'failed';
    const statusRand = Math.random();
    if (statusRand < 0.9) {
      status = 'completed';
    } else if (statusRand < 0.97) {
      status = 'pending';
    } else {
      status = 'failed';
    }

    // Generate donation dates over the past year
    const donationDate = new Date(
      2023,
      2 + Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    );

    additionalDonations.push({
      id: i.toString(),
      donorId,
      amount,
      donationDate,
      purpose,
      campaignId,
      paymentMethod,
      status,
      createdAt: donationDate,
      updatedAt: donationDate,
    });
  }

  return [...mockDonations, ...additionalDonations];
};

// Calculate donation statistics
export const calculateDonationStats = (donations: Donation[]) => {
  const completedDonations = donations.filter(d => d.status === 'completed');
  const totalAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0);
  const averageDonation =
    completedDonations.length > 0 ? totalAmount / completedDonations.length : 0;

  // Monthly breakdown
  const monthlyTotals = completedDonations.reduce(
    (acc, donation) => {
      const month = donation.donationDate.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + donation.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Top donors
  const donorTotals = completedDonations.reduce(
    (acc, donation) => {
      acc[donation.donorId] = (acc[donation.donorId] || 0) + donation.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalAmount,
    totalDonations: completedDonations.length,
    averageDonation,
    monthlyTotals,
    donorTotals,
    pendingDonations: donations.filter(d => d.status === 'pending').length,
    failedDonations: donations.filter(d => d.status === 'failed').length,
  };
};
