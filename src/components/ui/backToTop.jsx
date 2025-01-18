import { RiArrowUpSLine } from '@remixicon/react';
import React, { useEffect, useRef } from 'react';
// import './ScrollProgress.css';

const BackToTop = () => {
    const progressRef = useRef(null);

    useEffect(() => {
        const progressPath = progressRef.current;
        const pathLength = progressPath.getTotalLength();

        // Set up the initial path styles
        progressPath.style.transition = 'none';
        progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
        progressPath.style.strokeDashoffset = pathLength;

        const updateProgress = () => {
            const scroll = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const progress = pathLength - (scroll * pathLength) / height;
            progressPath.style.strokeDashoffset = progress;
        };

        updateProgress();
        window.addEventListener('scroll', updateProgress);

        const handleScroll = () => {
            const offset = 150;
            const progressWrap = document.querySelector('.progress-wrap');
            if (window.scrollY > offset) {
                progressWrap.classList.add('active-progress');
            } else {
                progressWrap.classList.remove('active-progress');
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', updateProgress);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = (event) => {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <div className='progress-wrap cursor-pointer'>
            <div className="position-relative" onClick={scrollToTop}>
                <i><RiArrowUpSLine size={30}  /></i>
                <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
                    <path
                        ref={progressRef}
                        d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
                    />
                </svg>
                
            </div>
        </div>
    );
};

export default BackToTop;
