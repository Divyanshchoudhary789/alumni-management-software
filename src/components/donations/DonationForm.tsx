'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { mockDonationService } from '@/lib/mock-services';
import { mockData } from '@/lib/mock-data';

interface DonationFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingDonation?: any;
}

export function DonationForm({ opened, onClose, onSuccess, editingDonation }: DonationFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      donorId: editingDonation?.donorId || '',
      amount: editingDonation?.amount || '',
      donationDate: editingDonation?.donationDate ? new Date(editingDonation.donationDate) : new Date(),
      purpose: editingDonation?.purpose || '',
      campaignId: editingDonation?.campaignId || '',
      paymentMethod: editingDonation?.paymentMethod || '',
      notes: '',
    },
    validate: {
      donorId: (value) => (!value ? 'Please select a donor' : null),
      amount: (value) => {
        if (!value || value <= 0) return 'Amount must be greater than 0';
        if (value > 100000) return 'Amount cannot exceed $100,000';
        return null;
      },
      purpose: (value) => (!value ? 'Purpose is required' : null),
      paymentMethod: (value) => (!value ? 'Payment method is required' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      
      const donationData = {
        donorId: values.donorId,
        amount: Number(values.amount),
        donationDate: values.donationDate,
        purpose: values.purpose,
        campaignId: values.campaignId || 'campaign_1', // Default campaign
        paymentMethod: values.paymentMethod,
        status: 'completed' as const, // Admin can directly mark as completed
      };

      if (editingDonation) {
        // Update existing donation (mock - would be implemented in real API)
        notifications.show({
          title: 'Success',
          message: 'Donation updated successfully',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      } else {
        await mockDonationService.createDonation(donationData);
        notifications.show({
          title: 'Success',
          message: 'Donation recorded successfully',
          color: 'green',
          icon: <IconCheck size={16} />,
        });
      }

      form.reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to record donation',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare donor options
  const donorOptions = mockData.alumni.map(alumni => ({
    value: alumni.id,
    label: `${alumni.firstName} ${alumni.lastName} (${alumni.graduationYear})`,
  }));

  // Prepare campaign options
  const campaignOptions = [
    { value: 'campaign_1', label: 'Annual Giving Campaign 2024' },
    { value: 'campaign_2', label: 'Scholarship Endowment' },
    { value: 'campaign_3', label: 'Campus Infrastructure Fund' },
  ];

  const paymentMethodOptions = [
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'PayPal', label: 'PayPal' },
    { value: 'Check', label: 'Check' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Cryptocurrency', label: 'Cryptocurrency' },
  ];

  const purposeOptions = [
    { value: 'General Fund', label: 'General Fund' },
    { value: 'Scholarship Fund', label: 'Scholarship Fund' },
    { value: 'Alumni Events', label: 'Alumni Events' },
    { value: 'Infrastructure Development', label: 'Infrastructure Development' },
    { value: 'Research Fund', label: 'Research Fund' },
    { value: 'Student Support', label: 'Student Support' },
    { value: 'Faculty Development', label: 'Faculty Development' },
    { value: 'Technology Upgrade', label: 'Technology Upgrade' },
    { value: 'Library Fund', label: 'Library Fund' },
    { value: 'Athletic Programs', label: 'Athletic Programs' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingDonation ? 'Edit Donation' : 'Record New Donation'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
            <Text size="sm">
              Record donations made by alumni to track contributions and generate receipts.
            </Text>
          </Alert>

          <Select
            label="Donor"
            placeholder="Select donor"
            data={donorOptions}
            searchable
            required
            {...form.getInputProps('donorId')}
          />

          <NumberInput
            label="Donation Amount"
            placeholder="Enter amount"
            prefix="$"
            min={1}
            max={100000}
            decimalScale={2}
            required
            {...form.getInputProps('amount')}
          />

          <DateInput
            label="Donation Date"
            placeholder="Select date"
            required
            {...form.getInputProps('donationDate')}
          />

          <Select
            label="Purpose"
            placeholder="Select purpose"
            data={purposeOptions}
            searchable
            required
            {...form.getInputProps('purpose')}
          />

          <Select
            label="Campaign"
            placeholder="Select campaign (optional)"
            data={campaignOptions}
            searchable
            clearable
            {...form.getInputProps('campaignId')}
          />

          <Select
            label="Payment Method"
            placeholder="Select payment method"
            data={paymentMethodOptions}
            required
            {...form.getInputProps('paymentMethod')}
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes (optional)"
            rows={3}
            {...form.getInputProps('notes')}
          />

          <Divider />

          <Group justify="flex-end">
            <Button variant="light" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {editingDonation ? 'Update Donation' : 'Record Donation'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}