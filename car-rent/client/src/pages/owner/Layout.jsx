import React from 'react'
import NavbarOwner from '../../components/owner/NavbarOwner'
import SlideBar from '../../components/owner/SlideBar'
import { Outlet } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import { useEffect } from 'react'

const Layout = () => {
  const {isOwner, navigate} = useAppContext()

  useEffect(()=>{
    if(!isOwner){
      navigate('/')
    }
  })
  return (
    <div className='flex flex-col'>
      <NavbarOwner />
      <div className='flex'>
      <SlideBar />
      <Outlet />
      </div>
    </div>
  )
}

export default Layout
