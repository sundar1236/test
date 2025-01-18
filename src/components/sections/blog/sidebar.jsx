import React from 'react'
import author from "../../../assets/images/blog/author.jpg"
import { Link } from 'react-router-dom'
const Sidebar = () => {
  return (
    <div className="col-lg-4">
      <div className="single-blog-sidebar-area">
        <div className="single-side-bar">
          <h2>Search</h2>
          <input type="text" className="form-control" placeholder="Search" />
          <button>Search</button>
        </div>
        <div className="single-side-bar">
          <h2>about me</h2>
          <img src={author} alt="" />
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
        </div>
        <div className="single-side-bar">
          <h2>Catagory lists</h2>
          <ul>
            <li><Link to="#"> Business planning <span>(5)</span></Link></li>
            <li><Link to="#"> CMS Web Templates <span>(3)</span></Link></li>
            <li><Link to="#"> Html Templates <span>(6)</span></Link></li>
            <li><Link to="#"> Graphics Design <span>(4)</span></Link></li>
            <li><Link to="#"> WordPress <span>(8)</span></Link></li>
          </ul>
        </div>
        <div className="single-side-bar">
          <h2>Tags</h2>
          <div className="tag">
            <Link to="#">Web design</Link>
            <Link to="#">Web Development</Link>
            <Link to="#">Accounting</Link>
            <Link to="#">Taxation</Link>
            <Link to="#">Retirement</Link>
            <Link to="#">Financial planning</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar