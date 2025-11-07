import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three-stdlib';
import * as THREE from 'three';

interface FurnitureProps {
  config: {
    width: number;
    height: number;
    depth: number;
    color: string;
    material: string;
    woodType?: string;
    finish: string;
    hardware: string;
    extras: string[];
  };
}

// Генерация процедурной текстуры дерева
const createWoodTexture = (woodType: string | undefined) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  const woodColors: Record<string, { base: string, grain: string }> = {
    oak: { base: '#C19A6B', grain: '#8B6F47' },
    pine: { base: '#E9C2A6', grain: '#C19A6B' },
    birch: { base: '#F5DEB3', grain: '#D2B48C' },
    walnut: { base: '#5D4037', grain: '#3E2723' },
    mahogany: { base: '#7B3F00', grain: '#5D2F00' },
    mdf: { base: '#D2B48C', grain: '#A0826D' },
  };
  
  const colors = woodColors[woodType || 'oak'] || woodColors.oak;
  
  // Базовый цвет
  ctx.fillStyle = colors.base;
  ctx.fillRect(0, 0, 512, 512);
  
  // Текстура волокон дерева
  ctx.strokeStyle = colors.grain;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.3;
  
  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    const y = Math.random() * 512;
    ctx.moveTo(0, y);
    
    for (let x = 0; x < 512; x += 10) {
      const offset = Math.sin(x * 0.05 + i) * 5;
      ctx.lineTo(x, y + offset);
    }
    
    ctx.stroke();
  }
  
  // Добавляем шум для реализма
  const imageData = ctx.getImageData(0, 0, 512, 512);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 10;
    imageData.data[i] += noise;
    imageData.data[i + 1] += noise;
    imageData.data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  
  return texture;
};

// Создание карты нормалей для рельефа
const createNormalMap = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  
  // Базовый цвет для нормали (голубоватый)
  ctx.fillStyle = '#8080ff';
  ctx.fillRect(0, 0, 512, 512);
  
  // Добавляем вариации для рельефа
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
    gradient.addColorStop(0, '#9090ff');
    gradient.addColorStop(1, '#7070ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - 20, y - 20, 40, 40);
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
};

// Реалистичный материал с текстурами
const getRealisticMaterial = (
  materialType: string,
  color: string,
  woodType: string | undefined,
  finish: string
) => {
  const finishProps = {
    matte: { roughness: 0.9, clearcoat: 0, clearcoatRoughness: 0 },
    glossy: { roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1 },
    satin: { roughness: 0.5, clearcoat: 0.4, clearcoatRoughness: 0.3 },
    natural: { roughness: 0.95, clearcoat: 0, clearcoatRoughness: 0 },
  };
  
  const finishSettings = finishProps[finish as keyof typeof finishProps] || finishProps.matte;
  
  if (materialType === 'wood') {
    const woodTexture = createWoodTexture(woodType);
    const normalMap = createNormalMap();
    
    return {
      map: woodTexture,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(0.3, 0.3),
      roughness: finishSettings.roughness,
      roughnessMap: normalMap,
      metalness: 0,
      envMapIntensity: 0.5,
      clearcoat: finishSettings.clearcoat,
      clearcoatRoughness: finishSettings.clearcoatRoughness,
      // Ambient Occlusion для глубины
      aoMapIntensity: 0.5,
    };
  }
  
  if (materialType === 'metal') {
    return {
      color,
      roughness: finishSettings.roughness * 0.2,
      metalness: 0.95,
      envMapIntensity: 2.0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
    };
  }
  
  if (materialType === 'fabric') {
    // Процедурная текстура ткани
    const fabricCanvas = document.createElement('canvas');
    fabricCanvas.width = 256;
    fabricCanvas.height = 256;
    const ctx = fabricCanvas.getContext('2d')!;
    
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 256, 256);
    
    // Плетение ткани
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 256; i += 2) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 256);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(256, i);
      ctx.stroke();
    }
    
    const fabricTexture = new THREE.CanvasTexture(fabricCanvas);
    fabricTexture.wrapS = fabricTexture.wrapT = THREE.RepeatWrapping;
    fabricTexture.repeat.set(4, 4);
    
    return {
      map: fabricTexture,
      roughness: 0.95,
      metalness: 0,
      envMapIntensity: 0.2,
      normalScale: new THREE.Vector2(0.5, 0.5),
    };
  }
  
  // Plastic
  return {
    color,
    roughness: finishSettings.roughness * 0.4,
    metalness: 0.1,
    envMapIntensity: 1.0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  };
};

