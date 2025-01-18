import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/sections/header'
import Footer from '../components/sections/footer'
import BackToTop from '../components/ui/backToTop'
import Preloader from '../components/ui/preloader'
import CustomCursor from '../components/ui/customCursor'

const RootLayout = () => {
    return (
        <>
            <Preloader />
            <CustomCursor />
            <Header />
            <Outlet />
            <Footer />
            <BackToTop />
        </>
    )
}

export default RootLayout