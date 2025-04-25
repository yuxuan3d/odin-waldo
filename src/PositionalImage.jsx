import React, { useRef } from 'react';
import './PositionalImage.css'; // Import your CSS styles for the image

function PositionableImage({ src, alt, markers = [], onImageClick }) {
    const imageRef = useRef(null);
  
    const handleInternalImageClick = (event) => {
      if (!imageRef.current || !onImageClick) return;
  
      const imageRect = imageRef.current.getBoundingClientRect();
      const clickX = event.clientX - imageRect.left;
      const clickY = event.clientY - imageRect.top;
      const imageWidth = imageRef.current.offsetWidth;
      const imageHeight = imageRef.current.offsetHeight;
  
      const clickData = {
        clickXPercent: (clickX / imageWidth) * 100,
        clickYPercent: (clickY / imageHeight) * 100,
        imageWidth,
        imageHeight,
        originalEvent: event,
      };
      onImageClick(clickData);
    };
  
    return (
      <div className="image-container">
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="positionable-image"
          onClick={handleInternalImageClick}
        />
        {markers.map((marker) => (
          <div
            key={marker.id} // Need a unique key
            className="marker"
            style={{
              top: `${marker.yPercent}%`,
              left: `${marker.xPercent}%`,
              width: marker.size ? `${marker.size}px` : '15px', // Default size
              height: marker.size ? `${marker.size}px` : '15px',
              backgroundColor: marker.color || 'rgba(180, 55, 218, 0.6)', // Default color
              // Add other styles like border based on marker props if needed
            }}
          />
        ))}
      </div>
    );
  }

  export default PositionableImage;