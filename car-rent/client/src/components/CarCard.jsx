import React from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';

const CarCard = ({ car }) => {
  const currency = import.meta.env.VITE_CURRENCY || '$';
  const navigate = useNavigate()
  return (
    <div onClick= {()=> {navigate(`/car-details/${car._id}`); scrollTo(0,0)}}
    className="group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all 
    duration-500 cursor-pointer bg-white">
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-500
           group-hover:scale-105"
        />
        {car.isAvailable && (
          <p className="absolute top-4 left-4 bg-blue-500/90 text-white text-xs
           px-2.5 py-1 rounded-full">
            Available Now
          </p>
        )}
        <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm
         text-white px-3 py-2 rounded-lg">
          <span className="font-semibold">{currency}{car.pricePerDay}</span>
          <span className="text-sm text-white/80"> / day</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            {car.brand} {car.model}
          </h3>
          <p className="text-gray-500 text-sm">{car.category} • {car.year}</p>
        </div>

        <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-600">
          <div className="flex items-center">
            <img src={assets.users_icon} alt="seats" className="h-4 mr-2" />
            <span>{car.seating_capacity} Seats</span>
          </div>
          <div className="flex items-center">
            <img src={assets.fuel_icon} alt="fuel" className="h-4 mr-2" />
            <span>{car.fuel_type}</span>
          </div>
          <div className="flex items-center">
            <img src={assets.car_icon} alt="transmission" className="h-4 mr-2" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center">
            <img src={assets.location_icon} alt="location" className="h-4 mr-2" />
            <span>{car.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
