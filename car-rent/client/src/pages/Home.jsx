import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection';
import Banner from '../components/Banner';
import Textimonial from '../components/Testimonial';
import Newsletter from '../components/Newsletter';

const Home = () => {
  return (
    <>
     <Hero /> 
     <FeaturedSection />
     <Banner />
     <Textimonial />
     <Newsletter />
    </>
  )
}

export default Home;
