import { Report, ReportType } from '../types';

// In-memory database to store reports
const reports: Report[] = [
    {
        id: 1,
        type: ReportType.TreePlantation,
        location: 'Golden Gate Park, San Francisco',
        description: 'Community event planted 50 oak saplings near the conservatory.',
        coords: { lat: 37.7694, lng: -122.4862 },
        reportedAt: new Date('2023-10-26T10:00:00Z'),
        user: { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }
    },
    {
        id: 2,
        type: ReportType.PollutionHotspot,
        location: 'Oakland Estuary',
        description: 'Visible oil sheen and debris floating near the shoreline.',
        coords: { lat: 37.795, lng: -122.279 },
        reportedAt: new Date('2023-10-25T14:30:00Z'),
        user: { name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' }
    },
    {
        id: 3,
        type: ReportType.TreePlantation,
        location: 'Redwood Regional Park, Oakland',
        description: 'Volunteers restored a grove of native redwood trees.',
        coords: { lat: 37.82, lng: -122.18 },
        reportedAt: new Date('2023-11-01T09:00:00Z'),
        user: { name: 'Forest Champion User', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706e' }
    },
    {
        id: 4,
        type: ReportType.PollutionHotspot,
        location: 'Bay Bridge Toll Plaza',
        description: 'Excessive idling car emissions during rush hour.',
        coords: { lat: 37.818, lng: -122.323 },
        reportedAt: new Date('2023-11-02T17:00:00Z'),
        user: { name: 'Diana Miller', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' }
    },
    {
        id: 5,
        type: ReportType.TreePlantation,
        location: 'Presidio, San Francisco',
        description: 'Planted 20 native cypress trees.',
        coords: { lat: 37.798, lng: -122.469 },
        reportedAt: new Date('2023-11-03T11:00:00Z'),
        user: { name: 'Alice Johnson', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }
    },
    {
        id: 6,
        type: ReportType.TreePlantation,
        location: 'Sutro Heights Park',
        description: 'Cleanup and planting of coastal shrubs.',
        coords: { lat: 37.778, lng: -122.513 },
        reportedAt: new Date('2023-11-05T13:00:00Z'),
        user: { name: 'Current User', avatar: 'https://i.pravatar.cc/150?u=currentUser' }
    },
    {
        id: 7,
        type: ReportType.PollutionHotspot,
        location: 'Fisherman\'s Wharf',
        description: 'Litter accumulation near Pier 39.',
        coords: { lat: 37.809, lng: -122.410 },
        reportedAt: new Date('2023-11-06T15:00:00Z'),
        user: { name: 'Bob Williams', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' }
    },
    {
        id: 8,
        type: ReportType.TreePlantation,
        location: 'Salesforce Park',
        description: 'Added new flower beds and two maple trees.',
        coords: { lat: 37.789, lng: -122.396 },
        reportedAt: new Date('2023-11-07T10:30:00Z'),
        user: { name: 'Diana Miller', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' }
    },
     ...Array.from({ length: 15 }, (_, i) => ({
        id: 9 + i,
        type: ReportType.TreePlantation,
        location: 'Various Locations, Oakland',
        description: `Community tree planting event #${i + 1}.`,
        coords: { lat: 37.8044 + (Math.random() - 0.5) * 0.1, lng: -122.2712 + (Math.random() - 0.5) * 0.1 },
        reportedAt: new Date(new Date('2023-11-08T10:00:00Z').getTime() + i * 24 * 60 * 60 * 1000),
        user: { name: 'Forest Champion User', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706e' }
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
        id: 24 + i,
        type: i % 2 === 0 ? ReportType.TreePlantation : ReportType.PollutionHotspot,
        location: 'Various Locations, SF',
        description: `Report submission #${i + 2}.`,
        coords: { lat: 37.7749 + (Math.random() - 0.5) * 0.1, lng: -122.4194 + (Math.random() - 0.5) * 0.1 },
        reportedAt: new Date(new Date('2023-11-10T10:00:00Z').getTime() + i * 24 * 60 * 60 * 1000),
        user: { name: 'Current User', avatar: 'https://i.pravatar.cc/150?u=currentUser' }
    })),
];

const LAT_CENTER = 37.7749;
const LNG_CENTER = -122.4194;

const getRandomOffset = () => (Math.random() - 0.5) * 0.1;

// Simulate API calls
export const getReports = (): Promise<Report[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...reports]);
    }, 500);
  });
};

export const addReport = (reportData: Omit<Report, 'id' | 'coords' | 'reportedAt' | 'user'>, newCoords?: { lat: number; lng: number }): Promise<Report> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newReport: Report = {
        ...reportData,
        id: reports.length + 1,
        coords: newCoords || {
          lat: LAT_CENTER + getRandomOffset(),
          lng: LNG_CENTER + getRandomOffset(),
        },
        reportedAt: new Date(),
        user: { name: 'Current User', avatar: 'https://i.pravatar.cc/150?u=currentUser' } // Mock user
      };
      reports.push(newReport);
      resolve(newReport);
    }, 1000);
  });
};

export const deleteReport = (reportId: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = reports.findIndex(r => r.id === reportId);
      if (index !== -1) {
        reports.splice(index, 1);
        resolve();
      } else {
        reject(new Error('Report not found'));
      }
    }, 500);
  });
};