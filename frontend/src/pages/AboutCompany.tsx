import React from 'react';
import { Link } from 'react-router-dom';

const AboutCompany: React.FC = () => {
  return (
    <div className="container" style={{ padding: '3rem 2rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#3D2B1F', fontFamily: 'var(--font-heading)' }}>About KidEnDu</h1>
        <p style={{ color: '#3D2B1F', background: '#FFE4C4', padding: '1rem', borderRadius: 12, marginTop: '1rem' }}>
          KidEnDu is a creative company focused on beautiful, professional digital experiences. This about page is a simple placeholder you can expand into a full company story or team section.
        </p>
        <div style={{ marginTop: '1.75rem' }}>
          <Link to="/" className="btn" style={{ background: '#3D2B1F', color: '#FFE4C4', padding: '0.6rem 1rem', borderRadius: 12 }}>Back Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutCompany;
