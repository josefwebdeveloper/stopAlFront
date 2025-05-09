import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    imports: [MatProgressSpinnerModule],
    template: `
    <div class="profile-container">
      <canvas #canvas class="model-viewer"></canvas>
      <div class="profile-content">
        <h1>Profile</h1>
        @if (isLoading) {
          <div class="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <span>Loading 3D Scene...</span>
          </div>
        }
        @if (error) {
          <div class="error">{{ error }}</div>
        }
      </div>
    </div>
    `,
    styles: [`
    .profile-container {
      width: 100%;
      height: calc(100vh - 64px);
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    }

    .model-viewer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .profile-content {
      position: relative;
      z-index: 1;
      color: white;
      padding: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: white;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.5);
      margin-top: 1rem;
    }

    .error {
      padding: 1rem;
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.5);
      margin-top: 1rem;
      color: #ff4444;
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Group;
  private controls!: OrbitControls;
  private animationFrameId?: number;
  private resizeHandler: () => void;
  
  isLoading = true;
  error: string | null = null;
  private latestWeight: number = 0;
  private velocity = new THREE.Vector3();
  private isJumping = false;
  private gravity = 0.15;
  private bounceFactor = 0.7;
  private dragFactor = 0.99;
  private originalPosition = new THREE.Vector3();
  private bounceTimeout: any;
  private emitParticles = false;
  private particles: THREE.Points[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.resizeHandler = this.onWindowResize.bind(this);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (!this.canvasRef) {
      this.error = 'Failed to initialize canvas';
      this.cdr.detectChanges();
      return;
    }

    this.authService.getEntries().subscribe({
      next: (data) => {
        if (data.entries && data.entries.length > 0) {
          this.latestWeight = Number(data.entries[0].weight) || 0;
          try {
            this.initScene();
            this.animate();
            window.addEventListener('resize', this.resizeHandler);
            
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            });
          } catch (err) {
            this.error = 'Failed to initialize 3D scene';
            console.error(err);
            this.cdr.detectChanges();
          }
        } else {
          this.error = 'No weight data available';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Failed to load weight data';
        this.isLoading = false;
        console.error(err);
        this.cdr.detectChanges();
      }
    });

    this.canvasRef.nativeElement.addEventListener('click', this.handleClick);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Update disposal for group of meshes
    if (this.model) {
      this.model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    }

    this.canvasRef.nativeElement.removeEventListener('click', this.handleClick);
  }

  private initScene() {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    this.camera.position.y = 1;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);

    // Remove the cube code and add this character code
    const body = new THREE.Group();

    // Create body (larger sphere for the belly)
    const bodyGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xff9999,  // Soft pink color
      flatShading: false,
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.position.y = 0;
    body.add(bodyMesh);

    // Create "STOP EAT" text on the back
    const backCanvas = document.createElement('canvas');
    const backContext = backCanvas.getContext('2d');
    backCanvas.width = 512;
    backCanvas.height = 256;

    if (backContext) {
      backContext.fillStyle = '#ff9999';
      backContext.fillRect(0, 0, backCanvas.width, backCanvas.height);
      
      backContext.font = 'bold 100px Arial';
      backContext.textAlign = 'center';
      backContext.textBaseline = 'middle';
      backContext.fillStyle = '#ffffff';
      backContext.fillText('STOP EAT', backCanvas.width/2, backCanvas.height/2);
      
      const backTexture = new THREE.CanvasTexture(backCanvas);
      
      const backTextGeometry = new THREE.PlaneGeometry(1.6, 0.8);
      const backTextMaterial = new THREE.MeshBasicMaterial({
        map: backTexture,
        transparent: true,
        opacity: 0.9
      });
      
      const backTextMesh = new THREE.Mesh(backTextGeometry, backTextMaterial);
      backTextMesh.position.set(0, 0, -1.21); // Position on the back
      backTextMesh.rotation.x = 0.2; // Slight tilt
      backTextMesh.rotation.y = Math.PI; // Rotate to face back
      
      body.add(backTextMesh);
    }

    // Add the weight number code here

    // Create canvas for the weight number
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 256;

    if (context) {
      context.fillStyle = '#ff9999';
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Ensure weight is a number and format it
      const weightText = Number(this.latestWeight).toFixed(1);
      
      context.font = 'bold 120px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#ffffff';
      context.fillText(weightText, canvas.width/2, canvas.height/2);

      const numberTexture = new THREE.CanvasTexture(canvas);
      
      const numberGeometry = new THREE.PlaneGeometry(0.8, 0.8);
      const numberMaterial = new THREE.MeshBasicMaterial({
        map: numberTexture,
        transparent: true,
        opacity: 0.8
      });
      
      const numberMesh = new THREE.Mesh(numberGeometry, numberMaterial);
      numberMesh.position.set(0, 0, 1.21);
      numberMesh.rotation.x = -0.2;
      
      body.add(numberMesh);
    }

    // Create head (smaller sphere)
    const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xffcccb,  // Lighter pink for head
    });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.position.y = 1.4;
    body.add(headMesh);

    // Add arms (cylinders)
    const armGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 32);
    const armMaterial = new THREE.MeshPhongMaterial({
      color: 0xff9999,
    });

    // Left arm
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-1.2, 0.3, 0);
    leftArm.rotation.z = Math.PI / 3;
    body.add(leftArm);

    // Right arm
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(1.2, 0.3, 0);
    rightArm.rotation.z = -Math.PI / 3;
    body.add(rightArm);

    // Add legs (shorter cylinders)
    const legGeometry = new THREE.CylinderGeometry(0.25, 0.2, 0.8, 32);
    const legMaterial = new THREE.MeshPhongMaterial({
      color: 0xff9999,
    });

    // Left leg
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.4, -1.2, 0);
    body.add(leftLeg);

    // Right leg
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.4, -1.2, 0);
    body.add(rightLeg);

    // Add eyes (small dark spheres)
    const eyeGeometry = new THREE.SphereGeometry(0.08, 32, 32);
    const eyeMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 1.5, 0.5);
    body.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 1.5, 0.5);
    body.add(rightEye);

    // Add smile (curved line)
    const smileGeometry = new THREE.TorusGeometry(0.2, 0.03, 16, 32, Math.PI);
    const smileMaterial = new THREE.MeshPhongMaterial({
      color: 0x000000,
    });
    const smile = new THREE.Mesh(smileGeometry, smileMaterial);
    smile.position.set(0, 1.3, 0.5);
    smile.rotation.x = Math.PI / 2;
    body.add(smile);

    // Create tennis racket
    const racketGroup = new THREE.Group();

    // Racket head (oval shape using torus)
    const racketHeadGeometry = new THREE.TorusGeometry(0.4, 0.03, 16, 32);
    const racketMaterial = new THREE.MeshStandardMaterial({
      color: 0x4169e1, // Royal blue
      metalness: 0.5,
      roughness: 0.5,
    });
    const racketHead = new THREE.Mesh(racketHeadGeometry, racketMaterial);

    // Racket strings (create a grid pattern)
    const stringMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.3,
    });

    // Vertical strings
    for (let i = -0.35; i <= 0.35; i += 0.07) {
      const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.8, 8);
      const string = new THREE.Mesh(stringGeometry, stringMaterial);
      string.position.set(i, 0, 0);
      racketGroup.add(string);
    }

    // Horizontal strings
    for (let i = -0.35; i <= 0.35; i += 0.07) {
      const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.8, 8);
      const string = new THREE.Mesh(stringGeometry, stringMaterial);
      string.rotation.z = Math.PI / 2;
      string.position.set(0, i, 0);
      racketGroup.add(string);
    }

    // Racket handle
    const handleGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.7, 16);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0x4169e1,
      metalness: 0.5,
      roughness: 0.5,
    });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.set(0, -0.6, 0);
    racketGroup.add(handle);

    // Add racket head to group
    racketGroup.add(racketHead);

    // Position and rotate the racket
    racketGroup.position.set(-1.8, 0.3, 0); // Position near left hand
    racketGroup.rotation.set(0, 0, -Math.PI / 4); // Angle the racket

    // Add racket to body
    body.add(racketGroup);

    // Store racket reference for animation
    (body as any).racket = racketGroup;

    // Replace the cube model with our character
    this.model = body;
    this.scene.add(body);

    // Adjust camera position for better view
    this.camera.position.z = 6;
    this.camera.position.y = 0;

    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 2;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.model) {
      if (this.isJumping) {
        // Apply physics
        this.velocity.y -= this.gravity;
        this.model.position.add(this.velocity);
        this.velocity.multiplyScalar(this.dragFactor);

        // Update particles
        if (this.emitParticles) {
          this.particles.forEach((particle, index) => {
            particle.position.y += 0.05;
            (particle.material as THREE.PointsMaterial).opacity -= 0.02;
            if ((particle.material as THREE.PointsMaterial).opacity <= 0) {
              this.scene.remove(particle);
              this.particles.splice(index, 1);
            }
          });

          if (Math.random() > 0.7) {
            this.createParticles();
          }
        }

        // Bounce when hitting the "ground"
        if (this.model.position.y < 0) {
          this.model.position.y = 0;
          this.velocity.y = -this.velocity.y * this.bounceFactor;
          
          // Add a little squish effect on bounce
          this.model.scale.y = 0.8;
          this.model.scale.x = 1.2;
          this.model.scale.z = 1.2;
          
          // Reset scale with spring effect
          setTimeout(() => {
            this.model.scale.set(1, 1, 1);
          }, 100);
        }

        // Bounce off walls
        if (Math.abs(this.model.position.x) > 5) {
          this.velocity.x = -this.velocity.x * this.bounceFactor;
          this.model.position.x = Math.sign(this.model.position.x) * 5;
        }
        if (Math.abs(this.model.position.z) > 5) {
          this.velocity.z = -this.velocity.z * this.bounceFactor;
          this.model.position.z = Math.sign(this.model.position.z) * 5;
        }

        // Enhanced spin while flying
        this.model.rotation.x += this.velocity.z * 0.15;
        this.model.rotation.z -= this.velocity.x * 0.15;
        this.model.rotation.y += 0.05;
      } else {
        // Normal idle animation
        this.model.rotation.y += 0.01;
        this.model.position.y = Math.sin(Date.now() * 0.001) * 0.1;
      }

      // Racket animation
      const racket = (this.model as any).racket;
      if (racket) {
        racket.rotation.z = -Math.PI / 4 + Math.sin(Date.now() * 0.002) * 0.2;
      }
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  private handleClick = (event: MouseEvent) => {
    if (!this.model || this.isJumping) return;

    // Convert mouse coordinates to 3D space
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(x, y);
    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.model.children, true);

    if (intersects.length > 0) {
      // Store original position if not already jumping
      this.originalPosition.copy(this.model.position);
      
      // Apply random velocity when clicked
      this.velocity.set(
        (Math.random() - 0.5) * 0.8, // Increased velocity
        Math.random() * 0.8 + 0.8,   // Higher jumps
        (Math.random() - 0.5) * 0.8
      );
      this.isJumping = true;
      this.emitParticles = true;

      // Create particle effect
      this.createParticles();

      // Make the character spin faster when clicked
      this.model.rotation.y += Math.PI * 2;

      // Clear existing timeout if any
      if (this.bounceTimeout) {
        clearTimeout(this.bounceTimeout);
      }

      // Set timeout to return to original position
      this.bounceTimeout = setTimeout(() => {
        this.returnToOriginalPosition();
      }, 10000);
    }
  }

  private createParticles() {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 0.5;
      positions[i + 1] = Math.random() * 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff9999,
      size: 0.1,
      transparent: true,
      opacity: 1
    });

    const particles = new THREE.Points(geometry, material);
    particles.position.copy(this.model.position);
    this.scene.add(particles);
    this.particles.push(particles);
  }

  private returnToOriginalPosition() {
    // Create a smooth transition back to original position
    const duration = 1000; // 1 second
    const startPosition = this.model.position.clone();
    const startRotation = this.model.rotation.clone();
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic function
      const easing = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      this.model.position.lerpVectors(startPosition, this.originalPosition, easing);
      
      // Reset rotation smoothly
      this.model.rotation.x *= (1 - easing);
      this.model.rotation.z *= (1 - easing);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isJumping = false;
        this.velocity.set(0, 0, 0);
        this.emitParticles = false;
        // Clean up particles
        this.particles.forEach(particle => {
          this.scene.remove(particle);
          particle.geometry.dispose();
          (particle.material as THREE.PointsMaterial).dispose();
        });
        this.particles = [];
      }
    };

    animate();
  }
}
