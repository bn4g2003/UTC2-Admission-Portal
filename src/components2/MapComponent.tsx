// components/MapComponent.tsx
import React, { useState, useMemo, useCallback } from 'react';
// Import kiểu GoogleMap từ thư viện
import { GoogleMap, useJsApiLoader, Marker, GoogleMapProps } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapComponent: React.FC = () => { // Thêm kiểu React.FC cho component nếu cần
  const googleMapsApiKey = process.env.NEXT_PUBLIC_Maps_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="h-full w-full bg-red-100 flex items-center justify-center">
        <div className="text-center text-red-700">
          <MapPin className="h-12 w-12 mx-auto mb-4" />
          <p>Lỗi: Không tìm thấy Google Maps API Key.</p>
          <p className="text-sm">Vui lòng kiểm tra file .env.local và biến môi trường.</p>
        </div>
      </div>
    );
  }

  const center = useMemo(() => ({
    lat: 10.8258, // Vĩ độ gần đúng
    lng: 106.7725, // Kinh độ gần đúng
  }), []);

const { isLoaded, loadError } = useJsApiLoader({
  googleMapsApiKey: process.env.NEXT_PUBLIC_Maps_API_KEY as string, // Ép kiểu thành string
  id: 'google-map-script',
  libraries: ['places'],
});


  const [map, setMap] = useState<google.maps.Map | null>(null);
  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (loadError) {
    return <p>Lỗi tải bản đồ: {loadError.message}</p>;
  }

  return (
    <div style={containerStyle}>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={16}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          <Marker position={center} />
        </GoogleMap>
      ) : (
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4" />
            <p>Đang tải bản đồ...</p>
            <p className="text-sm">450-451 Lê Văn Việt, Phường Tăng Nhơn Phú A, TP. Thủ Đức</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;