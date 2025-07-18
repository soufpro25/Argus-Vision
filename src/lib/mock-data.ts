import type { Camera, Layout } from '@/lib/types';

// Note: These are public, non-functional RTSP stream URLs for demonstration.
// For a real application, you would replace these with your actual RTSP stream URLs.
// The app does not include a backend to transcode these streams for web playback.
export const mockCameras: Camera[] = [
  { id: 'cam-01', name: 'Front Door', description: 'Covers the main entrance and porch area.', streamUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov', thumbnailUrl: 'https://placehold.co/800x600.png' },
  { id: 'cam-02', name: 'Backyard', description: 'Monitors the entire backyard, including the patio and garden.', streamUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov', thumbnailUrl: 'https://placehold.co/800x600.png' },
  { id: 'cam-03', name: 'Living Room', description: 'Inside view of the main living area.', streamUrl: 'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov', thumbnailUrl: 'https://placehold.co/800x600.png' },
];

export const mockLayouts: Layout[] = [
  {
    id: 'layout-01',
    name: 'Main Overview',
    grid: {
      rows: 2,
      cols: 2,
      cameras: ['cam-01', 'cam-05', 'cam-02', 'cam-03'], // cam-05 will be an empty slot now
    },
  },
  {
    id: 'layout-02',
    name: 'Exterior',
    grid: {
      rows: 1,
      cols: 2,
      cameras: ['cam-01', 'cam-02'],
    },
  },
  {
    id: 'layout-03',
    name: 'All Cameras',
    grid: {
      rows: 1,
      cols: 3,
      cameras: ['cam-01', 'cam-02', 'cam-03'],
    },
  },
];
