
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import { useReports } from '../hooks/useReports';
import { ReportType, Report } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Modal from './ui/Modal';
import Input from './ui/Input';
import { FaSearch, FaChevronDown } from 'react-icons/fa';

const createIcon = (color: 'green' | 'red') => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color === 'green' ? '#5A8C33' : '#B94A48'}" width="36px" height="36px" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`;
  return new L.DivIcon({
    html: svgIcon,
    className: 'dummy',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const greenIcon = createIcon('green');
const redIcon = createIcon('red');

const ReportForm: React.FC<{ 
    onSubmit: (data: Omit<Report, 'id' | 'coords' | 'reportedAt' | 'user'>, coords?: { lat: number; lng: number }) => void; 
    onDone: () => void; 
    initialCoords?: { lat: number; lng: number } | null;
    initialLocation?: string; 
}> = ({ onSubmit, onDone, initialCoords, initialLocation }) => {
    const [type, setType] = useState<ReportType>(ReportType.TreePlantation);
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialLocation) {
            setLocation(initialLocation);
        }
    }, [initialLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({ type, location, description }, initialCoords ?? undefined);
        setIsSubmitting(false);
        onDone();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {initialCoords && <p className="text-sm text-center text-gray-500 dark:text-dark-text-secondary">Reporting for coordinates: {initialCoords.lat.toFixed(4)}, {initialCoords.lng.toFixed(4)}</p>}
            <div>
                <label className="block text-sm font-medium text-forest-green dark:text-dark-text-secondary mb-2">Report Type</label>
                <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setType(ReportType.TreePlantation)} className={`p-3 rounded-lg text-center transition-all ${type === ReportType.TreePlantation ? 'bg-lime-green text-white shadow-md scale-105' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>🌱 Tree Plantation</button>
                    <button type="button" onClick={() => setType(ReportType.PollutionHotspot)} className={`p-3 rounded-lg text-center transition-all ${type === ReportType.PollutionHotspot ? 'bg-earth-red text-white shadow-md scale-105' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>⚠ Pollution</button>
                </div>
            </div>
            <Input id="location" label="Location Name" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Central Park" required />
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-forest-green dark:text-dark-text-secondary mb-1">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-lime-green/50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-green transition bg-white dark:bg-gray-700 dark:text-dark-text dark:border-gray-600" placeholder="Add more details here..." required></textarea>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
        </form>
    );
};

const MapEvents: React.FC<{ onMapClick: (coords: LatLng) => void }> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
};

const MapSearch: React.FC = () => {
    const map = useMap();
    const [query, setQuery] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                map.flyTo([parseFloat(lat), parseFloat(lon)], 14);
            } else {
                alert('Location not found.');
            }
        } catch (error) {
            console.error("Geocoding API error:", error);
            alert("Could not search for the location. Please try again later.");
        }
    };

    return (
        <div className="absolute top-4 right-4 z-[1001]">
            <form onSubmit={handleSearch} className="flex items-center bg-white dark:bg-dark-card rounded-lg shadow-lg">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search address or city..."
                    className="py-2 px-3 rounded-l-lg border-0 focus:outline-none focus:ring-2 focus:ring-lime-green bg-transparent dark:text-dark-text"
                />
                <button type="submit" className="p-3 bg-lime-green text-white rounded-r-lg hover:bg-forest-green transition-colors">
                    <FaSearch />
                </button>
            </form>
        </div>
    );
};

interface MapViewProps {
    theme: 'light' | 'dark';
    isAdmin: boolean;
}

