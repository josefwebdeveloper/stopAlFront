import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="profile-container">
      <canvas #canvas class="model-viewer"></canvas>
      <div class="profile-content">
        <h1>Profile</h1>
        <div *ngIf="isLoading" class="loading">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Loading 3D Scene...</span>
        </div>
        <div *ngIf="error" class="error">{{ error }}</div>
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

  constructor(private cdr: ChangeDetectorRef) {
    this.resizeHandler = this.onWindowResize.bind(this);
  }

  ngOnInit() {}

  ngAfterViewInit() {
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
        // Add gentle swaying motion
        this.model.rotation.y += 0.01;
        this.model.position.y = Math.sin(Date.now() * 0.001) * 0.1;
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
}
