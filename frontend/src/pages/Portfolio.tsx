import React from 'react';
import { Link } from 'react-router-dom';

const Portfolio: React.FC = () => {
  return (
    <div className="container" style={{ padding: '3rem 2rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ color: '#3D2B1F', fontFamily: 'var(--font-heading)', textAlign: 'center' }}>Client Portfolio</h1>
        <p style={{ color: '#3D2B1F', marginTop: '1rem', textAlign: 'center' }}>
          This page is a placeholder for your client's portfolio — add projects, images, and bio here.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#3D2B1F' }}>Project Title</h3>
            <p style={{ color: 'rgba(61,43,31,0.85)' }}>Short description of the project or client work.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#3D2B1F' }}>Project Title</h3>
            <p style={{ color: 'rgba(61,43,31,0.85)' }}>Short description of the project or client work.</p>
          </div>
        </div>
        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <Link to="/profile" className="btn" style={{ background: '#3D2B1F', color: '#FFE4C4', padding: '0.6rem 1rem', borderRadius: 12 }}>View Profile</Link>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
