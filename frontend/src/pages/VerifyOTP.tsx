import React from 'react';

export const VerifyOTP: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <h1>Verify OTP</h1>
      <p>Please enter the 6-digit verification code sent to your email address.</p>
    </div>
  );
};

export default VerifyOTP;
