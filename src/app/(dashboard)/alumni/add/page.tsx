'use client';

import { useRouter } from 'next/navigation';
import { AlumniForm } from '@/components/alumni/AlumniForm';
import { AlumniProfile } from '@/types';

export default function AddAlumniPage() {
  const router = useRouter();

  const handleSubmit = (alumni: AlumniProfile) => {
    // Navigate back to alumni directory after successful creation
    router.push('/alumni');
  };

  const handleCancel = () => {
    router.push('/alumni');
  };

  const handleBack = () => {
    router.push('/alumni');
  };

  return (
    <AlumniForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onBack={handleBack}
    />
  );
}