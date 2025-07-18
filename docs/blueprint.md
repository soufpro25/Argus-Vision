# **App Name**: Argus Vision

## Core Features:

- RTSP Ingestion: RTSP Stream Ingestion via FFmpeg: Capture video streams from RTSP cameras using FFmpeg.
- Smart Recording: Motion-Based Recording: Record video in segments (5-15 min) triggered by motion detection. The tool should avoid unnecessary recordings to optimize storage space and improve video retrieval efficiency.
- Object Recognition: Object Detection via ONNX: Implement object detection using YOLOv5/YOLOv8 models converted to ONNX format.
- Data Storage: Local Storage Management: Store video segments, snapshots, and JSON metadata locally.
- Live Dashboard: Customizable Frontend: Build a React-based frontend for grid view, picture-in-picture (PIP), and fullscreen viewing. The tool should allow users to create layouts on the fly, automatically and intelligently suggesting reasonable defaults for ease of use.
- Camera Manager: Layout and Playback API: Provide an API (FastAPI) for managing camera layouts, video playback, and event handling. The tool will use the LLM to help users organize camera views by using named locations in the video feed to sort the available views in a layout.
- Docker Support: Dockerized Deployment: Create a Docker Compose setup with backend (Python + FastAPI) and frontend.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to represent stability and security.
- Background color: Dark Gray (#303030) for a modern, low-distraction interface.
- Accent color: Electric Blue (#03A9F4) for interactive elements and highlights, providing a clear visual distinction against the dark background.
- Body and headline font: 'Inter' sans-serif for a clean, modern, and easily readable interface.
- Use a set of minimalist icons from a library like FontAwesome for controls and status indicators.
- Implement a responsive grid layout that adapts to different screen sizes and resolutions. The UI should include drag-and-drop functionality for arranging camera feeds.
- Subtle transitions and animations to enhance user experience (e.g., camera feed loading, object detection highlighting).