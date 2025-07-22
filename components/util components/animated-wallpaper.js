import React, { useEffect, useRef, useState } from 'react';

const AnimatedWallpaper = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseMoving, setIsMouseMoving] = useState(false);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let lastMouseMoveTime = 0;
    
    // Handle mouse movement
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsMouseMoving(true);
      lastMouseMoveTime = Date.now();
      
      // Set a timeout to detect when mouse stops moving
      setTimeout(() => {
        if (Date.now() - lastMouseMoveTime >= 100) {
          setIsMouseMoving(false);
        }
      }, 100);
    };
    
    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    
    // Enhanced cosmic background with gradient
    const bgColors = {
      start: { r: 2, g: 0, b: 25 },   // Deep cosmic purple
      mid: { r: 8, g: 4, b: 40 },     // Nebula purple
      end: { r: 15, g: 8, b: 60 }     // Cosmic indigo
    };
    
    // Enhanced nebula effects
    const nebulae = [];
    const nebulaCount = 5; // More nebulae for richer cosmic atmosphere
    
    // Enhanced cosmic nebula types with more vibrant colors
    const nebulaTypes = [
      { // Cosmic purple nebula
        colors: [
          { r: 120, g: 60, b: 180, a: 0.04 },  // Deep purple
          { r: 80, g: 40, b: 200, a: 0.04 },   // Violet
          { r: 160, g: 80, b: 220, a: 0.03 }   // Light purple
        ]
      },
      { // Galaxy gold nebula
        colors: [
          { r: 180, g: 140, b: 60, a: 0.035 }, // Gold
          { r: 200, g: 120, b: 40, a: 0.035 }, // Orange-gold
          { r: 220, g: 180, b: 100, a: 0.03 }  // Light gold
        ]
      },
      { // Cosmic teal nebula
        colors: [
          { r: 40, g: 160, b: 140, a: 0.025 }, // Teal
          { r: 60, g: 180, b: 200, a: 0.025 }, // Cyan
          { r: 80, g: 200, b: 160, a: 0.02 }   // Light teal
        ]
      },
      { // Magenta cosmic clouds
        colors: [
          { r: 180, g: 40, b: 140, a: 0.03 },  // Magenta
          { r: 200, g: 60, b: 180, a: 0.03 },  // Pink-purple
          { r: 160, g: 20, b: 120, a: 0.025 }  // Deep magenta
        ]
      }
    ];
    
    // Enhanced star system
    const stars = [];
    const starCount = 1200; // More stars for denser cosmic feel
    const starLayers = 4; // More layers for better depth
    
    // Enhanced star types with cosmic colors
    const starTypes = [
      { size: 1.8, speed: 0.5, color: [180, 220, 255], glowSize: 6, glowOpacity: 0.4 }, // Bright cosmic blue
      { size: 1.5, speed: 0.4, color: [255, 240, 180], glowSize: 4, glowOpacity: 0.35 }, // Warm stellar yellow
      { size: 1.2, speed: 0.3, color: [255, 180, 200], glowSize: 3, glowOpacity: 0.3 },  // Pink giant star
      { size: 1.0, speed: 0.25, color: [200, 255, 220], glowSize: 2, glowOpacity: 0.25 }, // Green star
      { size: 0.9, speed: 0.2, color: [220, 180, 255], glowSize: 2, glowOpacity: 0.2 },  // Purple star
      { size: 0.6, speed: 0.15, color: [255, 255, 255], glowSize: 1, glowOpacity: 0.15 } // White dwarf
    ];
    
    // Enhanced cosmic dust particles
    const spaceDust = [];
    const dustCount = 500; // More cosmic dust for atmosphere
    
    // Create stars
    for (let i = 0; i < starCount; i++) {
      const layer = Math.floor(Math.random() * starLayers) + 1;
      const typeIndex = Math.floor(Math.random() * starTypes.length);
      const starType = starTypes[typeIndex];
      
      // Add some variation to star properties based on type
      const sizeVariation = Math.random() * 0.5 + 0.8; // 0.8 to 1.3 multiplier
      
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: starType.size * sizeVariation,
        speed: starType.speed * (layer / starLayers) * (Math.random() * 0.5 + 0.75), // More variation in speed
        layer: layer,
        color: [...starType.color], // Copy the color array
        glowSize: starType.glowSize,
        glowOpacity: starType.glowOpacity,
        twinkle: {
          active: Math.random() > 0.7, // 30% of stars twinkle
          speed: Math.random() * 0.02 + 0.01,
          phase: Math.random() * Math.PI * 2 // Random starting phase
        }
      });
    }
    
    // Create enhanced cosmic dust with colors
    const dustColors = [
      [200, 200, 255], // Blue-white
      [255, 200, 220], // Pink
      [200, 255, 200], // Green
      [255, 220, 180], // Gold
      [220, 180, 255]  // Purple
    ];
    
    for (let i = 0; i < dustCount; i++) {
      const colorIndex = Math.floor(Math.random() * dustColors.length);
      spaceDust.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 0.6 + 0.2,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.08 + 0.05,
        color: dustColors[colorIndex]
      });
    }
    
    // Generate nebula clouds
    for (let i = 0; i < nebulaCount; i++) {
      const typeIndex = Math.floor(Math.random() * nebulaTypes.length);
      const nebulaType = nebulaTypes[typeIndex];
      
      // Create a large nebula that spans a portion of the screen
      const centerX = Math.random() * canvas.width;
      const centerY = Math.random() * canvas.height;
      const radius = Math.random() * 300 + 200;
      
      // Create cloud particles for this nebula
      const particles = [];
      const particleCount = Math.floor(Math.random() * 100) + 150;
      
      for (let j = 0; j < particleCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Select a color from the nebula type
        const colorIndex = Math.floor(Math.random() * nebulaType.colors.length);
        const color = nebulaType.colors[colorIndex];
        
        particles.push({
          x: x,
          y: y,
          radius: Math.random() * 40 + 20,
          color: {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a * (Math.random() * 0.5 + 0.5) // Vary opacity
          }
        });
      }
      
      nebulae.push({
        centerX: centerX,
        centerY: centerY,
        radius: radius,
        particles: particles,
        type: typeIndex,
        // Slow rotation
        rotation: {
          speed: (Math.random() * 0.0002 + 0.0001) * (Math.random() > 0.5 ? 1 : -1),
          angle: 0
        }
      });
    }
    
    // Create an enhanced cosmic gradient background
    const createBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, `rgba(${bgColors.end.r}, ${bgColors.end.g}, ${bgColors.end.b}, 1)`);
      gradient.addColorStop(0.5, `rgba(${bgColors.mid.r}, ${bgColors.mid.g}, ${bgColors.mid.b}, 1)`);
      gradient.addColorStop(1, `rgba(${bgColors.start.r}, ${bgColors.start.g}, ${bgColors.start.b}, 1)`);
      return gradient;
    };
    
    // Draw stars
    const drawStars = (time) => {
      stars.forEach(star => {
        // Move stars downward for a gentle falling effect
        star.y += star.speed;
        
        // Loop stars back to top when they exit bottom
        if (star.y > canvas.height) {
          star.y = -5;
          star.x = Math.random() * canvas.width;
        }
        
        // Calculate twinkle effect if active
        let opacity = 1;
        if (star.twinkle.active) {
          opacity = 0.5 + (Math.sin(time * star.twinkle.speed + star.twinkle.phase) + 1) / 4;
        }
        
        // Draw star
        const [r, g, b] = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.fill();
        
        // Add glow effect for brighter stars
        if (star.glowSize > 0) {
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.glowSize
          );
          glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${star.glowOpacity * opacity})`);
          glow.addColorStop(1, 'rgba(0, 0, 30, 0)');
          
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.glowSize, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }
      });
    };
    
    // Draw enhanced cosmic dust
    const drawSpaceDust = () => {
      spaceDust.forEach(dust => {
        // Move dust particles slightly faster than the slowest stars
        dust.y += dust.speed;
        
        // Loop dust back to top when it exits bottom
        if (dust.y > canvas.height) {
          dust.y = -5;
          dust.x = Math.random() * canvas.width;
        }
        
        // Draw cosmic dust particle with its color
        const [r, g, b] = dust.color;
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dust.opacity})`;
        ctx.fill();
      });
    };
    
    // Draw nebula effect
    const drawNebulae = (time) => {
      nebulae.forEach(nebula => {
        // Update rotation angle
        nebula.rotation.angle += nebula.rotation.speed;
        
        // Draw each particle in the nebula
        nebula.particles.forEach(particle => {
          // Calculate rotated position
          const relativeX = particle.x - nebula.centerX;
          const relativeY = particle.y - nebula.centerY;
          
          const rotatedX = relativeX * Math.cos(nebula.rotation.angle) - relativeY * Math.sin(nebula.rotation.angle);
          const rotatedY = relativeX * Math.sin(nebula.rotation.angle) + relativeY * Math.cos(nebula.rotation.angle);
          
          const finalX = nebula.centerX + rotatedX;
          const finalY = nebula.centerY + rotatedY;
          
          // Pulse effect for opacity
          const pulse = Math.sin(time * 0.5 + nebula.centerX) * 0.15 + 0.85;
          
          // Draw nebula particle as a gradient circle
          const gradient = ctx.createRadialGradient(
            finalX, finalY, 0,
            finalX, finalY, particle.radius
          );
          
          const { r, g, b, a } = particle.color;
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * pulse})`);
          gradient.addColorStop(1, 'rgba(0, 0, 30, 0)');
          
          ctx.beginPath();
          ctx.arc(finalX, finalY, particle.radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        });
      });
    };
    
    // Draw cursor interaction effects
    const drawCursorEffects = () => {
      if (isMouseMoving) {
        // Create a glow effect at the cursor position
        const gradient = ctx.createRadialGradient(
          mousePosition.x, mousePosition.y, 0,
          mousePosition.x, mousePosition.y, 100
        );
        
        // Use a subtle blue glow
        gradient.addColorStop(0, 'rgba(100, 150, 255, 0.05)');
        gradient.addColorStop(0.5, 'rgba(70, 120, 255, 0.03)');
        gradient.addColorStop(1, 'rgba(50, 100, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(mousePosition.x, mousePosition.y, 100, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Create small particle burst effect
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 20;
          
          const x = mousePosition.x + Math.cos(angle) * distance;
          const y = mousePosition.y + Math.sin(angle) * distance;
          
          ctx.beginPath();
          ctx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200, 220, 255, 0.8)';
          ctx.fill();
        }
      }
    };
    
    // Add occasional shooting stars
    let shootingStars = [];
    
    // Create a new shooting star
    const createShootingStar = () => {
      // Only create if we have fewer than 2 active shooting stars
      if (shootingStars.length < 2 && Math.random() < 0.005) { // Small chance each frame
        // Start position is random along top half of screen, moving down-right
        const startX = Math.random() * canvas.width * 0.8;
        const startY = Math.random() * canvas.height * 0.5;
        const angle = Math.PI / 4 + (Math.random() * Math.PI / 4); // Angle between π/4 and π/2 (diagonal)
        
        shootingStars.push({
          x: startX,
          y: startY,
          speed: Math.random() * 5 + 10, // Faster than regular stars
          angle: angle,
          tailLength: Math.random() * 80 + 120,
          thickness: Math.random() * 2 + 2,
          color: [255, 255, 255], // White with slight blue tint
          life: 1.0 // Life counter, depletes over time
        });
      }
    };
    
    // Draw shooting stars
    const drawShootingStars = () => {
      // Filter out dead shooting stars
      shootingStars = shootingStars.filter(star => star.life > 0);
      
      shootingStars.forEach(star => {
        // Move along angle
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        
        // Decrease life
        star.life -= 0.01;
        
        // Draw shooting star with tail
        ctx.beginPath();
        
        // Create gradient for tail
        const gradient = ctx.createLinearGradient(
          star.x, star.y,
          star.x - Math.cos(star.angle) * star.tailLength,
          star.y - Math.sin(star.angle) * star.tailLength
        );
        
        gradient.addColorStop(0, `rgba(${star.color[0]}, ${star.color[1]}, ${star.color[2]}, ${star.life})`);
        gradient.addColorStop(1, `rgba(${star.color[0]}, ${star.color[1]}, ${star.color[2]}, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = star.thickness;
        ctx.lineCap = 'round';
        
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.tailLength,
          star.y - Math.sin(star.angle) * star.tailLength
        );
        
        ctx.stroke();
        
        // Draw the head of the shooting star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.thickness, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color[0]}, ${star.color[1]}, ${star.color[2]}, ${star.life})`;
        ctx.fill();
      });
    };
    
    // Animation time counter
    let time = 0;
    
    // Animation function
    const animate = () => {
      time += 0.01;
      
      // Fill background
      ctx.fillStyle = createBackground();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw all elements in order - from background to foreground
      drawNebulae(time);  // Draw nebulae in the background
      drawSpaceDust();    // Space dust between nebulae and stars
      drawStars(time);    // Stars in the mid-layer
      
      // Random chance to create shooting stars
      createShootingStar();
      drawShootingStars();
      
      // Draw cursor interaction effects (foreground)
      drawCursorEffects();
      
      // Continue animation
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 -z-10 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default AnimatedWallpaper;