const MapView: React.FC<MapViewProps> = ({ theme, isAdmin }) => {
  const { reports, treePlantationCount, pollutionHotspotCount, addReport, deleteReport } = useReports();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReportCoords, setNewReportCoords] = useState<LatLng | null>(null);
  const [showToast, setShowToast] = useState(true);
  const [prefilledLocation, setPrefilledLocation] = useState('');
  const [isReportsCardOpen, setIsReportsCardOpen] = useState(true);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  const openDeleteConfirm = (report: Report) => {
    setReportToDelete(report);
  };

  const closeDeleteConfirm = () => {
    setReportToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (reportToDelete) {
        setIsDeleting(true);
        try {
            await deleteReport(reportToDelete.id);
            closeDeleteConfirm();
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
        }
    }
  };

  const handleMapClick = async (coords: LatLng) => {
    setNewReportCoords(coords);
    setIsModalOpen(true);
    setPrefilledLocation('Fetching location...');
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
        const data = await response.json();
        if (data && data.display_name) {
            setPrefilledLocation(data.display_name);
        } else {
            setPrefilledLocation('Could not find address');
        }
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        setPrefilledLocation('Could not find address');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewReportCoords(null);
    setPrefilledLocation('');
  };

  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  return (
    <div className="relative h-[calc(100vh-174px)] md:h-[calc(100vh-76px)]">
      <MapContainer key={theme} center={[37.7749, -122.4194]} zoom={12} scrollWheelZoom={true} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />
        {reports.map(report => {
            const isOwner = report.user.name === 'Current User';
            return (
          <Marker 
            key={report.id} 
            position={[report.coords.lat, report.coords.lng]} 
            icon={report.type === ReportType.TreePlantation ? greenIcon : redIcon}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-lg text-forest-green">{report.type}</h3>
                <p className="font-semibold text-lime-green">{report.location}</p>
                <p className="my-2">{report.description}</p>
                <p className="text-xs text-gray-500">Reported by {report.user.name} on {report.reportedAt.toLocaleDateString()}</p>
                {(isOwner || isAdmin) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-center">
                        <button
                            onClick={() => openDeleteConfirm(report)}
                            className="text-sm text-earth-red hover:underline font-semibold"
                        >
                            Delete Report
                        </button>
                    </div>
                )}
              </div>
            </Popup>
          </Marker>
        )})}
        <MapEvents onMapClick={handleMapClick} />
        <MapSearch />
      </MapContainer>
      <div className="absolute top-4 left-4 z-10 w-[calc(100%-2rem)] max-w-sm md:max-w-md animate-fade-in-up">
        <Card>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-forest-green dark:text-dark-text">Community Reports</h2>
              <button
                onClick={() => setIsReportsCardOpen(!isReportsCardOpen)}
                className="p-2 rounded-full hover:bg-lime-green/20 dark:hover:bg-gray-700 transition-colors"
                aria-label={isReportsCardOpen ? "Hide reports panel" : "Show reports panel"}
                aria-expanded={isReportsCardOpen}
              >
                <FaChevronDown className={`transform transition-transform duration-300 ${isReportsCardOpen ? 'rotate-0' : '-rotate-90'}`} />
              </button>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isReportsCardOpen ? 'max-h-40 mt-4' : 'max-h-0'}`}>
                <div className="space-y-4">
                    <div className="text-center">
                        <div className="flex justify-around mt-2 text-lg">
                            <span className="font-semibold" title="Trees Planted">🌱 {treePlantationCount}</span>
                            <span className="font-semibold" title="Pollution Hotspots">⚠ {pollutionHotspotCount}</span>
                        </div>
                    </div>
                    <Button className="w-full" onClick={() => setIsModalOpen(true)}>+ Add New Report</Button>
                </div>
            </div>
        </Card>
      </div>
      {showToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-forest-green text-cream px-4 py-2 rounded-lg shadow-xl animate-fade-in-up">
              💡 Tip: Click anywhere on the map to add a new report!
          </div>
      )}
       <Modal isOpen={isModalOpen} onClose={handleModalClose} title="Submit a New Report">
            <ReportForm 
                onSubmit={addReport} 
                onDone={handleModalClose} 
                initialCoords={newReportCoords}
                initialLocation={prefilledLocation}
            />
       </Modal>
       <Modal isOpen={!!reportToDelete} onClose={closeDeleteConfirm} title="Confirm Deletion">
            {reportToDelete && (
                <div className="text-center">
                    <p className="text-lg text-gray-700 dark:text-dark-text-secondary mb-4">
                        Are you sure you want to delete this report for <span className="font-bold">{reportToDelete.location}</span>?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
                    <div className="flex justify-center gap-4 mt-6">
                        <Button variant="secondary" onClick={closeDeleteConfirm} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-earth-red hover:bg-red-700 focus:ring-earth-red"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </div>
            )}
        </Modal>
    </div>
  );
};

export default MapView;
