'use client';

import { useState, useEffect } from 'react';
import {
  Paper,
  Stack,
  Group,
  Title,
  Text,
  TextInput,
  Button,
  Badge,
  Avatar,
  Alert,
  Card,
  SimpleGrid,
  ActionIcon,
  rem,
  Loader,
  Center
} from '@mantine/core';
import {
  IconSearch,
  IconUserCheck,
  IconUserX,
  IconQrcode,
  IconAlertCircle,
  IconCheck,
  IconClock
} from '@tabler/icons-react';
import { Event, EventRegistration, AlumniProfile } from '@/types';
import { mockEventService } from '@/lib/mock-services/eventService';
import { mockAlumniService } from '@/lib/mock-services/alumniService';
import { notifications } from '@mantine/notifications';
import { format } from 'date-fns';

interface AttendeeWithProfile extends EventRegistration {
  profile?: AlumniProfile;
}

interface EventCheckInProps {
  event: Event;
  onCheckInUpdate?: () => void;
}

export function EventCheckIn({ event, onCheckInUpdate }: EventCheckInProps) {
  const [attendees, setAttendees] = useState<AttendeeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      
      // Get event registrations
      const registrationsResponse = await mockEventService.getEventRegistrations(event.id);
      const registrations = registrationsResponse.data.filter(r => r.status === 'registered');

      // Get alumni profiles for attendees
      const alumniResponse = await mockAlumniService.getAlumni();
      const allAlumni = alumniResponse.data;

      // Combine registration data with alumni profiles
      const attendeesWithProfiles = registrations.map(registration => ({
        ...registration,
        profile: allAlumni.find(alumni => alumni.id === registration.alumniId)
      }));

      setAttendees(attendeesWithProfiles);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load attendees',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendees();
  }, [event.id]);

  // Filter attendees based on search
  const filteredAttendees = attendees.filter(attendee => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return attendee.profile && (
      `${attendee.profile.firstName} ${attendee.profile.lastName}`.toLowerCase().includes(query) ||
      attendee.profile.currentCompany?.toLowerCase().includes(query) ||
      attendee.profile.graduationYear?.toString().includes(query)
    );
  });

  const handleCheckIn = async (attendeeId: string, attendeeName: string) => {
    try {
      setCheckingIn(attendeeId);
      
      // In a real implementation, this would call the API to update the registration status
      const updatedAttendees = attendees.map(attendee =>
        attendee.id === attendeeId
          ? { ...attendee, status: 'attended' as const }
          : attendee
      ).filter(attendee => attendee.status === 'registered'); // Remove checked-in attendees from the list

      setAttendees(updatedAttendees);

      notifications.show({
        title: 'Success',
        message: `${attendeeName} checked in successfully`,
        color: 'green',
        icon: <IconCheck />
      });

      onCheckInUpdate?.();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to check in attendee',
        color: 'red'
      });
    } finally {
      setCheckingIn(null);
    }
  };

  const handleQRCodeScan = () => {
    // In a real implementation, this would open a QR code scanner
    notifications.show({
      title: 'Feature Coming Soon',
      message: 'QR code scanning will be implemented in future updates',
      color: 'blue'
    });
  };

  const checkedInCount = event.registrations?.filter(r => r.status === 'attended').length || 0;
  const totalRegistered = event.registrations?.filter(r => r.status === 'registered' || r.status === 'attended').length || 0;

  if (loading) {
    return (
      <Paper p="md" withBorder>
        <Center py="xl">
          <Loader size="lg" />
        </Center>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {/* Header with Stats */}
      <Paper p="md" withBorder>
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Event Check-In</Title>
            <Text size="sm" c="dimmed">
              {event.title}
            </Text>
            <Text size="sm" c="dimmed">
              {format(event.eventDate, 'PPP p')}
            </Text>
          </div>
          
          <Stack gap="xs" align="flex-end">
            <Badge size="lg" color="green" variant="light">
              {checkedInCount} / {totalRegistered} Checked In
            </Badge>
            <Text size="xs" c="dimmed">
              {Math.round((checkedInCount / Math.max(totalRegistered, 1)) * 100)}% attendance
            </Text>
          </Stack>
        </Group>
      </Paper>

      {/* Search and QR Code */}
      <Paper p="md" withBorder>
        <Group>
          <TextInput
            placeholder="Search attendees by name, company, or graduation year..."
            leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          
          <Button
            leftSection={<IconQrcode size={16} />}
            variant="light"
            onClick={handleQRCodeScan}
          >
            Scan QR Code
          </Button>
        </Group>
      </Paper>

      {/* Attendees Grid */}
      {filteredAttendees.length === 0 ? (
        <Alert 
          icon={searchQuery ? <IconSearch /> : <IconAlertCircle />} 
          title={searchQuery ? "No matching attendees" : "All attendees checked in"}
        >
          {searchQuery 
            ? 'No attendees match your search criteria.'
            : 'All registered attendees have been checked in for this event.'
          }
        </Alert>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {filteredAttendees.map(attendee => (
            <Card key={attendee.id} p="md" withBorder>
              <Stack gap="sm">
                <Group>
                  <Avatar
                    src={attendee.profile?.profileImage}
                    alt={attendee.profile ? `${attendee.profile.firstName} ${attendee.profile.lastName}` : 'Unknown'}
                    size="lg"
                  />
                  <div style={{ flex: 1 }}>
                    <Text fw={500} size="sm">
                      {attendee.profile 
                        ? `${attendee.profile.firstName} ${attendee.profile.lastName}`
                        : 'Unknown User'
                      }
                    </Text>
                    <Text size="xs" c="dimmed">
                      Class of {attendee.profile?.graduationYear || 'N/A'}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {attendee.profile?.currentCompany || 'N/A'}
                    </Text>
                  </div>
                </Group>

                <Group justify="space-between" align="center">
                  <Badge color="blue" variant="light" size="sm">
                    <IconClock style={{ width: rem(12), height: rem(12), marginRight: rem(4) }} />
                    Registered {format(attendee.registrationDate, 'MMM d')}
                  </Badge>
                  
                  <Button
                    size="sm"
                    leftSection={<IconUserCheck size={14} />}
                    onClick={() => handleCheckIn(
                      attendee.id,
                      attendee.profile 
                        ? `${attendee.profile.firstName} ${attendee.profile.lastName}`
                        : 'Unknown User'
                    )}
                    loading={checkingIn === attendee.id}
                    disabled={checkingIn !== null}
                  >
                    Check In
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Quick Stats */}
      <Paper p="md" withBorder>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <div>
            <Text size="xl" fw={700} c="blue">
              {totalRegistered}
            </Text>
            <Text size="sm" c="dimmed">
              Total Registered
            </Text>
          </div>
          
          <div>
            <Text size="xl" fw={700} c="green">
              {checkedInCount}
            </Text>
            <Text size="sm" c="dimmed">
              Checked In
            </Text>
          </div>
          
          <div>
            <Text size="xl" fw={700} c="orange">
              {totalRegistered - checkedInCount}
            </Text>
            <Text size="sm" c="dimmed">
              Pending Check-In
            </Text>
          </div>
          
          <div>
            <Text size="xl" fw={700} c="teal">
              {Math.round((checkedInCount / Math.max(totalRegistered, 1)) * 100)}%
            </Text>
            <Text size="sm" c="dimmed">
              Attendance Rate
            </Text>
          </div>
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}