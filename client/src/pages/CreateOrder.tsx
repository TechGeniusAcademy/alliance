import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { 
  MdBed, 
  MdChair, 
  MdTableRestaurant, 
  MdWeekend, 
  MdStoreMallDirectory,
  MdKitchen,
  MdCheck
} from 'react-icons/md';
import { Bed, Wardrobe, Table, Chair, Sofa, Dresser, Grill } from '../components/3d/FurnitureModels';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import styles from './CreateOrder.module.css';

type FurnitureType = 'bed' | 'wardrobe' | 'table' | 'chair' | 'sofa' | 'dresser' | 'grill';
type MaterialType = 'wood' | 'metal' | 'plastic' | 'fabric';
type WoodType = 'oak' | 'pine' | 'birch' | 'walnut' | 'mahogany' | 'mdf';
type FinishType = 'matte' | 'glossy' | 'satin' | 'natural';

interface FurnitureConfig {
  width: number;
  height: number;
  depth: number;
  color: string;
  material: MaterialType;
  woodType?: WoodType;
  finish: FinishType;
  hardware: string;
  extras: string[];
  quantity: number;
  deliveryType: string;
  assemblyRequired: boolean;
  warrantyYears: number;
  notes: string;
  // Аукцион
  desiredPrice: number;
  maxBudget: number;
  deadline: string;
  urgency: 'low' | 'medium' | 'high';
}

interface ToastMessage {
  message: string;
  type: ToastType;
}

