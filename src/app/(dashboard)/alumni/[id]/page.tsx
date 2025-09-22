'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Center, Loader, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { AlumniProfile as AlumniProfileComponent } from '@/components/alumni/AlumniProfile';
import { AlumniProfile } from '@/types';
import { mockAlumniService } from '@/lib/mock-services/alumniService';

export default function AlumniProfilePage() {
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
        const response = await mockAlumniService.getAlumniById(alumniId);
        setAlumni(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load alumni profile');
      } finally {
        setLoading(false);
      }
    };

    if (alumniId) {
      loadAlumni();
    }
  }, [alumniId]);

  const handleBack = () => {
    router.push('/alumni');
  };

  const handleEdit = (alumni: AlumniProfile) => {
    router.push(`/alumni/${alumni.id}/edit`);
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
    <AlumniProfileComponent
      alumniId={alumniId}
      onBack={handleBack}
      onEdit={handleEdit}
    />
  );
}