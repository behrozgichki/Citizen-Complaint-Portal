import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ComplaintMap({ complaints = [] }) {
  const mappedComplaints = complaints.filter(
    (complaint) =>
      complaint.latitude != null &&
      complaint.longitude != null
  );

  if (mappedComplaints.length === 0) {
    return (
      <section className="complaint-map-section">
        <div className="complaint-map-heading">
          <span className="eyebrow">CIVIC ISSUE MAP</span>
          <h2>Complaint Hotspots</h2>
          <p>
            New complaints with captured locations will appear here.
          </p>
        </div>

        <div className="complaint-map-empty">
          📍 No complaints with location data yet.
        </div>
      </section>
    );
  }

  const firstComplaint = mappedComplaints[0];

  return (
    <section className="complaint-map-section">
      <div className="complaint-map-heading">
        <div>
          <span className="eyebrow">CIVIC ISSUE MAP</span>
          <h2>Complaint Hotspots</h2>
          <p>
            Clustered civic issue locations based on citizen reports.
          </p>
        </div>

        <div className="map-complaint-count">
          <strong>{mappedComplaints.length}</strong>
          <span>Mapped Cases</span>
        </div>
      </div>

      <div className="complaint-map-wrapper">
        <MapContainer
          center={[
            firstComplaint.latitude,
            firstComplaint.longitude,
          ]}
          zoom={13}
          scrollWheelZoom={true}
          style={{
            height: "500px",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MarkerClusterGroup
            chunkedLoading
            showCoverageOnHover={false}
            spiderfyOnMaxZoom={true}
          >
            {mappedComplaints.map((complaint) => (
              <Marker
                key={complaint._id}
                position={[
                  Number(complaint.latitude),
                  Number(complaint.longitude),
                ]}
              >
                <Popup>
                  <div className="map-popup-content">
                    <strong>{complaint.title}</strong>

                    <p>
                      {complaint.category} •{" "}
                      {complaint.priority || "Low"} Priority
                    </p>

                    <p>{complaint.area}</p>

                    <div>
                      <strong>Status:</strong>{" "}
                      {complaint.status || "Pending"}
                    </div>

                    <div>
                      <strong>Upvotes:</strong>{" "}
                      {complaint.upvotes || 0}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </section>
  );
}

export default ComplaintMap;