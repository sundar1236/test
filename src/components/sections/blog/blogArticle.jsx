import React from 'react'
import Sidebar from './sidebar'
import blog1 from "../../../assets/images/blog/blog1.jpg"
import Comments from './comments'
import { RiCalendarFill, RiFileCopy2Fill } from '@remixicon/react'

const BlogArticle = () => {
    return (
        <section className="blog-category section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8">
                        {/* <!-- SINGLE BLOG POST DETAILS DESIGN AREA --> */}
                        <div className="single-blog-post-details wow fadeInDown" data-wow-delay="0.2s">
                            <img src={blog1} className="img-responsive" alt="" />
                            <h2>Create a Landing Page That Performs Great</h2>
                            <div className="post-date">
                                <span><i><RiCalendarFill size={15} /></i> 02,Feb 2024</span>
                                <span><i><RiFileCopy2Fill size={15} /></i> website development</span>
                            </div>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.</p>
                            <blockquote>
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.
                            </blockquote>
                            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.</p>
                            <h2>Tags</h2>
                            <div className="tag">
                                <a href="#">Web design</a>
                                <a href="#">Web Development</a>
                                <a href="#">Accounting</a>
                            </div>
                            <div className="next-previews-button-design">
                                <a className="pull-left" href="#"><i className="fa fa-chevron-left"></i> Previous post</a>
                                <a className="pull-right" href="#">Next post <i className="fa fa-chevron-right"></i></a>
                            </div>
                        </div>
                        {/* <!-- / END BLOG POST DESIGN AREA --> */}
                        <Comments />
                    </div>
                    <Sidebar />
                </div>
            </div>
        </section>
    )
}

export default BlogArticle