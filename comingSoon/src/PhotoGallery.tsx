import React, { useState, useEffect } from 'react';
import './PhotoGallery.css';

import p1 from './assets/hackathon2026Photos/hackathonPhoto1.jpg';
import p2 from './assets/hackathon2026Photos/hackathonPhoto2.jpg';
import p3 from './assets/hackathon2026Photos/hackathonPhoto3.jpg';
import p4 from './assets/hackathon2026Photos/hackathonPhoto4.jpg';
import p5 from './assets/hackathon2026Photos/hackathonPhoto5.jpg';
import p6 from './assets/hackathon2026Photos/hackathonPhoto6.jpg';

const photos = [p1, p2, p3, p4, p5, p6];

const PhotoGallery: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="photo-gallery">
      <div className="gallery-header">
        <h2 className="gallery-title">Previous Hackathon Highlights 2026</h2>
      </div>
      <div className="gallery-container">
        <div 
          className="gallery-track" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {photos.map((src, i) => (
            <div className="gallery-slide" key={i}>
              <img src={src} alt={`Hackathon ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="gallery-dots">
        {photos.map((_, i) => (
          <button
            key={i}
            className={`gallery-dot ${i === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PhotoGallery;
