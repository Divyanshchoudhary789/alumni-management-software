'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Stack,
  Group,
  Button,
  Card,
  Text,
  Title,
  Badge,
  Grid,
  Avatar,
  Alert,
  LoadingOverlay,
  Divider,
  Select,
  NumberInput,
  Textarea,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCreditCard,
  IconInfoCircle,
  IconCheck,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { mockMentorshipService } from '@/lib/mock-services/mentorshipService';
import { alumniProfileService } from '@/services/alumniProfileService';

export default function MentorshipPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.id as string;

  const [alumni, setAlumni] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    mentorshipType: 'hourly' as 'hourly' | 'session' | 'monthly',
    amount: 0,
    description: '',
  });

  // Fetch mentor profiles
  const {
    data: mentorsData,
    loading: mentorLoading,
    error: mentorError,
  } = useApi(() => mockMentorshipService.getMentorProfiles(), {
    showErrorNotification: false,
    immediate: true,
  });

  // Load alumni data for name resolution
  useEffect(() => {
    const loadAlumni = async () => {
      try {
        const response = await alumniProfileService.getAlumni();
        setAlumni(response.data);
      } catch (err) {
        console.error('Failed to load alumni data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlumni();
  }, []);

  const mentor = mentorsData?.data?.find(m => m.alumniId === mentorId);
  const alumniDetails = alumni.find(a => a.id === mentorId);

  // Calculate amount based on mentorship type
  useEffect(() => {
    if (mentor) {
      let amount = 0;
      switch (paymentData.mentorshipType) {
        case 'hourly':
          amount = mentor.hourlyRate || 0;
          break;
        case 'session':
          amount = mentor.sessionRate || 0;
          break;
        case 'monthly':
          amount = mentor.monthlyRate || 0;
          break;
      }
      setPaymentData(prev => ({ ...prev, amount }));
    }
  }, [paymentData.mentorshipType, mentor]);

  const handlePayment = async () => {
    if (!mentor || !paymentData.amount) {
      setError('Please select a mentorship type and ensure amount is set');
      return;
    }

    setPaymentLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the Stripe API
      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Create mentorship connection
      const connectionData = {
        mentorId,
        menteeId: 'current-user-id', // This would come from auth context
        status: 'active' as const,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: `Paid mentorship - ${paymentData.mentorshipType} - ${paymentData.description}`,
      };

      await mockMentorshipService.createMentorshipConnection(connectionData);

      // Redirect to success page or mentorship dashboard
      router.push('/mentorship?success=true');
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (mentorLoading || loading) {
    return (
      <Stack gap="md">
        <Group>
          <Button variant="light" leftSection={<IconArrowLeft size={16} />}>
            Back to Mentor
          </Button>
        </Group>
        <Card withBorder radius="md" p="lg">
          <LoadingOverlay visible />
          <Stack gap="md">
            <Title order={3}>Processing Payment...</Title>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (mentorError || !mentor || !alumniDetails) {
    return (
      <Stack gap="md">
        <Group>
          <Button
            variant="light"
            leftSection={<IconArrowLeft size={16} />}
            component={Link}
            href={`/mentorship/${mentorId}`}
          >
            Back to Mentor
          </Button>
        </Group>
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Error"
          color="red"
        >
          {mentorError || 'Mentor not found'}
        </Alert>
      </Stack>
    );
  }

  const mentorshipTypeOptions = [];
  if (mentor.hourlyRate) {
    mentorshipTypeOptions.push({ value: 'hourly', label: `Hourly - $${mentor.hourlyRate}` });
  }
  if (mentor.sessionRate) {
    mentorshipTypeOptions.push({ value: 'session', label: `Per Session - $${mentor.sessionRate}` });
  }
  if (mentor.monthlyRate) {
    mentorshipTypeOptions.push({ value: 'monthly', label: `Monthly - $${mentor.monthlyRate}` });
  }

  return (
    <Stack gap="md">
      <Group>
        <Button
          variant="light"
          leftSection={<IconArrowLeft size={16} />}
          component={Link}
          href={`/mentorship/${mentorId}`}
        >
          Back to Mentor
        </Button>
      </Group>

      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          {/* Header */}
          <Group justify="space-between">
            <div>
              <Title order={2}>Mentorship Payment</Title>
              <Text c="dimmed">
                Secure payment for mentorship with {alumniDetails.firstName} {alumniDetails.lastName}
              </Text>
            </div>
            <Badge color="blue" size="lg">
              <IconCreditCard size={16} style={{ marginRight: 8 }} />
              Secure Payment
            </Badge>
          </Group>

          <Divider />

          {/* Mentor Info */}
          <Card withBorder p="md" bg="gray.0">
            <Group>
              <Avatar size="lg" src={alumniDetails.profileImage} />
              <div>
                <Title order={4}>
                  {alumniDetails.firstName} {alumniDetails.lastName}
                </Title>
                <Text c="dimmed" size="sm">
                  {alumniDetails.currentPosition} at {alumniDetails.currentCompany}
                </Text>
                <Text size="sm">
                  {mentor.yearsOfExperience} years of experience
                </Text>
              </div>
            </Group>
          </Card>

          {/* Payment Form */}
          <div>
            <Title order={4} mb="md">
              Select Mentorship Package
            </Title>

            <Stack gap="md">
              <Select
                label="Mentorship Type"
                placeholder="Choose your mentorship package"
                data={mentorshipTypeOptions}
                value={paymentData.mentorshipType}
                onChange={(value) =>
                  setPaymentData(prev => ({
                    ...prev,
                    mentorshipType: value as 'hourly' | 'session' | 'monthly'
                  }))
                }
                required
              />

              <NumberInput
                label="Amount"
                value={paymentData.amount}
                onChange={(value) =>
                  setPaymentData(prev => ({ ...prev, amount: Number(value) || 0 }))
                }
                min={0}
                required
                leftSection={<Text size="sm">$</Text>}
              />

              <Textarea
                label="Additional Notes (Optional)"
                placeholder="Tell your mentor about your goals and expectations..."
                value={paymentData.description}
                onChange={(event) =>
                  setPaymentData(prev => ({ ...prev, description: event.currentTarget.value }))
                }
                minRows={3}
              />
            </Stack>
          </div>

          {/* Payment Summary */}
          <Card withBorder p="md" bg="blue.0">
            <Title order={4} mb="sm">
              Payment Summary
            </Title>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text>Mentorship Type:</Text>
                <Text fw={500}>
                  {paymentData.mentorshipType === 'hourly' && 'Hourly Session'}
                  {paymentData.mentorshipType === 'session' && 'Per Session'}
                  {paymentData.mentorshipType === 'monthly' && 'Monthly Package'}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text>Amount:</Text>
                <Text fw={500} size="lg">
                  ${paymentData.amount}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text>Processing Fee:</Text>
                <Text c="dimmed">$0.00</Text>
              </Group>
              <Divider />
              <Group justify="space-between">
                <Text fw={500}>Total:</Text>
                <Text fw={500} size="lg" c="blue">
                  ${paymentData.amount}
                </Text>
              </Group>
            </Stack>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert icon={<IconInfoCircle size={16} />} title="Payment Error" color="red">
              {error}
            </Alert>
          )}

          {/* Payment Button */}
          <Group justify="flex-end">
            <Button
              size="lg"
              leftSection={<IconCheck size={18} />}
              loading={paymentLoading}
              onClick={handlePayment}
              disabled={!paymentData.amount || paymentData.amount <= 0}
            >
              Complete Payment & Start Mentorship
            </Button>
          </Group>

          {/* Security Notice */}
          <Alert icon={<IconInfoCircle size={16} />} title="Secure Payment" color="blue">
            Your payment is processed securely through Stripe. We never store your payment information.
            You can cancel your mentorship within 7 days for a full refund if you're not satisfied.
          </Alert>
        </Stack>
      </Card>
    </Stack>
  );
}