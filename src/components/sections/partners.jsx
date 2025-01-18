import React from 'react'
import Marquee from "react-fast-marquee";

import partner1 from "../../assets/images/client-logos/partner1.png"
import partner2 from "../../assets/images/client-logos/partner2.png"
import partner3 from "../../assets/images/client-logos/partner3.png"
import partner4 from "../../assets/images/client-logos/partner4.png"
import partner5 from "../../assets/images/client-logos/partner5.png"

const Partners = () => {
    return (
        <div className="company-design-area">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <h2>Company I Worked With</h2>
                        <div className="company-list">
                            <div className="scroller">
                                <Marquee >
                                    <div className="scroller__inner">
                                        <img src={partner1} alt="" />
                                        <img src={partner2} alt="" />
                                        <img src={partner3} alt="" />
                                        <img src={partner4} alt="" />
                                        <img src={partner5} alt="" />
                                        <img src={partner1} alt="" />
                                    </div>
                                </Marquee>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Partners