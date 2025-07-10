import { useState, useEffect } from 'react';

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if we have a Google Maps API key from the backend
    const checkGoogleMapsIntegration = async () => {
      try {
        const response = await fetch('/api/integrations');
        const integrations = await response.json();
        const googleMapsIntegration = integrations.find((i: any) => i.name === 'google_maps');
        
        if (googleMapsIntegration && googleMapsIntegration.credentials?.apiKey) {
          const key = googleMapsIntegration.credentials.apiKey;
          setApiKey(key);
          
          // Load Google Maps script
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&callback=initGoogleMaps`;
          script.async = true;
          script.defer = true;
          
          window.initGoogleMaps = () => {
            setIsLoaded(true);
          };
          
          document.head.appendChild(script);
          
          return () => {
            document.head.removeChild(script);
            delete window.initGoogleMaps;
          };
        }
      } catch (error) {
        console.error('Failed to check Google Maps integration:', error);
      }
    };

    checkGoogleMapsIntegration();
  }, []);

  return { isLoaded, apiKey };
}