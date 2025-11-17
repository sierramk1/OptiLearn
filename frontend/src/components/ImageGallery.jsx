import React from 'react';

const ImageGallery = ({ week, images }) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '1.5em', fontWeight: 'bold', marginBottom: '10px' }}>Week {week} Screenshots</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
        {images.map((image, index) => (
          <a key={index} href={`/screenshots/week ${week}/${image}`} target="_blank" rel="noopener noreferrer">
            <img
              src={`/screenshots/week ${week}/${image}`}
              alt={`Week ${week} Screenshot ${index + 1}`}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
