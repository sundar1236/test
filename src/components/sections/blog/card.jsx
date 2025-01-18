import { RiArrowRightLine } from '@remixicon/react'
import React from 'react'
import { Link } from 'react-router-dom'

const Card = ({ src, date, title, tag }) => {
    return (
        <div className="row blog-post-box align-items-center">
            <div className="col-lg-6">
                <div className="blog-post-img">
                    <Link to="/single-blog">
                        <img src={src} alt="" />
                    </Link>
                    <div className="blog-post-category">
                        <Link to="#">{tag}</Link>
                    </div>
                </div>
            </div>
            <div className="col-lg-6">
                <div className="blog-post-caption">
                    <h3>Posted on {date}</h3>
                    <h2><Link className="link-decoration" to="/single-blog">{title}</Link></h2>
                    <Link className="theme-btn" to="/single-blog">Read more <i><RiArrowRightLine size={16} /></i>  </Link>
                </div>
            </div>
        </div>
    )
}

export default Card