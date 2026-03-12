const NEXUS_CONFIG = {
  customCursor:      true,
  blobSculpture:     true,
  marqueeAutoplay:   true,
  pageEntrance:      true,
  scrollReveal:      true,
  accordionSingle:   true,
  threeJS:           true, // We'll use Three.js for the main blob
};

class NEXUS_App {
    constructor() {
        this.init();
    }

    init() {
        if (NEXUS_CONFIG.customCursor) this.initCursor();
        if (NEXUS_CONFIG.pageEntrance) this.initEntrance();
        this.initWordSplitter();
        this.initLetterFlipper();
        if (NEXUS_CONFIG.scrollReveal) this.initScrollReveal();
        if (NEXUS_CONFIG.threeJS) this.initThreeBlob();
        this.initNav();
        this.initMarquee();
        this.initAccordion();
    }

    initCursor() {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.left = mouseX + 'px';
            dot.style.top = mouseY + 'px';
        });

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            ring.style.left = ringX + 'px';
            ring.style.top = ringY + 'px';
            requestAnimationFrame(animateRing);
        };
        animateRing();

        document.querySelectorAll('a, button, .acc-header').forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });
    }

    initEntrance() {
        setTimeout(() => {
            document.querySelector('.nav-pill-container').classList.add('loaded');
        }, 200);
    }

    initScrollReveal() {
        const options = { threshold: 0.15 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    if (entry.target.dataset.split === 'words') {
                        // Logic for word split handled by CSS or JS
                    }
                }
            });
        }, options);

        document.querySelectorAll('.reveal, [data-split]').forEach(el => observer.observe(el));
    }

    initNav() {
        const nav = document.getElementById('main-nav');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    initThreeBlob() {
        const container = document.getElementById('blob-sculpture');
        if (!container) return;

        // Optimization: only init if container is visible or small delay
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const geometry = new THREE.IcosahedronGeometry(1.5, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FF88,
            emissive: 0x00FF88,
            emissiveIntensity: 0.1,
            metalness: 0.5,
            roughness: 0.1,
        });

        const blob = new THREE.Mesh(geometry, material);
        scene.add(blob);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xFF6B35, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        camera.position.z = 4;

        const positionAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        const originalPositions = positionAttribute.array.slice();

        const animate = (time) => {
            requestAnimationFrame(animate);
            
            const t = time * 0.0008;
            
            for (let i = 0; i < positionAttribute.count; i++) {
                vertex.fromArray(originalPositions, i * 3);
                // Multi-layered noise for organic feel
                const noise = 
                    Math.sin(vertex.x * 1.5 + t) * 0.12 + 
                    Math.cos(vertex.y * 2.0 + t * 1.1) * 0.12 +
                    Math.sin(vertex.z * 1.0 + t * 0.8) * 0.1;
                
                const tempVertex = vertex.clone().multiplyScalar(1 + noise);
                positionAttribute.setXYZ(i, tempVertex.x, tempVertex.y, tempVertex.z);
            }
            positionAttribute.needsUpdate = true;

            blob.rotation.y += 0.003;
            blob.rotation.z += 0.001;
            
            renderer.render(scene, camera);
        };
        animate(0);

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    initWordSplitter() {
        const targets = document.querySelectorAll('[data-split="words"]');
        targets.forEach(target => {
            const lines = target.querySelectorAll('.line');
            lines.forEach(line => {
                const text = line.innerText;
                const words = text.split(' ');
                line.innerHTML = '';
                words.forEach(word => {
                    const span = document.createElement('span');
                    span.className = 'clip-wrap';
                    span.innerHTML = `<span class="word">${word}</span>`;
                    line.appendChild(span);
                    line.appendChild(document.createTextNode(' '));
                });
            });
        });
    }

    initLetterFlipper() {
        const target = document.querySelector('[data-split="letters"]');
        if (!target) return;
        const text = target.innerText;
        target.innerHTML = '';
        text.split('').forEach((char, i) => {
            const span = document.createElement('span');
            span.className = 'letter';
            span.style.display = 'inline-block';
            span.style.animationDelay = `${i * 40}ms`;
            span.innerText = char === ' ' ? '\u00A0' : char;
            target.appendChild(span);
        });
    }

    initMarquee() {
        const track = document.getElementById('marquee-track');
        if (!track) return;
        
        // Duplicate items for seamless loop
        const items = Array.from(track.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
    }

    initAccordion() {
        document.querySelectorAll('.accordion-item').forEach(item => {
            item.querySelector('.acc-header').addEventListener('click', () => {
                if (NEXUS_CONFIG.accordionSingle) {
                    document.querySelectorAll('.accordion-item').forEach(i => {
                        if (i !== item) i.classList.remove('open');
                    });
                }
                item.classList.toggle('open');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NEXUS_App();
});
