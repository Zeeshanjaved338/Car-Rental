import React, { useState } from 'react';
import { assets, ownerMenuLinks } from '../../assets/assets';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';

const Slidebar = () => {
  const { user, axios, fetchUser } = useAppContext(); // Corrected typo 'fetchuser' to 'fetchUser'
  const location = useLocation();
  const [image, setImage] = useState(null); // Initialize as null, will hold the file

  const updateImage = async () => {
    try {
      const formData = new FormData();
      formData.append("image", image); // Append the file with the key "image"

      const { data } = await axios.post('/api/owner/update-image', formData, {
        headers: { "Content-Type": "multipart/form-data" }, // Set correct content type
      });
      if (data.success) {
        fetchUser(); // Fetch updated user data
        toast.success(data.message);
        setImage(null); // Clear the image state after success
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="relative min-h-screen md:flex flex-col items-center pt-8 max-w-60 w-full border-r border-borderColor text-sm bg-white">
      {/* User Image Upload */}
      <div className="group relative">
        <label htmlFor="image" className="cursor-pointer">
          <img
            src={
              image
                ? URL.createObjectURL(image)
                : user?.image ||
                  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300'
            }
            alt="user"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          />
          <input
            type="file"
            id="image"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])} // Set the file object
          />
          <div className="absolute hidden group-hover:flex items-center justify-center top-0 left-0 w-20 h-20 bg-black/20 rounded-full">
            <img src={assets.edit_icon} alt="edit" className="w-5" />
          </div>
        </label>
      </div>

      {/* Save Button */}
      {image && (
        <button
          className="absolute top-2 right-2 flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs"
          onClick={updateImage}
        >
          Save <img src={assets.check_icon} width={13} alt="check" />
        </button>
      )}

      {/* Username */}
      <p className="mt-2 text-base max-md:hidden">{user?.name}</p>

      {/* Navigation Links */}
      <div className="w-full">
        {ownerMenuLinks.map((link, index) => {
          return (
            <NavLink
              key={index}
              to={link.path}
              className={`relative flex items-center gap-2 w-full py-3 pl-4 first:mt-6 ${
                link.path === location.pathname
                  ? 'bg-blue-500/10 text-blue-500 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <img
                src={
                  link.path === location.pathname
                    ? link.coloredIcon
                    : link.icon
                }
                alt="icon"
                className="w-5"
              />
              <span className="max-md:hidden">{link.name}</span>
              {link.path === location.pathname && (
                <div className="absolute right-0 w-1.5 h-8 bg-blue-500 rounded-l-lg"></div>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default Slidebar;