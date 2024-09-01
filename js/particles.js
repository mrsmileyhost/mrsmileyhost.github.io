(function() {
  // Particle class
  class Particle {
    constructor(posx, posy, radius) {
      if (radius < 0) {
        throw new Error(`Particle radius ${radius} pixels cannot be negative!`);
      }

      this.position = { x: posx || 0, y: posy || 0 };
      this.radius = typeof radius === 'function' ? radius() : radius || 0;
      this.status = 'standing';
      this.direction = this.position;
      this.speed = 1;
      this.spotlightTimeStamp = undefined;
    }

    stop() {
      this.status = 'standing';
      this.spotlightTimeStamp = undefined;
      this.direction = this.position;
    }

    move(posx, posy, speed) {
      this.status = 'moving';
      this.spotlightTimeStamp = undefined;
      const deltaX = posx - this.position.x;
      const deltaY = posy - this.position.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      this.direction = { x: posx, y: posy, distance, sin: deltaY / distance, cos: deltaX / distance };
      this.startPoint = this.position;
      this.speed = speed || 1;
    }

    getPosition(movetime) {
      const time = movetime / 1000;

      if (this.status === 'moving') {
        if (this.spotlightTimeStamp) {
          const deltaTime = time - this.spotlightTimeStamp;
          const distance = deltaTime * this.speed;

          const posy = this.direction.sin * distance;
          const posx = this.direction.cos * distance;

          this.position = { x: posx + this.startPoint.x, y: posy + this.startPoint.y };

          if (distance > this.direction.distance) {
            this.status = 'standing';
            this.spotlightTimeStamp = undefined;
            this.position = this.direction;
          }
        } else {
          this.spotlightTimeStamp = time;
        }
        return this.position;
      }
      return false;
    }
  }

  // Constants
  const presetDefault = {
    count: 150,
    size: 2,
    minSpeed: 10,
    maxSpeed: 50,
    startOrigin: { x: undefined, y: undefined },
  };

  // Variables
  let settings = presetDefault;
  let particles = [];
  let canvas = document.querySelector('#particlesField');
  let ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Functions
  function generateParticles(count, size, originX, originY) {
    particles = particles || [];
    for (let i = 0; i <= count; i++) {
      const x = originX || Math.random() * window.innerWidth;
      const y = originY || Math.random() * window.innerHeight;
      particles.push(new Particle(x, y, size));
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (particles) {
      for (let i = 0; i < particles.length; i++) {
        if (particles[i].position.x > width) {
          particles[i].stop();
          particles[i].position.x = width;
        }
        if (particles[i].position.y > height) {
          particles[i].stop();
          particles[i].position.y = height;
        }
      }
    }
  }

  function renderCanvas() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255,255,255,1)';
    if (particles) {
      for (let i = 0; i < particles.length; i++) {
        const ball = particles[i];
        ctx.beginPath();
        ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function animate(time) {
    requestAnimationFrame(animate);
    if (width !== canvas.width) {
      canvas.width = width;
    }
    if (height !== canvas.height) {
      canvas.height = height;
    }
    if (particles) {
      for (let i = 0; i < particles.length; i++) {
        const ball = particles[i];
        if (!ball.getPosition(time)) {
          const x = Math.random() * width;
          const y = Math.random() * height;
          const speed = Math.random() * (settings.maxSpeed / 2) + settings.minSpeed;
          ball.move(x, y, speed);
        }
      }
    }
    renderCanvas();
  }

  // Initialize
  resize();
  window.addEventListener('resize', resize, false);
  generateParticles(settings.count, settings.size, settings.startOrigin.x, settings.startOrigin.y);
  animate();
})();
