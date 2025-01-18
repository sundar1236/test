import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const CustomCursor = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  // Use a spring animation for smoother cursor movement
  const springConfig = { stiffness: 500, damping: 50 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);
  const cursorOpacity = useTransform(cursorX, [0, 1], [0, 1]);

  const handleMouseMove = (e) => {
    cursorX.set(e.clientX);
    cursorY.set(e.clientY);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div id="magic-cursor">
      <motion.div
        id="ball"
        style={{
          x: springX,
          y: springY,
          opacity: cursorOpacity,
          scale: 1,
        }}
        // whileHover={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </div>
  );
};

export default CustomCursor;
