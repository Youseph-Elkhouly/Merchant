import React from 'react';

interface ListingCardProps {
  title: string;
  description: string;
  price: number;
  image?: string;
  merchant: string;
}

const ListingCard: React.FC<ListingCardProps> = ({
  title,
  description,
  price,
  image,
  merchant
}) => {
  return (
    <div className="listing-card">
      {image && (
        <div className="listing-image">
          <img src={image} alt={title} />
        </div>
      )}
      <div className="listing-content">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="listing-footer">
          <span className="price">${price.toFixed(2)}</span>
          <span className="merchant">{merchant}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
