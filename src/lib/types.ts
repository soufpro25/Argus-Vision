export interface Camera {
  id: string;
  name: string;
  description: string;
  streamUrl: string; // For real implementation
  thumbnailUrl: string; // For placeholder/fallback
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

export interface DetectedObject {
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x1, y1, x2, y2]
}
