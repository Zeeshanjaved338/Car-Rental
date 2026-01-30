import React, { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { axios, user, currency } = useAppContext();

  const fetchMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/bookings/user');
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false); // ✅ stop loading after fetch
    }
  };

  useEffect(() => {
    user && fetchMyBookings();
  }, [user]);

  // ✅ Show a loader before the content is ready
  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-gray-500 text-lg">
        Loading your bookings...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="px-6 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mt-16 max-w-7xl text-sm"
    >
      <Title
        title="My Bookings"
        subTitle="View and manage your car bookings"
        align="left"
      />

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">You don't have any bookings yet</p>
        </div>
      ) : (
        <div>
          {bookings.map((booking, index) => (
            <div
              key={booking._id || index}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-borderColor rounded-lg mt-5 first:mt-12"
            >
              {/* Column 1: Car Info */}
              <div className="md:col-span-1">
                {booking.car?.image && (
                  <div className="rounded-md overflow-hidden mb-3">
                    <img
                      src={booking.car.image}
                      alt={`${booking.car.brand} ${booking.car.model}`}
                      className="w-full h-auto aspect-video object-cover"
                    />
                  </div>
                )}
                <p className="text-lg font-medium mt-2">
                  {booking.car?.brand || 'Unknown brand'}{' '}
                  {booking.car?.model || 'Unknown model'}
                </p>
                <p className="text-gray-500">
                  {booking.car?.year || 'N/A'} • {booking.car?.category || 'N/A'} •{' '}
                  {booking.car?.location || 'N/A'}
                </p>
              </div>

              {/* Column 2: Booking Info */}
              <div className="md:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <p className="px-3 py-1.5 bg-light rounded">
                      Booking #{index + 1}
                    </p>
                    {booking.status && (
                      <p
                        className={`px-3 py-1 text-xs rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-green-400/15 text-green-600'
                            : 'bg-red-400/15 text-red-600'
                        }`}
                      >
                        {booking.status}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={assets.calendar_icon_colored}
                      alt="calendar"
                      className="w-4 h-4 mt-1"
                    />
                    <div>
                      <p className="text-gray-500 text-sm">Rental Period</p>
                      <p>
                        {booking.pickupDate?.split('T')[0] || 'N/A'} to{' '}
                        {booking.returnDate?.split('T')[0] || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={assets.location_icon_colored}
                      alt="location"
                      className="w-4 h-4 mt-1"
                    />
                    <div>
                      <p className="text-gray-500 text-sm">Pick-up Location</p>
                      <p>
                        {booking.car?.location || booking.location || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Price Info */}
              <div className="md:col-span-1 flex flex-col justify-between items-start md:items-end">
                <div className="text-sm text-gray-500 text-left md:text-right">
                  <p>Total Price</p>
                  <h1 className="text-2xl font-semibold text-blue-500">
                    {currency}
                    {booking.price || '0'}
                  </h1>
                  <p>Booked on {booking.createdAt?.split('T')[0] || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyBookings;