const CreateOrder = () => {
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureType>('bed');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const [config, setConfig] = useState<FurnitureConfig>({
    width: 2,
    height: 1.5,
    depth: 2,
    color: '#8B4513',
    material: 'wood',
    woodType: 'oak',
    finish: 'matte',
    hardware: 'standard',
    extras: [],
    quantity: 1,
    deliveryType: 'standard',
    assemblyRequired: true,
    warrantyYears: 1,
    notes: '',
    desiredPrice: 50000,
    maxBudget: 100000,
    deadline: '',
    urgency: 'medium',
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const furnitureOptions = [
    { type: 'bed' as FurnitureType, name: 'Кровать', icon: MdBed, defaultSize: { width: 2, height: 0.6, depth: 2.2 } },
    { type: 'wardrobe' as FurnitureType, name: 'Шкаф', icon: MdStoreMallDirectory, defaultSize: { width: 2, height: 2.5, depth: 0.6 } },
    { type: 'table' as FurnitureType, name: 'Стол', icon: MdTableRestaurant, defaultSize: { width: 1.5, height: 0.8, depth: 1 } },
    { type: 'chair' as FurnitureType, name: 'Стул', icon: MdChair, defaultSize: { width: 0.5, height: 1, depth: 0.5 } },
    { type: 'sofa' as FurnitureType, name: 'Диван', icon: MdWeekend, defaultSize: { width: 2.5, height: 0.9, depth: 1 } },
    { type: 'dresser' as FurnitureType, name: 'Комод', icon: MdKitchen, defaultSize: { width: 1.2, height: 1, depth: 0.5 } },
    { type: 'grill' as FurnitureType, name: 'Гриль', icon: MdKitchen, defaultSize: { width: 1, height: 1, depth: 1 } },
  ];

  const colors = [
    { name: 'Коричневый', value: '#8B4513' },
    { name: 'Белый', value: '#FFFFFF' },
    { name: 'Черный', value: '#2C2C2C' },
    { name: 'Серый', value: '#808080' },
    { name: 'Бежевый', value: '#D2B48C' },
    { name: 'Синий', value: '#4A90E2' },
    { name: 'Зеленый', value: '#6B8E23' },
    { name: 'Красный', value: '#C41E3A' },
  ];

  const materials = [
    { name: 'Дерево', value: 'wood' as MaterialType },
    { name: 'Металл', value: 'metal' as MaterialType },
    { name: 'Пластик', value: 'plastic' as MaterialType },
    { name: 'Ткань', value: 'fabric' as MaterialType },
  ];

  const hardwareOptions = [
    { name: 'Стандартная фурнитура', value: 'standard' },
    { name: 'Премиум фурнитура', value: 'premium' },
    { name: 'Скрытая фурнитура', value: 'hidden' },
    { name: 'Декоративная фурнитура', value: 'decorative' },
  ];

  const extraOptions = [
    'Мягкая обивка',
    'Встроенное освещение',
    'Зеркало',
    'Ящики для хранения',
    'Регулируемая высота',
    'Колесики',
    'Защита от детей',
    'Антибактериальное покрытие',
  ];

  const woodTypes = [
    { name: 'Дуб', value: 'oak' as WoodType, description: 'Прочный, благородный' },
    { name: 'Сосна', value: 'pine' as WoodType, description: 'Легкий, доступный' },
    { name: 'Береза', value: 'birch' as WoodType, description: 'Светлый, прочный' },
    { name: 'Орех', value: 'walnut' as WoodType, description: 'Элитный, темный' },
    { name: 'Махагон', value: 'mahogany' as WoodType, description: 'Премиум класс' },
    { name: 'МДФ', value: 'mdf' as WoodType, description: 'Экономный вариант' },
  ];

  const finishTypes = [
    { name: 'Матовый', value: 'matte' as FinishType },
    { name: 'Глянцевый', value: 'glossy' as FinishType },
    { name: 'Полуматовый', value: 'satin' as FinishType },
    { name: 'Натуральный', value: 'natural' as FinishType },
  ];

  const deliveryTypes = [
    { name: 'Стандартная доставка (5-7 дней)', value: 'standard', price: 5000 },
    { name: 'Экспресс доставка (1-2 дня)', value: 'express', price: 15000 },
    { name: 'Самовывоз (бесплатно)', value: 'pickup', price: 0 },
    { name: 'Доставка + подъем на этаж', value: 'floor-delivery', price: 8000 },
  ];

  const warrantyOptions = [
    { name: '1 год', value: 1, price: 0 },
    { name: '2 года', value: 2, price: 3000 },
    { name: '3 года', value: 3, price: 5000 },
    { name: '5 лет', value: 5, price: 10000 },
  ];

  const handleFurnitureChange = (type: FurnitureType) => {
    setSelectedFurniture(type);
    const furniture = furnitureOptions.find(f => f.type === type);
    if (furniture) {
      setConfig(prev => ({
        ...prev,
        ...furniture.defaultSize,
      }));
    }
  };

  const handleConfigChange = (key: keyof FurnitureConfig, value: string | number | MaterialType | WoodType | FinishType | string[] | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleExtra = (extra: string) => {
    setConfig(prev => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra],
    }));
  };

  const urgencyOptions = [
    { value: 'low', label: 'Низкий приоритет', description: 'Не срочно, можно подождать' },
    { value: 'medium', label: 'Средний приоритет', description: 'Желательно в ближайшее время' },
    { value: 'high', label: 'Высокий приоритет', description: 'Срочно, нужно как можно быстрее' },
  ] as const;

  const handleSubmitOrder = async () => {
    try {
      // Валидация
      if (!config.deadline) {
        showToast('Укажите желаемый срок выполнения', 'error');
        return;
      }

      if (config.desiredPrice <= 0 || config.maxBudget <= 0) {
        showToast('Укажите корректный бюджет', 'error');
        return;
      }

      if (config.maxBudget < config.desiredPrice) {
        showToast('Максимальный бюджет должен быть больше желаемой цены', 'error');
        return;
      }

      // Словари для перевода
      const materialNames: Record<string, string> = {
        wood: 'Дерево',
        metal: 'Металл',
        plastic: 'Пластик',
        fabric: 'Ткань',
      };

      const woodTypeNames: Record<string, string> = {
        oak: 'Дуб',
        pine: 'Сосна',
        birch: 'Береза',
        walnut: 'Орех',
        mahogany: 'Махагони',
        mdf: 'МДФ',
      };

      const finishNames: Record<string, string> = {
        matte: 'Матовая',
        glossy: 'Глянцевая',
        satin: 'Сатиновая',
        natural: 'Натуральная',
      };

      const hardwareNames: Record<string, string> = {
        standard: 'Стандартная',
        premium: 'Премиум',
        hidden: 'Скрытая',
        decorative: 'Декоративная',
      };

      const deliveryNames: Record<string, string> = {
        standard: 'Стандартная доставка',
        express: 'Экспресс доставка',
        pickup: 'Самовывоз',
      };

      // Формируем описание заказа
      const materialText = config.material === 'wood' && config.woodType 
        ? `${materialNames[config.material] || config.material} (${woodTypeNames[config.woodType] || config.woodType})` 
        : materialNames[config.material] || config.material;

      const description = `
Тип мебели: ${furnitureOptions.find(f => f.type === selectedFurniture)?.name}
Размеры: ${config.width}м (Ш) × ${config.depth}м (Г) × ${config.height}м (В)
Материал: ${materialText}
Отделка: ${finishNames[config.finish] || config.finish}
Фурнитура: ${hardwareNames[config.hardware] || config.hardware}
${config.extras.length > 0 ? `Дополнительно: ${config.extras.join(', ')}` : ''}
Количество: ${config.quantity} шт.
Тип доставки: ${deliveryNames[config.deliveryType] || config.deliveryType}
Сборка: ${config.assemblyRequired ? 'Требуется' : 'Не требуется'}
Гарантия: ${config.warrantyYears} ${config.warrantyYears === 1 ? 'год' : config.warrantyYears < 5 ? 'года' : 'лет'}
${config.notes ? `Примечания: ${config.notes}` : ''}
      `.trim();

      const orderData = {
        title: `${furnitureOptions.find(f => f.type === selectedFurniture)?.name} ${config.woodType || config.material}`,
        description: description,
        furnitureType: selectedFurniture,
        price: {
          min: config.desiredPrice,
          max: config.maxBudget,
        },
        deadline: config.deadline,
        materials: [materialText],
        dimensions: {
          width: config.width,
          height: config.height,
          depth: config.depth,
        },
        notes: config.notes,
        // Сохраняем полную конфигурацию для 3D визуализации
        furnitureConfig: {
          type: selectedFurniture,
          width: config.width,
          height: config.height,
          depth: config.depth,
          color: config.color,
          material: config.material,
          woodType: config.woodType,
          finish: config.finish,
          hardware: config.hardware,
          extras: config.extras,
        },
      };

      // Импортируем и используем orderService
      const { orderService } = await import('../services/orderService');
      await orderService.createOrder(orderData);
      
      showToast('Заказ успешно создан и отправлен на аукцион!', 'success');
      
      // Сбрасываем форму после небольшой задержки
      setTimeout(() => {
        window.location.href = '/dashboard/orders';
      }, 2000);
    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Ошибка создания заказа', 'error');
    }
  };

  const renderFurniture = () => {
    const props = { config };
    
    switch (selectedFurniture) {
      case 'bed': return <Bed {...props} />;
      case 'wardrobe': return <Wardrobe {...props} />;
      case 'table': return <Table {...props} />;
      case 'chair': return <Chair {...props} />;
      case 'sofa': return <Sofa {...props} />;
      case 'dresser': return <Dresser {...props} />;
      case 'grill': return <Grill {...props} />;
      default: return <Bed {...props} />;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Создать заказ</h1>
      
      <div className={styles.content}>
        {/* 3D Viewport */}
        <div className={styles.viewport}>
          <Canvas 
            camera={{ position: [3, 2, 5], fov: 50 }}
            shadows
            gl={{ antialias: true, alpha: false }}
          >
            {/* Освещение для реалистичности */}
            <color attach="background" args={['#ffffff']} />
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[10, 10, 5]} 
              intensity={1.2} 
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={50}
              shadow-camera-left={-10}
              shadow-camera-right={10}
              shadow-camera-top={10}
              shadow-camera-bottom={-10}
            />
            <directionalLight position={[-5, 5, -5]} intensity={0.5} />
            <spotLight 
              position={[0, 10, 0]} 
              intensity={0.3} 
              angle={0.6}
              penumbra={1}
              castShadow
            />
            
            {renderFurniture()}
            
            {/* Черная сетка на белом фоне */}
            <Grid 
              args={[20, 20]} 
              cellSize={0.5}
              cellColor="#000000"
              sectionColor="#000000"
              cellThickness={0.5}
              sectionThickness={1}
              fadeDistance={30}
              fadeStrength={1}
              infiniteGrid
              followCamera={false}
            />
            
            {/* Плоскость для теней */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <planeGeometry args={[50, 50]} />
              <shadowMaterial opacity={0.2} />
            </mesh>
            
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={15}
              maxPolarAngle={Math.PI / 2}
              target={[0, 0.5, 0]}
            />
            
            <Environment preset="studio" />
          </Canvas>
        </div>

        {/* Панель настроек */}
        <div className={styles.controls}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Тип мебели</h2>
            <div className={styles.furnitureGrid}>
              {furnitureOptions.map((furniture) => {
                const Icon = furniture.icon;
                return (
                  <button
                    key={furniture.type}
                    className={`${styles.furnitureButton} ${selectedFurniture === furniture.type ? styles.active : ''}`}
                    onClick={() => handleFurnitureChange(furniture.type)}
                  >
                    <Icon size={32} />
                    <span>{furniture.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Размеры (метры)</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                Ширина: {config.width.toFixed(2)} м
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={config.width}
                  onChange={(e) => handleConfigChange('width', parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </label>
              
              <label className={styles.label}>
                Высота: {config.height.toFixed(2)} м
                <input
                  type="range"
                  min="0.3"
                  max="3"
                  step="0.1"
                  value={config.height}
                  onChange={(e) => handleConfigChange('height', parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </label>
              
              <label className={styles.label}>
                Глубина: {config.depth.toFixed(2)} м
                <input
                  type="range"
                  min="0.3"
                  max="3"
                  step="0.1"
                  value={config.depth}
                  onChange={(e) => handleConfigChange('depth', parseFloat(e.target.value))}
                  className={styles.slider}
                />
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Цвет</h2>
            <div className={styles.colorGrid}>
              {colors.map((color) => (
                <button
                  key={color.value}
                  className={`${styles.colorButton} ${config.color === color.value ? styles.active : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleConfigChange('color', color.value)}
                  title={color.name}
                >
                  {config.color === color.value && <MdCheck size={20} color={color.value === '#FFFFFF' ? '#000' : '#fff'} />}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Материал</h2>
            <div className={styles.buttonGroup}>
              {materials.map((material) => (
                <button
                  key={material.value}
                  className={`${styles.optionButton} ${config.material === material.value ? styles.active : ''}`}
                  onClick={() => handleConfigChange('material', material.value)}
                >
                  {material.name}
                </button>
              ))}
            </div>
          </div>

          {/* Тип дерева - показывать только если выбрано дерево */}
          {config.material === 'wood' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Тип дерева</h2>
              <div className={styles.woodGrid}>
                {woodTypes.map((wood) => (
                  <button
                    key={wood.value}
                    className={`${styles.woodButton} ${config.woodType === wood.value ? styles.active : ''}`}
                    onClick={() => handleConfigChange('woodType', wood.value)}
                  >
                    <span className={styles.woodName}>{wood.name}</span>
                    <span className={styles.woodDesc}>{wood.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Покрытие</h2>
            <div className={styles.buttonGroup}>
              {finishTypes.map((finish) => (
                <button
                  key={finish.value}
                  className={`${styles.optionButton} ${config.finish === finish.value ? styles.active : ''}`}
                  onClick={() => handleConfigChange('finish', finish.value)}
                >
                  {finish.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Фурнитура</h2>
            <div className={styles.buttonGroup}>
              {hardwareOptions.map((hardware) => (
                <button
                  key={hardware.value}
                  className={`${styles.optionButton} ${config.hardware === hardware.value ? styles.active : ''}`}
                  onClick={() => handleConfigChange('hardware', hardware.value)}
                >
                  {hardware.name}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Дополнительные опции</h2>
            <div className={styles.extrasList}>
              {extraOptions.map((extra) => (
                <label key={extra} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.extras.includes(extra)}
                    onChange={() => toggleExtra(extra)}
                    className={styles.checkbox}
                  />
                  <span>{extra}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Количество</h2>
            <div className={styles.quantityControl}>
              <button 
                className={styles.quantityButton}
                onClick={() => handleConfigChange('quantity', Math.max(1, config.quantity - 1))}
              >
                -
              </button>
              <span className={styles.quantityValue}>{config.quantity}</span>
              <button 
                className={styles.quantityButton}
                onClick={() => handleConfigChange('quantity', Math.min(20, config.quantity + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Доставка</h2>
            <div className={styles.deliveryList}>
              {deliveryTypes.map((delivery) => (
                <label key={delivery.value} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="delivery"
                    checked={config.deliveryType === delivery.value}
                    onChange={() => handleConfigChange('deliveryType', delivery.value)}
                    className={styles.radio}
                  />
                  <div className={styles.radioContent}>
                    <span className={styles.radioName}>{delivery.name}</span>
                    <span className={styles.radioPrice}>
                      {delivery.price === 0 ? 'Бесплатно' : `+${delivery.price.toLocaleString()} ₸`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Сборка</h2>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={config.assemblyRequired}
                onChange={(e) => handleConfigChange('assemblyRequired', e.target.checked)}
                className={styles.checkbox}
              />
              <span>Требуется профессиональная сборка (+3,000 ₸ за единицу)</span>
            </label>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Гарантия</h2>
            <div className={styles.buttonGroup}>
              {warrantyOptions.map((warranty) => (
                <button
                  key={warranty.value}
                  className={`${styles.optionButton} ${config.warrantyYears === warranty.value ? styles.active : ''}`}
                  onClick={() => handleConfigChange('warrantyYears', warranty.value)}
                >
                  <span>{warranty.name}</span>
                  {warranty.price > 0 && (
                    <span className={styles.optionPrice}>+{warranty.price.toLocaleString()} ₸</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Особые пожелания</h2>
            <textarea
              value={config.notes}
              onChange={(e) => handleConfigChange('notes', e.target.value)}
              placeholder="Укажите любые особые требования к мебели, цвету, упаковке и т.д."
              className={styles.notesTextarea}
              rows={4}
            />
          </div>

          {/* Бюджет и цена */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>💰 Бюджет</h3>
            <div className={styles.budgetGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Желаемая цена (₸)</label>
                <input
                  type="number"
                  className={styles.priceInput}
                  value={config.desiredPrice}
                  onChange={(e) => handleConfigChange('desiredPrice', Number(e.target.value))}
                  min={0}
                  step={1000}
                />
                <span className={styles.inputHint}>Цена, которую хотели бы заплатить</span>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Максимальный бюджет (₸)</label>
                <input
                  type="number"
                  className={styles.priceInput}
                  value={config.maxBudget}
                  onChange={(e) => handleConfigChange('maxBudget', Number(e.target.value))}
                  min={config.desiredPrice}
                  step={1000}
                />
                <span className={styles.inputHint}>Максимальная сумма, готовы заплатить</span>
              </div>
            </div>
          </div>

          {/* Срочность и дедлайн */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>⏱️ Сроки</h3>
            <div className={styles.urgencyGrid}>
              {urgencyOptions.map(option => (
                <button
                  key={option.value}
                  className={`${styles.urgencyButton} ${config.urgency === option.value ? styles.urgencyButtonActive : ''}`}
                  onClick={() => handleConfigChange('urgency', option.value)}
                >
                  <div className={styles.urgencyLabel}>{option.label}</div>
                  <div className={styles.urgencyDesc}>{option.description}</div>
                </button>
              ))}
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Крайний срок выполнения</label>
              <input
                type="date"
                className={styles.dateInput}
                value={config.deadline}
                onChange={(e) => handleConfigChange('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.submitButton} onClick={handleSubmitOrder}>
              🎯 Отправить на аукцион
            </button>
          </div>
        </div>
      </div>

      {/* Toast уведомление */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CreateOrder;
