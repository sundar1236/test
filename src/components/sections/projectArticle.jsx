import React, { useState } from 'react'
import work from "../../assets/images/projects/work2.jpg"
import project1 from "../../assets/images/projects/single-project1.jpg"
import project2 from "../../assets/images/projects/single-project2.jpg"
import project3 from "../../assets/images/projects/single-project3.jpg"
import project4 from "../../assets/images/projects/single-project4.jpg"
import ImageSlider from '../ui/imageSlider'
const projectsData = [
    {
        id: 1,
        src: project1
    },
    {
        id: 2,
        src: project2
    },
    {
        id: 3,
        src: project3
    },
    {
        id: 4,
        src: project4
    },
]
const ProjectArticle = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openSlider = (index) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeSlider = () => {
        setIsOpen(false);
    };
    return (
        <>
            <div className="single-project-page-design">
                <div className="single-project-image">
                    <img src={work} alt="image" />
                </div>
                <div className="container pt-60 pb-40">
                    <div className="row">
                        <div className="col-lg-4">
                            {/* <!-- START SINGLE LEFT DESIGN AREA --> */}
                            <div className="single-project-page-left wow fadeInUp delay-0-2s">
                                <div className="single-info">
                                    <p>Year</p>
                                    <h3>2024</h3>
                                </div>
                                <div className="single-info">
                                    <p>Client</p>
                                    <h3>Bento Studio</h3>
                                </div>
                                <div className="single-info">
                                    <p>Services</p>
                                    <h3>Web Design</h3>
                                </div>
                                <div className="single-info">
                                    <p>Project</p>
                                    <h3>Creative</h3>
                                </div>
                            </div>
                            {/* <!-- / END SINGLE LEFT DESIGN AREA --> */}
                        </div>
                        {/* <!-- START SINGLE RIGHT DESIGN AREA --> */}
                        <div className="col-lg-8">
                            <div className="single-project-page-right wow fadeInUp delay-0-4s">
                                <h2>
                                    Description
                                </h2>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit utsadi sfejdis aliquam, purus sit amet luctus venenatis, lectus magna sansit trandis fringilla urna, porttitor rhoncus dolor purus non enim dollors praesent tabasi elementum facilisis leo.</p>
                                <p>Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable sourc consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source.</p>
                            </div>
                        </div>
                        {/* <!-- / END SINGLE RIGHT DESIGN AREA --> */}
                    </div>
                    {/* <!-- START SINGLE PAGE GALLERY DESIGN AREA --> */}
                    <div className="row pt-60">
                        {
                            projectsData.map(({ id, src }, index) => {
                                return (
                                    <div className="col-lg-6">
                                        <div key={id} onClick={() => openSlider(index)} className="work-popup">
                                            <div className="single-image wow fadeInUp delay-0-2s">
                                                <img src={src} alt="gallery" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }

                    </div>
                    {/* <!--  / END SINGLE PAGE GALLERY DESIGN AREA --> */}
                </div>
            </div>
            <ImageSlider images={projectsData} isOpen={isOpen} onClose={closeSlider} currentIndex={currentIndex} />
        </>
    )
}

export default ProjectArticle