// Простые 3D модели мебели для конфигуратора заказов

interface FurnitureConfig {
  width: number;
  height: number;
  depth: number;
  color: string;
  material: string;
  finish: string;
}

interface FurnitureProps {
  config: FurnitureConfig;
}

// Unused component - commented out
// const BaseFurniture = ({ config, scaleY = 1 }: FurnitureProps & { scaleY?: number }) => {
//   const meshRef = useRef<THREE.Mesh>(null);
//   
//   return (
//     <mesh ref={meshRef} position={[0, config.height * scaleY / 2, 0]}>
//       <boxGeometry args={[config.width, config.height * scaleY, config.depth]} />
//       <meshStandardMaterial color={config.color} roughness={0.5} metalness={0.1} />
//     </mesh>
//   );
// };

// Кровать
export const Bed = ({ config }: FurnitureProps) => {
  return (
    <group>
      {/* Основание кровати */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[config.width, 0.3, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.5} />
      </mesh>
      {/* Изголовье */}
      <mesh position={[0, 0.5, -config.depth / 2 + 0.05]}>
        <boxGeometry args={[config.width, 0.7, 0.1]} />
        <meshStandardMaterial color={config.color} roughness={0.5} />
      </mesh>
      {/* Матрас */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[config.width - 0.1, 0.2, config.depth - 0.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
    </group>
  );
};

// Шкаф
export const Wardrobe = ({ config }: FurnitureProps) => {
  return (
    <group>
      {/* Корпус */}
      <mesh position={[0, config.height / 2, 0]}>
        <boxGeometry args={[config.width, config.height, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.5} />
      </mesh>
      {/* Ручки */}
      <mesh position={[-0.1, config.height / 2, config.depth / 2 + 0.02]}>
        <boxGeometry args={[0.05, 0.2, 0.03]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
      <mesh position={[0.1, config.height / 2, config.depth / 2 + 0.02]}>
        <boxGeometry args={[0.05, 0.2, 0.03]} />
        <meshStandardMaterial color="#888888" metalness={0.8} />
      </mesh>
    </group>
  );
};

// Стол
export const Table = ({ config }: FurnitureProps) => {
  const legHeight = config.height - 0.05;
  const legSize = 0.05;
  
  return (
    <group>
      {/* Столешница */}
      <mesh position={[0, config.height - 0.025, 0]}>
        <boxGeometry args={[config.width, 0.05, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.3} />
      </mesh>
      {/* Ножки */}
      {[
        [-config.width / 2 + legSize, 0, -config.depth / 2 + legSize],
        [config.width / 2 - legSize, 0, -config.depth / 2 + legSize],
        [-config.width / 2 + legSize, 0, config.depth / 2 - legSize],
        [config.width / 2 - legSize, 0, config.depth / 2 - legSize],
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], legHeight / 2, pos[2]]}>
          <boxGeometry args={[legSize, legHeight, legSize]} />
          <meshStandardMaterial color={config.color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Стул
export const Chair = ({ config }: FurnitureProps) => {
  const seatHeight = 0.45;
  const legSize = 0.04;
  
  return (
    <group>
      {/* Сиденье */}
      <mesh position={[0, seatHeight, 0]}>
        <boxGeometry args={[config.width * 0.8, 0.05, config.depth * 0.8]} />
        <meshStandardMaterial color={config.color} roughness={0.5} />
      </mesh>
      {/* Спинка */}
      <mesh position={[0, seatHeight + 0.35, -config.depth * 0.35]}>
        <boxGeometry args={[config.width * 0.8, 0.7, 0.05]} />
        <meshStandardMaterial color={config.color} roughness={0.5} />
      </mesh>
      {/* Ножки */}
      {[
        [-config.width * 0.35, 0, -config.depth * 0.35],
        [config.width * 0.35, 0, -config.depth * 0.35],
        [-config.width * 0.35, 0, config.depth * 0.35],
        [config.width * 0.35, 0, config.depth * 0.35],
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], seatHeight / 2, pos[2]]}>
          <boxGeometry args={[legSize, seatHeight, legSize]} />
          <meshStandardMaterial color={config.color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
};

// Комод
export const Dresser = ({ config }: FurnitureProps) => {
  const drawerCount = 4;
  const drawerHeight = (config.height - 0.1) / drawerCount;
  
  return (
    <group>
      {/* Корпус */}
      <mesh position={[0, config.height / 2, 0]}>
        <boxGeometry args={[config.width, config.height, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.5} />
      </mesh>
      {/* Ящики (визуальные линии) */}
      {Array.from({ length: drawerCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.05 + drawerHeight * (i + 0.5), config.depth / 2 + 0.01]}>
          <boxGeometry args={[config.width - 0.1, drawerHeight - 0.02, 0.02]} />
          <meshStandardMaterial color={config.color} roughness={0.4} />
        </mesh>
      ))}
      {/* Ручки */}
      {Array.from({ length: drawerCount }).map((_, i) => (
        <mesh key={`handle-${i}`} position={[0, 0.05 + drawerHeight * (i + 0.5), config.depth / 2 + 0.03]}>
          <boxGeometry args={[0.15, 0.03, 0.02]} />
          <meshStandardMaterial color="#888888" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

// Диван
export const Sofa = ({ config }: FurnitureProps) => {
  const seatHeight = 0.4;
  
  return (
    <group>
      {/* Основание */}
      <mesh position={[0, seatHeight / 2, 0]}>
        <boxGeometry args={[config.width, seatHeight, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.8} />
      </mesh>
      {/* Спинка */}
      <mesh position={[0, seatHeight + 0.3, -config.depth / 2 + 0.1]}>
        <boxGeometry args={[config.width, 0.6, 0.2]} />
        <meshStandardMaterial color={config.color} roughness={0.8} />
      </mesh>
      {/* Подлокотники */}
      <mesh position={[-config.width / 2 + 0.1, seatHeight + 0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.8} />
      </mesh>
      <mesh position={[config.width / 2 - 0.1, seatHeight + 0.1, 0]}>
        <boxGeometry args={[0.2, 0.2, config.depth]} />
        <meshStandardMaterial color={config.color} roughness={0.8} />
      </mesh>
      {/* Подушки */}
      <mesh position={[0, seatHeight + 0.1, 0.1]}>
        <boxGeometry args={[config.width - 0.3, 0.15, config.depth - 0.3]} />
        <meshStandardMaterial color={config.color} roughness={0.9} />
      </mesh>
    </group>
  );
};

// Гриль (мангал)
export const Grill = ({ config }: FurnitureProps) => {
  return (
    <group>
      {/* Основание */}
      <mesh position={[0, config.height / 2, 0]}>
        <boxGeometry args={[config.width, config.height * 0.6, config.depth]} />
        <meshStandardMaterial color="#333333" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Решётка */}
      <mesh position={[0, config.height * 0.65, 0]}>
        <boxGeometry args={[config.width - 0.1, 0.02, config.depth - 0.1]} />
        <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Ножки */}
      {[
        [-config.width / 2 + 0.05, 0, -config.depth / 2 + 0.05],
        [config.width / 2 - 0.05, 0, -config.depth / 2 + 0.05],
        [-config.width / 2 + 0.05, 0, config.depth / 2 - 0.05],
        [config.width / 2 - 0.05, 0, config.depth / 2 - 0.05],
      ].map((pos, i) => (
        <mesh key={i} position={[pos[0], config.height * 0.1, pos[2]]}>
          <cylinderGeometry args={[0.02, 0.02, config.height * 0.2]} />
          <meshStandardMaterial color="#333333" metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
};

export default { Bed, Wardrobe, Table, Chair, Dresser, Sofa, Grill };