// Цвет фурнитуры в зависимости от типа
const getHardwareColor = (hardware: string) => {
  const colors: Record<string, string> = {
    standard: '#808080',    // Серый
    premium: '#FFD700',     // Золотой
    decorative: '#CD7F32',  // Бронзовый
    minimalist: '#E5E5E5',  // Светло-серый
  };
  return colors[hardware] || colors.standard;
};

// Кровать с реалистичными материалами
export const Bed = ({ config }: FurnitureProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialProps = getRealisticMaterial(config.material, config.color, config.woodType, config.finish);
  const hardwareColor = getHardwareColor(config.hardware);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Основание кровати - матрас */}
      <mesh position={[0, config.height / 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width - 0.1, config.height / 2.5, config.depth - 0.1]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Рама кровати */}
      <mesh position={[0, config.height / 8, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width, config.height / 8, config.depth]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Боковые панели рамы */}
      <mesh position={[-config.width / 2, config.height / 8, 0]} castShadow>
        <boxGeometry args={[0.05, config.height / 4, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.7} />
      </mesh>
      <mesh position={[config.width / 2, config.height / 8, 0]} castShadow>
        <boxGeometry args={[0.05, config.height / 4, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.7} />
      </mesh>

      {/* Изголовье - детализированное */}
      <mesh position={[0, config.height / 1.3, -config.depth / 2.05]} castShadow receiveShadow>
        <boxGeometry args={[config.width, config.height * 1.2, 0.08]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Декоративная рамка изголовья - цвет фурнитуры */}
      <mesh position={[0, config.height / 1.3, -config.depth / 2]} castShadow>
        <boxGeometry args={[config.width + 0.06, config.height * 1.24, 0.02]} />
        <meshStandardMaterial 
          color={hardwareColor}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Ножки - металлические с цветом фурнитуры */}
      {[
        [-config.width / 2.1, 0, -config.depth / 2.1],
        [config.width / 2.1, 0, -config.depth / 2.1],
        [-config.width / 2.1, 0, config.depth / 2.1],
        [config.width / 2.1, 0, config.depth / 2.1],
      ].map((pos, i) => (
        <group key={i}>
          {/* Основная ножка */}
          <mesh position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.04, 0.06, config.height / 2, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
          {/* Декоративная накладка */}
          <mesh position={[pos[0], pos[1] + config.height / 4 - 0.05, pos[2]]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.03, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* Нижняя перекладина для усиления */}
      <mesh position={[0, config.height / 16, config.depth / 2]} castShadow>
        <boxGeometry args={[config.width - 0.2, 0.04, 0.04]} />
        <meshStandardMaterial color={config.color} roughness={0.7} />
      </mesh>
      <mesh position={[0, config.height / 16, -config.depth / 2]} castShadow>
        <boxGeometry args={[config.width - 0.2, 0.04, 0.04]} />
        <meshStandardMaterial color={config.color} roughness={0.7} />
      </mesh>
    </group>
  );
};

// Шкаф с реалистичными материалами
export const Wardrobe = ({ config }: FurnitureProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialProps = getRealisticMaterial(config.material, config.color, config.woodType, config.finish);
  const hardwareColor = getHardwareColor(config.hardware);
  
  // Дополнительные опции
  const hasLED = config.extras.includes('led-lighting');
  const hasMirror = config.extras.includes('soft-close');

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Задняя стенка */}
      <mesh position={[0, config.height / 2, -config.depth / 2]} receiveShadow>
        <boxGeometry args={[config.width, config.height, 0.02]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Боковые стенки */}
      <mesh position={[-config.width / 2, config.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, config.height, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[config.width / 2, config.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, config.height, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Верх */}
      <mesh position={[0, config.height, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width, 0.04, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Низ */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[config.width, 0.04, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Внутренние полки */}
      {[0.25, 0.5, 0.75].map((ratio, i) => (
        <mesh key={`shelf-${i}`} position={[0, config.height * ratio, 0]} receiveShadow>
          <boxGeometry args={[config.width - 0.1, 0.02, config.depth - 0.05]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}

      {/* Левая дверь с рельефом */}
      <group>
        <mesh position={[-config.width / 4, config.height / 2, config.depth / 2 + 0.025]} castShadow>
          <boxGeometry args={[config.width / 2 - 0.06, config.height - 0.1, 0.03]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {/* Декоративная рамка на двери */}
        <mesh position={[-config.width / 4, config.height / 2, config.depth / 2 + 0.04]} castShadow>
          <boxGeometry args={[config.width / 2 - 0.15, config.height - 0.25, 0.01]} />
          <meshStandardMaterial 
            color={config.color}
            roughness={materialProps.roughness * 0.8}
            metalness={materialProps.metalness}
          />
        </mesh>
      </group>

      {/* Правая дверь с рельефом */}
      <group>
        <mesh position={[config.width / 4, config.height / 2, config.depth / 2 + 0.025]} castShadow>
          <boxGeometry args={[config.width / 2 - 0.06, config.height - 0.1, 0.03]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {/* Декоративная рамка на двери */}
        <mesh position={[config.width / 4, config.height / 2, config.depth / 2 + 0.04]} castShadow>
          <boxGeometry args={[config.width / 2 - 0.15, config.height - 0.25, 0.01]} />
          <meshStandardMaterial 
            color={config.color}
            roughness={materialProps.roughness * 0.8}
            metalness={materialProps.metalness}
          />
        </mesh>
      </group>

      {/* Ручки - цвет фурнитуры */}
      {[-config.width / 4 + 0.15, config.width / 4 - 0.15].map((x, i) => (
        <group key={`handle-${i}`}>
          <mesh 
            position={[x, config.height / 2, config.depth / 2 + 0.06]} 
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.015, 0.015, 0.15, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.2}
              metalness={0.95}
            />
          </mesh>
          {/* Крепления ручки */}
          <mesh position={[x, config.height / 2 + 0.075, config.depth / 2 + 0.055]} castShadow>
            <sphereGeometry args={[0.02, 32, 32]} />
            <meshStandardMaterial color={hardwareColor} roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[x, config.height / 2 - 0.075, config.depth / 2 + 0.055]} castShadow>
            <sphereGeometry args={[0.02, 32, 32]} />
            <meshStandardMaterial color={hardwareColor} roughness={0.3} metalness={0.9} />
          </mesh>
        </group>
      ))}
      
      {/* LED подсветка (если выбрана опция) */}
      {hasLED && (
        <pointLight 
          position={[0, config.height - 0.1, 0]} 
          intensity={0.5} 
          distance={config.width}
          color="#ffffff"
        />
      )}
      
      {/* Зеркало на двери (если выбрана опция) */}
      {hasMirror && (
        <mesh position={[config.width / 4, config.height / 2, config.depth / 2 + 0.041]} castShadow>
          <boxGeometry args={[config.width / 2 - 0.2, config.height - 0.3, 0.005]} />
          <meshStandardMaterial 
            color="#e0e0e0"
            roughness={0.05}
            metalness={0.98}
            envMapIntensity={2}
          />
        </mesh>
      )}

      {/* Цоколь */}
      <mesh position={[0, 0.05, config.depth / 2 - 0.02]} castShadow>
        <boxGeometry args={[config.width, 0.1, 0.08]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={0.6}
        />
      </mesh>

      {/* Карниз сверху */}
      <mesh position={[0, config.height + 0.05, 0]} castShadow>
        <boxGeometry args={[config.width + 0.05, 0.08, config.depth + 0.05]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
};

// Стол
export const Table = ({ config }: FurnitureProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialProps = getRealisticMaterial(config.material, config.color, config.woodType, config.finish);
  const hardwareColor = getHardwareColor(config.hardware);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Столешница - основная */}
      <mesh position={[0, config.height, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width, 0.06, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Кромка столешницы */}
      <mesh position={[0, config.height - 0.04, 0]} castShadow>
        <boxGeometry args={[config.width + 0.02, 0.02, config.depth + 0.02]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={materialProps.roughness * 0.9}
        />
      </mesh>

      {/* Царга (рама под столешницей) */}
      {[
        [0, config.height - 0.1, config.depth / 2, [config.width - 0.2, 0.08, 0.04]],
        [0, config.height - 0.1, -config.depth / 2, [config.width - 0.2, 0.08, 0.04]],
        [config.width / 2, config.height - 0.1, 0, [0.04, 0.08, config.depth - 0.2]],
        [-config.width / 2, config.height - 0.1, 0, [0.04, 0.08, config.depth - 0.2]],
      ].map((data, i) => (
        <mesh 
          key={`frame-${i}`} 
          position={[data[0] as number, data[1] as number, data[2] as number]}
          castShadow
        >
          <boxGeometry args={data[3] as [number, number, number]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}

      {/* Ножки стола - детализированные */}
      {[
        [-config.width / 2.2, config.height / 2, -config.depth / 2.2],
        [config.width / 2.2, config.height / 2, -config.depth / 2.2],
        [-config.width / 2.2, config.height / 2, config.depth / 2.2],
        [config.width / 2.2, config.height / 2, config.depth / 2.2],
      ].map((pos, i) => (
        <group key={`leg-${i}`}>
          {/* Основная ножка - конусообразная */}
          <mesh position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.05, 0.08, config.height - 0.15, 32]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
          
          {/* Верхняя накладка */}
          <mesh 
            position={[pos[0], pos[1] + (config.height - 0.15) / 2 + 0.02, pos[2]]}
            castShadow
          >
            <cylinderGeometry args={[0.06, 0.06, 0.04, 32]} />
            <meshStandardMaterial 
              color={config.color}
              roughness={0.5}
            />
          </mesh>

          {/* Нижняя опора - металл с цветом фурнитуры */}
          <mesh 
            position={[pos[0], pos[1] - (config.height - 0.15) / 2 - 0.02, pos[2]]}
            castShadow
          >
            <cylinderGeometry args={[0.09, 0.09, 0.03, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* Центральная перекладина для устойчивости */}
      <mesh 
        position={[0, config.height / 3, 0]} 
        rotation={[0, 0, 0]}
        castShadow
      >
        <boxGeometry args={[config.width - 0.5, 0.04, 0.04]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh 
        position={[0, config.height / 3, 0]} 
        rotation={[0, Math.PI / 2, 0]}
        castShadow
      >
        <boxGeometry args={[config.depth - 0.5, 0.04, 0.04]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
    </group>
  );
};

// Стул
export const Chair = ({ config }: FurnitureProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialProps = getRealisticMaterial(config.material, config.color, config.woodType, config.finish);
  const hardwareColor = getHardwareColor(config.hardware);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Сиденье - мягкое */}
      <mesh position={[0, config.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width, 0.08, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Подложка сиденья */}
      <mesh position={[0, config.height / 2 - 0.05, 0]} castShadow>
        <boxGeometry args={[config.width - 0.02, 0.02, config.depth - 0.02]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          roughness={0.6}
        />
      </mesh>

      {/* Спинка - изогнутая форма */}
      <mesh position={[0, config.height * 0.85, -config.depth / 2.3]} castShadow receiveShadow>
        <boxGeometry args={[config.width, config.height * 0.7, 0.06]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Декоративная планка на спинке */}
      <mesh position={[0, config.height * 0.85, -config.depth / 2.25]} castShadow>
        <boxGeometry args={[config.width * 0.8, config.height * 0.5, 0.03]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={materialProps.roughness * 0.8}
        />
      </mesh>

      {/* Рама спинки */}
      <mesh position={[0, config.height * 0.85, -config.depth / 2.35]} castShadow>
        <boxGeometry args={[config.width + 0.02, config.height * 0.72, 0.02]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Ножки - передние с цветом фурнитуры */}
      {[
        [-config.width / 2.2, config.height / 4, config.depth / 2.2],
        [config.width / 2.2, config.height / 4, config.depth / 2.2],
      ].map((pos, i) => (
        <group key={`front-leg-${i}`}>
          <mesh position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, config.height / 2, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* Ножки - задние (выше для спинки) */}
      {[
        [-config.width / 2.2, config.height * 0.6, -config.depth / 2.2],
        [config.width / 2.2, config.height * 0.6, -config.depth / 2.2],
      ].map((pos, i) => (
        <group key={`back-leg-${i}`}>
          <mesh position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.03, 0.04, config.height * 1.2, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* Перекладины между ножками */}
      <mesh 
        position={[0, config.height / 5, config.depth / 2.2]} 
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.02, 0.02, config.width - 0.2, 16]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.5} />
      </mesh>
      <mesh 
        position={[0, config.height / 5, -config.depth / 2.2]} 
        rotation={[0, 0, Math.PI / 2]}
        castShadow
      >
        <cylinderGeometry args={[0.02, 0.02, config.width - 0.2, 16]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.5} />
      </mesh>
    </group>
  );
};

// Диван
export const Sofa = ({ config }: FurnitureProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialProps = getRealisticMaterial(config.material, config.color, config.woodType, config.finish);
  const hardwareColor = getHardwareColor(config.hardware);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Основание дивана - рама */}
      <mesh position={[0, config.height / 6, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width, config.height / 6, config.depth]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={0.7}
        />
      </mesh>

      {/* Сиденье - мягкие подушки */}
      {[-config.width / 3, 0, config.width / 3].map((x, i) => (
        <mesh 
          key={`cushion-${i}`}
          position={[x, config.height / 2.5, 0]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[config.width / 3.2, config.height / 2.5, config.depth - 0.15]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}

      {/* Декоративные швы на подушках */}
      {[-config.width / 3, 0, config.width / 3].map((x, i) => (
        <mesh 
          key={`seam-${i}`}
          position={[x, config.height / 2.5, 0]} 
          castShadow
        >
          <boxGeometry args={[config.width / 3.3, config.height / 2.6, config.depth - 0.12]} />
          <meshStandardMaterial 
            color={config.color}
            roughness={materialProps.roughness * 1.05}
          />
        </mesh>
      ))}

      {/* Спинка - высокая с подушками */}
      <mesh position={[0, config.height * 0.7, -config.depth / 2.4]} castShadow receiveShadow>
        <boxGeometry args={[config.width, config.height * 0.8, config.depth / 5]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Подушки на спинке */}
      {[-config.width / 3, 0, config.width / 3].map((x, i) => (
        <mesh 
          key={`back-cushion-${i}`}
          position={[x, config.height * 0.7, -config.depth / 2.6]} 
          castShadow 
          receiveShadow
        >
          <boxGeometry args={[config.width / 3.5, config.height * 0.6, 0.15]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      ))}

      {/* Левый подлокотник */}
      <group>
        <mesh position={[-config.width / 2.1, config.height / 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[config.width / 10, config.height / 1.5, config.depth]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {/* Накладка подлокотника */}
        <mesh position={[-config.width / 2.1, config.height / 1.3, 0]} castShadow>
          <boxGeometry args={[config.width / 9, 0.08, config.depth + 0.02]} />
          <meshStandardMaterial 
            color={config.color}
            roughness={0.6}
          />
        </mesh>
      </group>

      {/* Правый подлокотник */}
      <group>
        <mesh position={[config.width / 2.1, config.height / 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[config.width / 10, config.height / 1.5, config.depth]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {/* Накладка подлокотника */}
        <mesh position={[config.width / 2.1, config.height / 1.3, 0]} castShadow>
          <boxGeometry args={[config.width / 9, 0.08, config.depth + 0.02]} />
          <meshStandardMaterial 
            color={config.color}
            roughness={0.6}
          />
        </mesh>
      </group>

      {/* Цоколь */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[config.width + 0.05, 0.12, config.depth + 0.05]} />
        <meshStandardMaterial 
          color="#2c2c2c"
          roughness={0.6}
        />
      </mesh>

      {/* Декоративные ножки - металл с цветом фурнитуры */}
      {[
        [-config.width / 2.3, 0, -config.depth / 2.3],
        [config.width / 2.3, 0, -config.depth / 2.3],
        [-config.width / 2.3, 0, config.depth / 2.3],
        [config.width / 2.3, 0, config.depth / 2.3],
      ].map((pos, i) => (
        <group key={`leg-${i}`}>
          <mesh position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.15, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Комод
export const Dresser = ({ config }: FurnitureProps) => {
  const meshRef = useRef<Mesh>(null);
  const materialProps = getRealisticMaterial(config.material, config.color, config.woodType, config.finish);
  const hardwareColor = getHardwareColor(config.hardware);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  const drawerCount = Math.floor(config.height / 0.3);

  return (
    <group ref={meshRef}>
      {/* Корпус - задняя стенка */}
      <mesh position={[0, config.height / 2, -config.depth / 2]} receiveShadow>
        <boxGeometry args={[config.width, config.height, 0.02]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Боковые стенки */}
      <mesh position={[-config.width / 2, config.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, config.height, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>
      <mesh position={[config.width / 2, config.height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, config.height, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Верхняя крышка */}
      <mesh position={[0, config.height, 0]} castShadow receiveShadow>
        <boxGeometry args={[config.width + 0.04, 0.05, config.depth + 0.04]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Декоративный кант сверху */}
      <mesh position={[0, config.height + 0.03, 0]} castShadow>
        <boxGeometry args={[config.width + 0.08, 0.02, config.depth + 0.08]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={0.5}
        />
      </mesh>

      {/* Дно */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[config.width, 0.04, config.depth]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Ящики - динамическое количество */}
      {Array.from({ length: Math.min(drawerCount, 5) }, (_, i) => {
        const drawerHeight = (config.height - 0.15) / Math.min(drawerCount, 5);
        const yPos = 0.12 + drawerHeight / 2 + i * drawerHeight;
        
        return (
          <group key={`drawer-${i}`}>
            {/* Фасад ящика */}
            <mesh position={[0, yPos, config.depth / 2 + 0.015]} castShadow>
              <boxGeometry args={[config.width - 0.12, drawerHeight - 0.08, 0.03]} />
              <meshStandardMaterial {...materialProps} />
            </mesh>
            
            {/* Рамка ящика */}
            <mesh position={[0, yPos, config.depth / 2 + 0.032]} castShadow>
              <boxGeometry args={[config.width - 0.16, drawerHeight - 0.12, 0.004]} />
              <meshStandardMaterial 
                color={config.color}
                roughness={materialProps.roughness * 0.9}
              />
            </mesh>

            {/* Ручка ящика - цвет фурнитуры */}
            <mesh 
              position={[0, yPos, config.depth / 2 + 0.06]} 
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.015, 0.015, config.width / 4, 32]} />
              <meshStandardMaterial 
                color={hardwareColor}
                roughness={0.2}
                metalness={0.95}
              />
            </mesh>

            {/* Крепления ручки */}
            <mesh position={[-config.width / 8, yPos, config.depth / 2 + 0.055]} castShadow>
              <sphereGeometry args={[0.02, 32, 32]} />
              <meshStandardMaterial color={hardwareColor} roughness={0.3} metalness={0.9} />
            </mesh>
            <mesh position={[config.width / 8, yPos, config.depth / 2 + 0.055]} castShadow>
              <sphereGeometry args={[0.02, 32, 32]} />
              <meshStandardMaterial color={hardwareColor} roughness={0.3} metalness={0.9} />
            </mesh>
          </group>
        );
      })}

      {/* Цоколь */}
      <mesh position={[0, 0.08, config.depth / 2 - 0.02]} castShadow>
        <boxGeometry args={[config.width + 0.02, 0.16, 0.1]} />
        <meshStandardMaterial 
          color={config.color}
          roughness={0.7}
        />
      </mesh>

      {/* Ножки - декоративные */}
      {[
        [-config.width / 2.2, 0, -config.depth / 2.2],
        [config.width / 2.2, 0, -config.depth / 2.2],
        [-config.width / 2.2, 0, config.depth / 2.2],
        [config.width / 2.2, 0, config.depth / 2.2],
      ].map((pos, i) => (
        <group key={`leg-${i}`}>
          <mesh position={pos as [number, number, number]} castShadow>
            <cylinderGeometry args={[0.035, 0.05, 0.16, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.3}
              metalness={0.85}
            />
          </mesh>
          {/* Декоративная накладка ножки */}
          <mesh position={[pos[0], pos[1] + 0.08, pos[2]]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.02, 32]} />
            <meshStandardMaterial 
              color={hardwareColor}
              roughness={0.2}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// Grill - загружаем из .obj файла
export const Grill = ({ config }: FurnitureProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const obj = useLoader(OBJLoader, '/models/Grill_obj.obj');
  const materialProps = getRealisticMaterial(config.material, config.color, config.woodType, config.finish);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  // Применяем настройки к модели
  if (obj) {
    // Применяем материал ко всем mesh в модели
    obj.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Создаем материал
        const material = new THREE.MeshStandardMaterial({
          color: config.color,
          roughness: materialProps.roughness || 0.5,
          metalness: materialProps.metalness || 0,
          envMapIntensity: materialProps.envMapIntensity || 1,
        });
        
        // Если есть текстура, применяем её
        if (materialProps.map) {
          material.map = materialProps.map as THREE.Texture;
          material.needsUpdate = true;
        }
        if (materialProps.normalMap) {
          material.normalMap = materialProps.normalMap as THREE.Texture;
          material.normalScale = materialProps.normalScale as THREE.Vector2;
          material.needsUpdate = true;
        }
        
        mesh.material = material;
      }
    });
  }

  return (
    <group 
      ref={groupRef}
      scale={[config.width * 0.01, config.height * 0.01, config.depth * 0.01]}
      position={[0, 0, 0]}
    >
      <primitive object={obj} />
    </group>
  );
};
