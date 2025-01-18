import { RiGlobalFill, RiPantoneFill, RiQuillPenLine } from '@remixicon/react'
import React from 'react'

const Services = () => {
    return (
        <section id="services" className="services-area">
            <div className="container">
                <div className="container-inner">
                    <div className="row">
                        <div className="col-xl-12 col-lg-12">
                            <div className="section-title mb-40 wow fadeInUp delay-0-2s">
                                <h2>Services</h2>
                                <p>My Services Pave the Way for Exceptional Experiences, Where Quality and Commitment Define Every Interaction."</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <Card description={"bionik gives you the blocks & kits you need to create a true website within minutes."} icon={<RiGlobalFill size={55} />} title={"Brand Identity Design"} />
                        <Card description={"bionik gives you the blocks & kits you need to create a true website within minutes."} icon={<RiQuillPenLine size={55}/>} title={"Website Design"} />
                        <Card description={"bionik gives you the blocks & kits you need to create a true website within minutes."} icon={<RiPantoneFill size={55}/>} title={"Application Design"} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Services

const Card = ({ title, description, icon }) => {
    return (
        <div className="col-lg-4 col-md-4">
            <div className="service-item wow fadeInUp delay-0-2s">
                <div className="content">
                    <i>{icon}</i>
                    <h4>{title}</h4>
                    <p>{description}</p>
                </div>
            </div>
        </div>
    )
}