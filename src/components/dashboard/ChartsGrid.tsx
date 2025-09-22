import { SimpleGrid, Stack } from '@mantine/core';
import { AlumniGrowthChart } from '@/components/charts/AlumniGrowthChart';
import { EventAttendanceChart } from '@/components/charts/EventAttendanceChart';
import { DonationTrendsChart } from '@/components/charts/DonationTrendsChart';
import { MemberActivityChart } from '@/components/charts/MemberActivityChart';

interface ChartsGridProps {
  loading?: boolean;
}

export function ChartsGrid({ loading = false }: ChartsGridProps) {
  return (
    <Stack gap="lg">
      {/* Top row - Main trend charts */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <AlumniGrowthChart height={350} />
        <DonationTrendsChart height={350} />
      </SimpleGrid>
      
      {/* Bottom row - Activity and event charts */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <EventAttendanceChart height={350} />
        <MemberActivityChart height={350} />
      </SimpleGrid>
    </Stack>
  );
}