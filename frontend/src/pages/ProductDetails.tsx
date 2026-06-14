import React from 'react';
import { useParams } from 'react-router-dom';

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <h1>Product Details</h1>
      <p>Viewing product: <strong>{slug}</strong></p>
    </div>
  );
};

export default ProductDetails;
