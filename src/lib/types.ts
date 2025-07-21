
export interface User {
  id: string;
  username: string;
  password?: string; // Should be handled securely in a real app
  role: 'admin' | 'viewer';
}

export interface Camera {
  id: string;
  name: string;
  description: string;
  streamUrl: string; // For real implementation
  thumbnailUrl: string; // For placeholder/fallback
  server?: string;
}

export interface Layout {
  id: string;
  name:string;
  grid: {
    rows: number;
    cols: number;
    cameras: (string | null)[]; // Array of camera IDs, null for empty cells
  }
}

export interface Recording {
    id: string;
    timestamp: string;
    cameraName: string;
    title: string;
    summary: string;
    videoDataUri: string;
}

export interface Event {
  id: string;
  timestamp: string;
  type: 'Recording';
  cameraName: string;
  description: string;
  referenceId?: string; // e.g., recording ID
}

export interface StorageConfig {
  retentionDays: number; // 0 for infinite
}
