import React from 'react'

const Resume = () => {
    return (
        <div className="resume-area" id="resume">
            <div className="container">
                <div className="container-inner">
                    <div className="row">
                        <div className="col-xl-12 col-lg-12">
                            <div className="section-title mb-40 wow fadeInUp delay-0-2s">
                                <h2>Education & Experience</h2>
                                <p>Established history of success in design and development, consistently delivering valuable insights and driving significant results.</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xl-10">
                            <div className="resume-wrapper wow fadeInUp delay-0-2s">
                                <Card year={"2020 - Present"} title={"@ Application Developer"} institution={"BloomHub Technology"} description={"As a product designer at a leading e-commerce company, I was responsible for designing user interfaces for the company's online shopping platform. I collaborated closely with the company's marketing and development teams to create designs that not only looked great but also drove conversions and increased sales."} />
                                <Card year={"2018 - 2020"} title={"@ Products Designer"} institution={"Skyward Company Limited"} description={"At a software startup, I worked as a product designer on a team that was responsible for developing a new mobile app. I was responsible for creating wireframes, designing user interfaces, and conducting user testing to ensure that the app was intuitive and user-friendly. My work helped the company launch a successful app that received positive feedback from users."} />
                                <Card year={"2012 - 2028"} title={"@ Senior Developer"} institution={"Atlas Innovations"} description={"As a freelance product designer, I worked with a variety of clients across different industries. I designed packaging for a new food product, created marketing materials for a fashion brand, and developed user interfaces for a healthcare startup. My ability to adapt to different industries and design challenges made me a valuable asset to my clients."} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Resume

const Card = ({ year, description, title, institution }) => {
    return (
        <div className="resume-box">
            <span className="resume-date">{year}</span>
            <h5 className="fw-medium">{institution}</h5>
            <span>{title}</span>
            <p>{description}</p>
        </div>
    )
}