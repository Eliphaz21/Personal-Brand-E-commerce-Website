import React from 'react';
import { useAuth } from '../hooks/useAuth';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <h1>Your Profile</h1>
      <p style={{ marginTop: '1rem' }}>Manage your personal details, order history, and preferences.</p>
      {user && (
        <div style={{ marginTop: '2rem', padding: '2rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.isVerified ? 'Verified' : 'Pending Verification'}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
