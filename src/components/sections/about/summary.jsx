import React from 'react'
import profile from "../../../assets/images/about/me.jpg"
const Summary = () => {
    return (
        <section id="about" className="about-area">
            <div className="container">
                <div className="container-inner">
                    <div className="row align-items-center">
                        {/* <!-- START ABOUT IMAGE DESIGN AREA --> */}
                        <div className="col-lg-5">
                            <div className="about-image-part wow fadeInUp delay-0-3s">
                                <img src={profile} alt="About Me" />
                            </div>
                        </div>
                        {/* <!-- / END ABOUT IMAGE DESIGN AREA -->
                        <!-- START ABOUT TEXT DESIGN AREA --> */}
                        <div className="col-lg-7">
                            <div className="about-content-part wow fadeInUp delay-0-5s">
                                <h2>
                                    A passionate <span>web designer</span> turning <span>ideas</span> into visually stunning, user-friendly websites.
                                </h2>
                                <p>
                                    Hello! I’m Stefeny a self-taught & award-winning Digital Designer & Developer with over fifteen years of work experience. I started in my children’s room and got pro at renowned digital nexum AG agencies.
                                </p>
                                <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage.</p>
                            </div>
                        </div>
                        {/* <!-- / END ABOUT TEXT DESIGN AREA --> */}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Summary