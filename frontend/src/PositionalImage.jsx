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
          <img
            key={marker.id} // Need a unique key
            src='marker.png' // Path to your marker image
            alt="marker"
            className="image-marker"
            style={{
              top: `${marker.yPercent}%`,
              left: `${marker.xPercent}%`,
            }}
          />
        ))}
      </div>
    );
  }

  export default PositionableImage;