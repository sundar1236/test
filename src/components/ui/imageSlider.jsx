import { RiArrowLeftFill, RiArrowLeftLine, RiArrowLeftSLine, RiArrowRightSLine, RiCloseFill } from '@remixicon/react';
import React, { useState, useEffect } from 'react';

const ImageSlider = ({ images, isOpen, onClose, currentIndex }) => {
    const [currentSlide, setCurrentSlide] = useState(currentIndex);

    useEffect(() => {
        setCurrentSlide(currentIndex);
    }, [currentIndex]);

    if (!isOpen) return null;

    const nextSlide = () => {
        setCurrentSlide((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlide((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="slider-overlay">
            <div className="slider-container">
                <button className="close-button" onClick={onClose}> <RiCloseFill size={25} /> </button>
                <div className="slider">
                    <button className="prev-button" onClick={prevSlide}> <RiArrowLeftSLine size={25}/> </button>
                    <img src={images[currentSlide].src} alt="Slider" className="slider-image" />
                    <button className="next-button" onClick={nextSlide}><RiArrowRightSLine size={25}/></button>
                </div>
            </div>
        </div>
    );
};

export default ImageSlider;
