// ...existing code...
import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import CarCard from '../components/CarCard';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';

const Cars = () => {
  const [searchParams] = useSearchParams();
  const pickupLocation = searchParams.get('pickupLocation');
  const pickupDate = searchParams.get('pickupDate');
  const returnDate = searchParams.get('returnDate');

  const { cars, axios } = useAppContext();

  const [input, setInput] = useState('');
  const [filteredCars, setFilteredCars] = useState([]);

  const isSearchData = pickupLocation && pickupDate && returnDate;

  const applyFilter = () => {
    if (input === '') {
      setFilteredCars(cars); // Show all if input is empty
      return;
    }

    const filtered = cars.filter((car) => {
      // guard in case some fields are missing
      const brand = (car.brand || '').toString().toLowerCase();
      const model = (car.model || '').toString().toLowerCase();
      const category = (car.category || '').toString().toLowerCase();
      const transmission = (car.transmission || '').toString().toLowerCase();
      const q = input.toLowerCase();

      return (
        brand.includes(q) ||
        model.includes(q) ||
        category.includes(q) ||
        transmission.includes(q)
      );
    });

    setFilteredCars(filtered);
  };

  const searchCarAvailability = async () => {
    try {
      const { data } = await axios.post('/api/bookings/check-availability', {
        location: pickupLocation,
        pickupDate,
        returnDate,
      });
      if (data && data.success) {
        setFilteredCars(data.availableCars || []);
        if (!data.availableCars || data.availableCars.length === 0) toast('No cars available');
      } else {
        setFilteredCars([]);
        toast.error(data?.message || 'No available cars');
      }
    } catch (err) {
      console.error('Availability check failed:', err);
      toast.error('Unable to check availability — backend may be down');
      setFilteredCars([]); // fallback to avoid undefined state
    }
  };

  useEffect(() => {
    if (isSearchData) {
      searchCarAvailability();
    } else {
      setFilteredCars(cars); // Initial load / when search cleared
    }
  }, [cars, isSearchData, pickupLocation, pickupDate, returnDate]); // added deps

  useEffect(() => {
    if (cars.length > 0 && !isSearchData) applyFilter();
  }, [input, cars, isSearchData]); // added isSearchData

  return (
    <div className="bg-light min-h-screen px-6 md:px-16 lg:px-24 xl:px-32">
      {/* Header: Title + Subtitle + Search */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center text-center py-20"
      >
        <Title
          title="Available Cars"
          subTitle="Browse our selection of premium vehicles available for your next adventure"
        />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center bg-white px-4 mt-6 max-w-xl w-full h-12 rounded-full shadow-md"
        >
          <img src={assets.search_icon} alt="search" className="w-4.5 h-4.5 mr-2" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by make, model or features"
            className="w-full h-full outline-none text-gray-500 bg-transparent"
          />
          <img src={assets.filter_icon} alt="filter" className="w-4.5 h-4.5 ml-2" />
        </motion.div>
      </motion.div>

      {/* Car count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex justify-between items-center mb-6"
      >
        <p className="text-gray-500 text-sm">
          Showing <span className="font-medium text-black">{filteredCars?.length || 0}</span> cars
        </p>
      </motion.div>

      {/* Grid of Cars */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        gap-8 mt-4 xl:px-20 max-w-7xl mx-auto"
      >
        {filteredCars.map((car, index) => (
          <motion.div
            key={car._id ?? index} // prefer stable id if available
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
          >
            <CarCard car={car} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Cars;
// ...existing code...