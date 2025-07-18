import type { Camera, Layout } from '@/lib/types';

export const mockCameras: Camera[] = [
  { id: 'cam-01', name: 'Front Door', description: 'Covers the main entrance and porch area.', thumbnailUrl: 'https://placehold.co/800x600.png' },
  { id: 'cam-02', name: 'Backyard', description: 'Monitors the entire backyard, including the patio and garden.', thumbnailUrl: 'https://placehold.co/800x600.png' },
  { id: 'cam-03', name: 'Living Room', description: 'Inside view of the main living area.', thumbnailUrl: 'https://placehold.co/800x600.png' },
  { id: 'cam-04', name: 'Garage', description: 'Covers the interior of the garage.', thumbnailUrl: 'https://placehold.co/800x600.png' },
  { id: 'cam-05', name: 'Driveway', description: 'Overlooks the driveway and street.', thumbnailUrl: 'https://placehold.co/800x600.png' },
  { id: 'cam-06', name: 'Kitchen', description: 'Monitors the kitchen and dining area.', thumbnailUrl: 'https://placehold.co/800x600.png' },
];

export const mockLayouts: Layout[] = [
  {
    id: 'layout-01',
    name: 'Main Overview',
    grid: {
      rows: 2,
      cols: 2,
      cameras: ['cam-01', 'cam-05', 'cam-02', 'cam-03'],
    },
  },
  {
    id: 'layout-02',
    name: 'Exterior',
    grid: {
      rows: 1,
      cols: 3,
      cameras: ['cam-01', 'cam-05', 'cam-02'],
    },
  },
  {
    id: 'layout-03',
    name: 'All Cameras',
    grid: {
      rows: 2,
      cols: 3,
      cameras: ['cam-01', 'cam-02', 'cam-03', 'cam-04', 'cam-05', 'cam-06'],
    },
  },
];
