import React from 'react'
import { ScrollRestoration } from 'react-router-dom'
import Portfolio from '../components/sections/portfolio'
import PageHeading from '../components/sections/pageHeading'
import CallToAction from '../components/sections/callToAction'

const Projects = () => {
  return (
    <>
      <PageHeading
        heading={"Projects"}
        description={"Check out my portfolio of top-notch projects that I've delivered to both clients and the community. I'm more than happy to answer any questions you may have about how we can collaborate to achieve your objectives. Feel free to get in touch with me."}
      />
      <Portfolio />
      <CallToAction/>
      <ScrollRestoration/>
    </>
  )
}

export default Projects