import { useEffect, useRef, useState } from 'react';
import styles from './ThreeDModal.module.css';
import { MdClose } from 'react-icons/md';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

interface ThreeDModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelPath: string;
}

const ThreeDModal = ({ isOpen, onClose, modelPath }: ThreeDModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const container = containerRef.current;
    setLoading(true);
    setLoadProgress(0);

    console.log('Opening 3D viewer with model:', modelPath);

    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Камера
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Освещение - сбалансированное для правильной передачи цветов
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-10, 10, -10);
    scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight3.position.set(0, -10, 5);
    scene.add(directionalLight3);

    // Добавляем сетку для ориентации
    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    // Добавляем оси координат
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Контролы
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Загрузка модели
    console.log('Starting to load model from:', modelPath);
    
    // Попытка загрузить MTL файл (материалы)
    const mtlPath = modelPath.replace('.obj', '.mtl');
    const mtlLoader = new MTLLoader();
    
    mtlLoader.load(
      mtlPath,
      (materials) => {
        console.log('MTL materials loaded:', materials);
        materials.preload();
        
        // Улучшаем материалы без искажения цветов
        Object.keys(materials.materials).forEach((key) => {
          const material = materials.materials[key];
          if (material instanceof THREE.MeshPhongMaterial) {
            // Не изменяем цвет, только улучшаем отображение
            material.shininess = 30;
            material.side = THREE.DoubleSide;
            // Убираем specular чтобы цвета были чище
            material.specular = new THREE.Color(0x000000);
          }
        });
        
        // Загружаем OBJ с материалами
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        loadObjWithLoader(objLoader);
      },
      undefined,
      (error) => {
        console.log('No MTL file found, loading OBJ without materials:', error);
        // Загружаем OBJ без материалов
        const objLoader = new OBJLoader();
        loadObjWithLoader(objLoader);
      }
    );

    const loadObjWithLoader = (loader: OBJLoader) => {
      loader.load(
        modelPath,
        (object: THREE.Group) => {
          console.log('Model loaded successfully!', object);
          setLoading(false);
          // Центрируем модель
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          object.position.sub(center);

          // Масштабируем модель
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 5 / maxDim;
          object.scale.multiplyScalar(scale);

          console.log('Model size:', size, 'Max dimension:', maxDim, 'Scale:', scale);

          // Если нет материалов, добавляем базовый
          let hasMaterial = false;
          object.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (!mesh.material || (mesh.material as THREE.Material).type === 'MeshBasicMaterial') {
                mesh.material = new THREE.MeshPhongMaterial({
                  color: 0xffffff,
                  specular: 0x444444,
                  shininess: 50,
                  side: THREE.DoubleSide,
                });
              } else {
                hasMaterial = true;
                // Улучшаем существующий материал
                if (mesh.material instanceof THREE.MeshPhongMaterial) {
                  mesh.material.side = THREE.DoubleSide;
                }
              }
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          console.log('Has original materials:', hasMaterial);

          scene.add(object);
          console.log('Model added to scene');
          
          // Подстраиваем камеру под модель
          const newBox = new THREE.Box3().setFromObject(object);
          const newCenter = newBox.getCenter(new THREE.Vector3());
          const newSize = newBox.getSize(new THREE.Vector3());
          const maxSize = Math.max(newSize.x, newSize.y, newSize.z);
          const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
          const fitWidthDistance = fitHeightDistance / camera.aspect;
          const distance = 1.5 * Math.max(fitHeightDistance, fitWidthDistance);
          
          camera.position.set(
            newCenter.x + distance,
            newCenter.y + distance,
            newCenter.z + distance
          );
          camera.lookAt(newCenter);
          controls.target.copy(newCenter);
          controls.update();
          
          console.log('Camera positioned at:', camera.position);
        },
        (xhr: ProgressEvent) => {
          const percent = (xhr.loaded / xhr.total) * 100;
          setLoadProgress(percent);
          console.log(percent.toFixed(2) + '% loaded');
        },
        (error: unknown) => {
          console.error('Error loading model:', error);
          setLoading(false);
          alert('Ошибка загрузки 3D модели. Проверьте путь: ' + modelPath);
        }
      );
    };

    // Анимация
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Обработка изменения размера окна
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Очистка
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [isOpen, modelPath]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <MdClose />
        </button>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loader}></div>
            <p className={styles.loadingText}>{loadProgress.toFixed(0)}% загружено</p>
          </div>
        )}
        <div ref={containerRef} className={styles.viewerContainer} />
      </div>
    </div>
  );
};

export default ThreeDModal;
