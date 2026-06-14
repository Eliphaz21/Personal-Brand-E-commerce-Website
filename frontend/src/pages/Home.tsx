import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <h1 className="animate-fade-in-up">Welcome to KidEnDu</h1>
      <p className="animate-fade-in-up" style={{ animationDelay: '0.2s', marginTop: '1rem' }}>
        Premium wellness & fertility coaching platform.
      </p>
    </div>
  );
};

export default Home;
