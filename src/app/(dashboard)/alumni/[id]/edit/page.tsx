'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Center, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { AlumniForm } from '@/components/alumni/AlumniForm';
import { AlumniProfile } from '@/types';
import { alumniProfileService } from '@/services/alumniProfileService';

export default function EditAlumniPage() {
  const router = useRouter();
  const params = useParams();
  const alumniId = params.id as string;

  const [alumni, setAlumni] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAlumni = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Validate profile ID first
        if (!alumniProfileService.validateProfileId(alumniId)) {
          throw new Error('Invalid profile ID');
        }
        
        const response = await alumniProfileService.getAlumniById(alumniId);
        setAlumni(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load alumni profile'
        );
      } finally {
        setLoading(false);
      }
    };

    if (alumniId) {
      loadAlumni();
    }
  }, [alumniId]);

  const handleSubmit = (updatedAlumni: AlumniProfile) => {
    // Navigate back to the alumni profile after successful update
    router.push(`/alumni/${alumniId}`);
  };

  const handleCancel = () => {
    router.push(`/alumni/${alumniId}`);
  };

  const handleBack = () => {
    router.push(`/alumni/${alumniId}`);
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red">
          {error}
        </Alert>
      </Center>
    );
  }

  if (!alumni) {
    return (
      <Center py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="yellow">
          Alumni profile not found
        </Alert>
      </Center>
    );
  }

  return (
    <AlumniForm
      alumni={alumni}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onBack={handleBack}
    />
  );
}
