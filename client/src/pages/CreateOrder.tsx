import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import { 
  MdBed, 
  MdChair, 
  MdTableRestaurant, 
  MdWeekend, 
  MdStoreMallDirectory,
  MdKitchen,
  MdCheck,
  MdAttachMoney,
  MdAccessTime,
  MdInfo,
  MdTrendingUp
} from 'react-icons/md';
import { Bed, Wardrobe, Table, Chair, Dresser } from '../components/3d/FurnitureModels';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import styles from './CreateOrder.module.css';

type FurnitureType = 'kitchen' | 'bedroom' | 'hallway' | 'office' | 'bathroom' | 'bed' | 'tv-stand' | 'wardrobe' | 'dressing-room' | 'other';
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
  // Подтип мебели (для конфигураций)
  subType?: string;
  // Комплектация (для некоторых типов)
  configuration?: string[];
}

interface ToastMessage {
  message: string;
  type: ToastType;
}

const CreateOrder = () => {
  const { t } = useTranslation();
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureType>('kitchen');
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
    desiredPrice: 0,
    maxBudget: 0,
    deadline: '',
    urgency: 'medium',
    subType: '',
    configuration: [],
  });

  // Цены на материалы (за квадратный метр)
  const materialPrices: Record<MaterialType, number> = {
    wood: 25000,
    metal: 30000,
    plastic: 15000,
    fabric: 20000,
  };

  // Коэффициенты для типов дерева
  const woodTypeMultipliers: Record<WoodType, number> = {
    pine: 1.0,
    mdf: 0.8,
    birch: 1.2,
    oak: 1.5,
    walnut: 1.8,
    mahogany: 2.5,
  };

  // Цены на отделку
  const finishPrices: Record<FinishType, number> = {
    natural: 0,
    matte: 5000,
    satin: 7000,
    glossy: 10000,
  };

  // Цены на фурнитуру
  const hardwarePrices: Record<string, number> = {
    standard: 5000,
    premium: 15000,
    hidden: 20000,
    decorative: 12000,
  };

  // Цены на дополнительные опции
  const extraPrices: Record<string, number> = {
    'Встроенное освещение': 15000,
    'Мягкое закрывание дверей': 8000,
    'Выдвижные ящики': 12000,
    'Встроенная бытовая техника': 50000,
    'Столешница из камня': 80000,
    'Фартук из стекла': 25000,
    'Доводчики': 6000,
    'Мягкая обивка': 20000,
    'Зеркало': 15000,
    'Ящики для хранения': 10000,
    'Подъемный механизм': 25000,
    'Ортопедическое основание': 30000,
    'Мягкая обивка сиденья': 18000,
    'Крючки для одежды': 3000,
    'Полка для обуви': 5000,
    'Мягкая спинка': 15000,
    'Регулируемая высота': 12000,
    'Колесики': 4000,
    'Кабель-каналы': 3000,
    'Выдвижная клавиатурная полка': 7000,
    'Замки на ящики': 5000,
    'Эргономичный дизайн': 8000,
    'Влагостойкое покрытие': 10000,
    'Зеркало с подогревом': 35000,
    'Антибактериальное покрытие': 8000,
    'Мягкая обивка изголовья': 22000,
    'Боковые тумбочки': 40000,
    'Отверстия для кабелей': 2000,
    'Стеклянные дверцы': 18000,
    'Полки для техники': 6000,
    'Зеркальные дверцы': 30000,
    'Штанги для одежды': 5000,
    'Полки разной высоты': 8000,
    'Полки для обуви': 7000,
    'Зеркало в рост': 25000,
    'Корзины для белья': 6000,
    'Вешалки с крючками': 4000,
    'Регулируемые полки': 6000,
    'Выдвижные механизмы': 9000,
    'Защита от опрокидывания': 3000,
  };

  // Цены на комплектацию спальни
  const bedroomConfigPrices: Record<string, number> = {
    'Комод': 80000,
    'Тумба': 35000,
    'Консоль с зеркалом': 60000,
  };

  // Базовые цены по типам мебели
  const baseFurniturePrices: Record<FurnitureType, number> = {
    kitchen: 150000,
    bedroom: 120000,
    hallway: 80000,
    office: 90000,
    bathroom: 70000,
    bed: 100000,
    'tv-stand': 50000,
    wardrobe: 110000,
    'dressing-room': 200000,
    other: 40000,
  };

  // Множители для конфигураций
  const subTypeMultipliers: Record<string, number> = {
    'straight': 1.0,
    'l-shaped': 1.3,
    'u-shaped': 1.6,
    'two-part': 1.4,
    'with-island': 1.8,
    'corner': 1.2,
    'straight-soft': 1.2,
    'corner-soft': 1.4,
    'straight-mirror': 1.3,
    'corner-mirror': 1.5,
    'table-chairs': 1.0,
    'office-wardrobe': 1.2,
    'reception': 1.5,
    'sink-cabinet-tall': 1.3,
    'sink-cabinet-straight': 1.0,
    'washing-machine-cabinet': 1.1,
    'storage-cabinets': 0.9,
    'single-hard': 0.8,
    'single-soft': 0.9,
    'single-lift': 1.0,
    'double-hard': 1.0,
    'double-soft': 1.1,
    'double-lift': 1.3,
    'with-cabinet': 1.3,
    'hinged': 1.0,
    'sliding': 1.4,
    'shelving': 0.7,
    'shelves': 0.5,
    'cabinets': 0.9,
    'showcases': 1.1,
  };

  // Функция расчета цены
  const calculatePrice = (): number => {
    // 1. Базовая цена по типу мебели
    let basePrice = baseFurniturePrices[selectedFurniture] || 50000;

    // 2. Множитель за конфигурацию
    const subTypeMultiplier = config.subType ? (subTypeMultipliers[config.subType] || 1.0) : 1.0;
    basePrice *= subTypeMultiplier;

    // 3. Расчет по размерам (площадь поверхности для материала)
    const area = (config.width * config.height + config.width * config.depth + config.height * config.depth) * 2;
    const materialCost = materialPrices[config.material] * area;

    // 4. Множитель за тип дерева (если дерево)
    let materialMultiplier = 1.0;
    if (config.material === 'wood' && config.woodType) {
      materialMultiplier = woodTypeMultipliers[config.woodType];
    }

    // 5. Стоимость отделки
    const finishCost = finishPrices[config.finish] || 0;

    // 6. Стоимость фурнитуры
    const hardwareCost = hardwarePrices[config.hardware] || 5000;

    // 7. Дополнительные опции
    const extrasCost = config.extras.reduce((sum, extra) => {
      return sum + (extraPrices[extra] || 0);
    }, 0);

    // 8. Комплектация спальни
    const configurationCost = (config.configuration || []).reduce((sum, item) => {
      return sum + (bedroomConfigPrices[item] || 0);
    }, 0);

    // 9. Стоимость доставки
    const deliveryOption = deliveryTypes.find(d => d.value === config.deliveryType);
    const deliveryCost = deliveryOption?.price || 0;

    // 10. Стоимость сборки
    const assemblyCost = (config.assemblyRequired || alwaysRequiresAssembly.includes(selectedFurniture)) 
      ? 15000 
      : 0;

    // 11. Стоимость гарантии
    const warrantyOption = warrantyOptions.find(w => w.value === config.warrantyYears);
    const warrantyCost = warrantyOption?.price || 0;

    // Итоговая цена за одну единицу
    const unitPrice = 
      basePrice + 
      (materialCost * materialMultiplier) + 
      finishCost + 
      hardwareCost + 
      extrasCost + 
      configurationCost +
      deliveryCost +
      assemblyCost +
      warrantyCost;

    // Умножаем на количество
    const totalPrice = Math.round(unitPrice * config.quantity);

    return totalPrice;
  };

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const furnitureOptions = [
    { type: 'kitchen' as FurnitureType, name: t('createOrder.furnitureTypes.kitchen'), icon: MdKitchen, defaultSize: { width: 3, height: 2.2, depth: 0.6 } },
    { type: 'bedroom' as FurnitureType, name: t('createOrder.furnitureTypes.bedroom'), icon: MdBed, defaultSize: { width: 3.5, height: 2, depth: 0.6 } },
    { type: 'hallway' as FurnitureType, name: t('createOrder.furnitureTypes.hallway'), icon: MdStoreMallDirectory, defaultSize: { width: 2, height: 2, depth: 0.4 } },
    { type: 'office' as FurnitureType, name: t('createOrder.furnitureTypes.office'), icon: MdTableRestaurant, defaultSize: { width: 1.6, height: 0.75, depth: 0.8 } },
    { type: 'bathroom' as FurnitureType, name: t('createOrder.furnitureTypes.bathroom'), icon: MdStoreMallDirectory, defaultSize: { width: 0.8, height: 1.8, depth: 0.4 } },
    { type: 'bed' as FurnitureType, name: t('createOrder.furnitureTypes.bed'), icon: MdBed, defaultSize: { width: 2, height: 0.6, depth: 2.2 } },
    { type: 'tv-stand' as FurnitureType, name: t('createOrder.furnitureTypes.tvStand'), icon: MdWeekend, defaultSize: { width: 1.8, height: 0.5, depth: 0.4 } },
    { type: 'wardrobe' as FurnitureType, name: t('createOrder.furnitureTypes.wardrobe'), icon: MdStoreMallDirectory, defaultSize: { width: 2, height: 2.5, depth: 0.6 } },
    { type: 'dressing-room' as FurnitureType, name: t('createOrder.furnitureTypes.dressingRoom'), icon: MdStoreMallDirectory, defaultSize: { width: 3, height: 2.5, depth: 2 } },
    { type: 'other' as FurnitureType, name: t('createOrder.furnitureTypes.other'), icon: MdChair, defaultSize: { width: 1, height: 1.5, depth: 0.4 } },
  ];

  // Подтипы для каждого типа мебели
  const furnitureSubTypes: Record<FurnitureType, { value: string; label: string }[]> = {
    kitchen: [
      { value: 'straight', label: t('createOrder.configuration.straight') },
      { value: 'l-shaped', label: t('createOrder.configuration.lShaped') },
      { value: 'u-shaped', label: t('createOrder.configuration.uShaped') },
      { value: 'two-part', label: t('createOrder.configuration.twoPart') },
      { value: 'with-island', label: t('createOrder.configuration.withIsland') },
    ],
    bedroom: [
      { value: 'straight', label: t('createOrder.configuration.straight') },
      { value: 'corner', label: t('createOrder.configuration.corner') },
    ],
    hallway: [
      { value: 'straight', label: t('createOrder.configuration.straight') },
      { value: 'corner', label: t('createOrder.configuration.corner') },
      { value: 'straight-soft', label: t('createOrder.configuration.straightSoft') },
      { value: 'corner-soft', label: t('createOrder.configuration.cornerSoft') },
      { value: 'straight-mirror', label: t('createOrder.configuration.straightMirror') },
      { value: 'corner-mirror', label: t('createOrder.configuration.cornerMirror') },
    ],
    office: [
      { value: 'table-chairs', label: t('createOrder.configuration.tableChairs') },
      { value: 'office-wardrobe', label: t('createOrder.configuration.officeWardrobe') },
      { value: 'reception', label: t('createOrder.configuration.reception') },
    ],
    bathroom: [
      { value: 'sink-cabinet-tall', label: t('createOrder.configuration.sinkCabinetTall') },
      { value: 'sink-cabinet-straight', label: t('createOrder.configuration.sinkCabinetStraight') },
      { value: 'washing-machine-cabinet', label: t('createOrder.configuration.washingMachineCabinet') },
      { value: 'storage-cabinets', label: t('createOrder.configuration.storageCabinets') },
    ],
    bed: [
      { value: 'single-hard', label: t('createOrder.configuration.singleHard') },
      { value: 'single-soft', label: t('createOrder.configuration.singleSoft') },
      { value: 'single-lift', label: t('createOrder.configuration.singleLift') },
      { value: 'double-hard', label: t('createOrder.configuration.doubleHard') },
      { value: 'double-soft', label: t('createOrder.configuration.doubleSoft') },
      { value: 'double-lift', label: t('createOrder.configuration.doubleLift') },
    ],
    'tv-stand': [
      { value: 'straight', label: t('createOrder.configuration.straight') },
      { value: 'with-cabinet', label: t('createOrder.configuration.withCabinet') },
    ],
    wardrobe: [
      { value: 'hinged', label: t('createOrder.configuration.hinged') },
      { value: 'sliding', label: t('createOrder.configuration.sliding') },
    ],
    'dressing-room': [
      { value: 'u-shaped', label: t('createOrder.configuration.uShaped') },
      { value: 'l-shaped', label: t('createOrder.configuration.lShaped') },
      { value: 'straight', label: t('createOrder.configuration.straight') },
    ],
    other: [
      { value: 'shelving', label: t('createOrder.configuration.shelving') },
      { value: 'shelves', label: t('createOrder.configuration.shelves') },
      { value: 'cabinets', label: t('createOrder.configuration.cabinets') },
      { value: 'showcases', label: t('createOrder.configuration.showcases') },
    ],
  };

  // Опции комплектации для спальной гарнитуры
  const bedroomConfigOptions = [
    t('createOrder.bedroomConfig.dresser'),
    t('createOrder.bedroomConfig.nightstand'),
    t('createOrder.bedroomConfig.consoleWithMirror'),
  ];

  const colors = [
    { name: t('createOrder.color.brown'), value: '#8B4513' },
    { name: t('createOrder.color.white'), value: '#FFFFFF' },
    { name: t('createOrder.color.black'), value: '#2C2C2C' },
    { name: t('createOrder.color.gray'), value: '#808080' },
    { name: t('createOrder.color.beige'), value: '#D2B48C' },
    { name: t('createOrder.color.blue'), value: '#4A90E2' },
    { name: t('createOrder.color.green'), value: '#6B8E23' },
    { name: t('createOrder.color.red'), value: '#C41E3A' },
  ];

  const materials = [
    { name: t('createOrder.material.wood'), value: 'wood' as MaterialType },
    { name: t('createOrder.material.metal'), value: 'metal' as MaterialType },
    { name: t('createOrder.material.plastic'), value: 'plastic' as MaterialType },
    { name: t('createOrder.material.fabric'), value: 'fabric' as MaterialType },
  ];

  const hardwareOptions = [
    { name: t('createOrder.hardware.standard'), value: 'standard' },
    { name: t('createOrder.hardware.premium'), value: 'premium' },
    { name: t('createOrder.hardware.hidden'), value: 'hidden' },
    { name: t('createOrder.hardware.decorative'), value: 'decorative' },
  ];

  // Дополнительные опции для каждого типа мебели
  const extraOptionsByType: Record<FurnitureType, string[]> = {
    kitchen: [
      'Встроенное освещение',
      'Мягкое закрывание дверей',
      'Выдвижные ящики',
      'Встроенная бытовая техника',
      'Столешница из камня',
      'Фартук из стекла',
      'Доводчики',
    ],
    bedroom: [
      'Мягкая обивка',
      'Встроенное освещение',
      'Зеркало',
      'Ящики для хранения',
      'Подъемный механизм',
      'Ортопедическое основание',
    ],
    hallway: [
      'Мягкая обивка сиденья',
      'Зеркало',
      'Крючки для одежды',
      'Полка для обуви',
      'Встроенное освещение',
      'Мягкая спинка',
    ],
    office: [
      'Регулируемая высота',
      'Колесики',
      'Кабель-каналы',
      'Выдвижная клавиатурная полка',
      'Замки на ящики',
      'Эргономичный дизайн',
    ],
    bathroom: [
      'Влагостойкое покрытие',
      'Встроенное освещение',
      'Зеркало с подогревом',
      'Выдвижные ящики',
      'Антибактериальное покрытие',
      'Мягкое закрывание',
    ],
    bed: [
      'Мягкая обивка изголовья',
      'Подъемный механизм',
      'Ящики для хранения',
      'Ортопедическое основание',
      'Встроенное освещение',
      'Боковые тумбочки',
    ],
    'tv-stand': [
      'Отверстия для кабелей',
      'Стеклянные дверцы',
      'Встроенное освещение',
      'Полки для техники',
      'Колесики',
      'Доводчики',
    ],
    wardrobe: [
      'Зеркальные дверцы',
      'Встроенное освещение',
      'Выдвижные ящики',
      'Штанги для одежды',
      'Полки разной высоты',
      'Мягкое закрывание',
      'Доводчики',
    ],
    'dressing-room': [
      'Встроенное освещение',
      'Выдвижные ящики',
      'Штанги для одежды',
      'Полки для обуви',
      'Зеркало в рост',
      'Корзины для белья',
      'Вешалки с крючками',
    ],
    other: [
      'Регулируемые полки',
      'Стеклянные дверцы',
      'Встроенное освещение',
      'Колесики',
      'Выдвижные механизмы',
      'Защита от опрокидывания',
    ],
  };

  // Mapping function to translate extras
  const getExtraTranslation = (extra: string): string => {
    const extraKeyMap: Record<string, string> = {
      'Встроенное освещение': t('createOrder.extras.builtInLighting'),
      'Мягкое закрывание дверей': t('createOrder.extras.softCloseDoors'),
      'Выдвижные ящики': t('createOrder.extras.drawers'),
      'Встроенная бытовая техника': t('createOrder.extras.builtInAppliances'),
      'Столешница из камня': t('createOrder.extras.stoneCountertop'),
      'Фартук из стекла': t('createOrder.extras.glassBacksplash'),
      'Доводчики': t('createOrder.extras.doorClosers'),
      'Мягкая обивка': t('createOrder.extras.softUpholstery'),
      'Зеркало': t('createOrder.extras.mirror'),
      'Ящики для хранения': t('createOrder.extras.storageBoxes'),
      'Подъемный механизм': t('createOrder.extras.liftMechanism'),
      'Ортопедическое основание': t('createOrder.extras.orthopedicBase'),
      'Мягкая обивка сиденья': t('createOrder.extras.softSeatUpholstery'),
      'Крючки для одежды': t('createOrder.extras.clothingHooks'),
      'Полка для обуви': t('createOrder.extras.shoeRack'),
      'Мягкая спинка': t('createOrder.extras.softBackrest'),
      'Регулируемая высота': t('createOrder.extras.adjustableHeight'),
      'Колесики': t('createOrder.extras.casters'),
      'Кабель-каналы': t('createOrder.extras.cableManagement'),
      'Выдвижная клавиатурная полка': t('createOrder.extras.keyboardTray'),
      'Замки на ящики': t('createOrder.extras.drawerLocks'),
      'Эргономичный дизайн': t('createOrder.extras.ergonomicDesign'),
      'Влагостойкое покрытие': t('createOrder.extras.moistureResistant'),
      'Зеркало с подогревом': t('createOrder.extras.heatedMirror'),
      'Антибактериальное покрытие': t('createOrder.extras.antibacterialCoating'),
      'Мягкая обивка изголовья': t('createOrder.extras.softHeadboard'),
      'Боковые тумбочки': t('createOrder.extras.sideNightstands'),
      'Отверстия для кабелей': t('createOrder.extras.cableHoles'),
      'Стеклянные дверцы': t('createOrder.extras.glassDoors'),
      'Полки для техники': t('createOrder.extras.equipmentShelves'),
      'Зеркальные дверцы': t('createOrder.extras.mirrorDoors'),
      'Штанги для одежды': t('createOrder.extras.clothingRods'),
      'Полки разной высоты': t('createOrder.extras.variableHeightShelves'),
      'Полки для обуви': t('createOrder.extras.shoeShelves'),
      'Зеркало в рост': t('createOrder.extras.fullLengthMirror'),
      'Корзины для белья': t('createOrder.extras.laundryBaskets'),
      'Вешалки с крючками': t('createOrder.extras.hangersWithHooks'),
      'Регулируемые полки': t('createOrder.extras.adjustableShelves'),
      'Выдвижные механизмы': t('createOrder.extras.slideOutMechanisms'),
      'Защита от опрокидывания': t('createOrder.extras.antiTipProtection'),
      'Мягкое закрывание': t('createOrder.extras.softCloseDoors'),
    };
    return extraKeyMap[extra] || extra;
  };

  const woodTypes = [
    { name: t('createOrder.woodType.oak'), value: 'oak' as WoodType, description: t('createOrder.woodType.oakDesc') },
    { name: t('createOrder.woodType.pine'), value: 'pine' as WoodType, description: t('createOrder.woodType.pineDesc') },
    { name: t('createOrder.woodType.birch'), value: 'birch' as WoodType, description: t('createOrder.woodType.birchDesc') },
    { name: t('createOrder.woodType.walnut'), value: 'walnut' as WoodType, description: t('createOrder.woodType.walnutDesc') },
    { name: t('createOrder.woodType.mahogany'), value: 'mahogany' as WoodType, description: t('createOrder.woodType.mahoganyDesc') },
    { name: t('createOrder.woodType.mdf'), value: 'mdf' as WoodType, description: t('createOrder.woodType.mdfDesc') },
  ];

  const finishTypes = [
    { name: t('createOrder.finish.matte'), value: 'matte' as FinishType },
    { name: t('createOrder.finish.glossy'), value: 'glossy' as FinishType },
    { name: t('createOrder.finish.satin'), value: 'satin' as FinishType },
    { name: t('createOrder.finish.natural'), value: 'natural' as FinishType },
  ];

  const deliveryTypes = [
    { name: t('createOrder.delivery.standard'), value: 'standard', price: 5000 },
    { name: t('createOrder.delivery.express'), value: 'express', price: 15000 },
    { name: t('createOrder.delivery.pickup'), value: 'pickup', price: 0 },
    { name: t('createOrder.delivery.floorDelivery'), value: 'floor-delivery', price: 8000 },
  ];

  // Типы мебели, для которых сборка всегда требуется
  const alwaysRequiresAssembly: FurnitureType[] = ['kitchen', 'bedroom', 'dressing-room'];
  
  // Типы мебели, для которых НЕ нужна опция сборки (слишком простые)
  const noAssemblyOption: FurnitureType[] = ['other'];

  const warrantyOptions = [
    { name: t('createOrder.warranty.oneYear'), value: 1, price: 0 },
    { name: t('createOrder.warranty.twoYears'), value: 2, price: 3000 },
    { name: t('createOrder.warranty.threeYears'), value: 3, price: 5000 },
    { name: t('createOrder.warranty.fiveYears'), value: 5, price: 10000 },
  ];

  const handleFurnitureChange = (type: FurnitureType) => {
    setSelectedFurniture(type);
    const furniture = furnitureOptions.find(f => f.type === type);
    if (furniture) {
      setConfig(prev => ({
        ...prev,
        ...furniture.defaultSize,
        subType: '',
        configuration: [],
        extras: [], // Сбрасываем доп. опции
        assemblyRequired: alwaysRequiresAssembly.includes(type) ? true : !noAssemblyOption.includes(type),
      }));
    }
  };

  const toggleConfiguration = (item: string) => {
    setConfig(prev => ({
      ...prev,
      configuration: prev.configuration?.includes(item)
        ? prev.configuration.filter(i => i !== item)
        : [...(prev.configuration || []), item],
    }));
  };

  // Автоматически пересчитываем цену при изменении конфигурации
  useEffect(() => {
    const calculatedPrice = calculatePrice();
    const desiredPrice = calculatedPrice;
    const maxBudget = Math.round(calculatedPrice * 1.15); // +15% запас

    setConfig(prev => ({
      ...prev,
      desiredPrice,
      maxBudget,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedFurniture,
    config.width,
    config.height,
    config.depth,
    config.material,
    config.woodType,
    config.finish,
    config.hardware,
    config.extras.length,
    config.quantity,
    config.deliveryType,
    config.assemblyRequired,
    config.warrantyYears,
    config.subType,
    config.configuration?.length,
  ]);

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
    { value: 'low', label: t('createOrder.timing.urgency.low'), description: t('createOrder.timing.urgency.lowDesc') },
    { value: 'medium', label: t('createOrder.timing.urgency.medium'), description: t('createOrder.timing.urgency.mediumDesc') },
    { value: 'high', label: t('createOrder.timing.urgency.high'), description: t('createOrder.timing.urgency.highDesc') },
  ] as const;

  const handleSubmitOrder = async () => {
    try {
      // Валидация
      if (!config.deadline) {
        showToast(t('createOrder.validation.deadlineRequired'), 'error');
        return;
      }

      if (config.desiredPrice <= 0 || config.maxBudget <= 0) {
        showToast(t('createOrder.validation.budgetRequired'), 'error');
        return;
      }

      if (config.maxBudget < config.desiredPrice) {
        showToast(t('createOrder.validation.maxBudgetTooLow'), 'error');
        return;
      }

      // Словари для перевода
      const materialNames: Record<string, string> = {
        wood: t('createOrder.material.wood'),
        metal: t('createOrder.material.metal'),
        plastic: t('createOrder.material.plastic'),
        fabric: t('createOrder.material.fabric'),
      };

      const woodTypeNames: Record<string, string> = {
        oak: t('createOrder.woodType.oak'),
        pine: t('createOrder.woodType.pine'),
        birch: t('createOrder.woodType.birch'),
        walnut: t('createOrder.woodType.walnut'),
        mahogany: t('createOrder.woodType.mahogany'),
        mdf: t('createOrder.woodType.mdf'),
      };

      const finishNames: Record<string, string> = {
        matte: t('createOrder.finish.matte'),
        glossy: t('createOrder.finish.glossy'),
        satin: t('createOrder.finish.satin'),
        natural: t('createOrder.finish.natural'),
      };

      const hardwareNames: Record<string, string> = {
        standard: t('createOrder.hardware.standard'),
        premium: t('createOrder.hardware.premium'),
        hidden: t('createOrder.hardware.hidden'),
        decorative: t('createOrder.hardware.decorative'),
      };

      const deliveryNames: Record<string, string> = {
        standard: t('createOrder.delivery.standard'),
        express: t('createOrder.delivery.express'),
        pickup: t('createOrder.delivery.pickup'),
      };

      // Формируем описание заказа
      const materialText = config.material === 'wood' && config.woodType 
        ? `${materialNames[config.material] || config.material} (${woodTypeNames[config.woodType] || config.woodType})` 
        : materialNames[config.material] || config.material;

      const furnitureName = furnitureOptions.find(f => f.type === selectedFurniture)?.name || '';
      const subTypeName = config.subType 
        ? furnitureSubTypes[selectedFurniture]?.find(st => st.value === config.subType)?.label 
        : '';

      const description = `
Тип мебели: ${furnitureName}${subTypeName ? ` - ${subTypeName}` : ''}
${config.configuration && config.configuration.length > 0 ? `Комплектация: ${config.configuration.join(', ')}` : ''}
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
        title: `${furnitureName}${subTypeName ? ` - ${subTypeName}` : ''} ${config.woodType || config.material}`,
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
          subType: config.subType,
          configuration: config.configuration,
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
      
      showToast(t('createOrder.success'), 'success');
      
      // Сбрасываем форму после небольшой задержки
      setTimeout(() => {
        window.location.href = '/dashboard/orders';
      }, 2000);
    } catch (error) {
      console.error('Error creating order:', error);
      showToast(t('createOrder.error'), 'error');
    }
  };

  const renderFurniture = () => {
    const props = { config };
    
    // Используем базовые модели, так как у нас теперь новые типы мебели
    switch (selectedFurniture) {
      case 'kitchen': return <Table {...props} />; // Временная замена
      case 'bedroom': return <Bed {...props} />;
      case 'hallway': return <Wardrobe {...props} />;
      case 'office': return <Table {...props} />;
      case 'bathroom': return <Wardrobe {...props} />;
      case 'bed': return <Bed {...props} />;
      case 'tv-stand': return <Dresser {...props} />;
      case 'wardrobe': return <Wardrobe {...props} />;
      case 'dressing-room': return <Wardrobe {...props} />;
      case 'other': return <Chair {...props} />;
      default: return <Bed {...props} />;
    }
  };

  return (
    <div className={styles.container}>
      
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
            <h2 className={styles.sectionTitle}>{t('createOrder.furnitureTypes.title')}</h2>
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

          {/* Подтип мебели */}
          {furnitureSubTypes[selectedFurniture] && furnitureSubTypes[selectedFurniture].length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('createOrder.configuration.title')}</h2>
              <div className={styles.buttonGroup}>
                {furnitureSubTypes[selectedFurniture].map((subType) => (
                  <button
                    key={subType.value}
                    className={`${styles.optionButton} ${config.subType === subType.value ? styles.active : ''}`}
                    onClick={() => handleConfigChange('subType', subType.value)}
                  >
                    {subType.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Комплектация для спальной гарнитуры */}
          {selectedFurniture === 'bedroom' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('createOrder.bedroomConfig.title')}</h2>
              <div className={styles.extrasList}>
                {bedroomConfigOptions.map((item) => (
                  <label key={item} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={config.configuration?.includes(item)}
                      onChange={() => toggleConfiguration(item)}
                      className={styles.checkbox}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('createOrder.dimensions.title')}</h2>
            <div className={styles.inputGroup}>
              <label className={styles.label}>
                {t('createOrder.dimensions.width')}: {config.width.toFixed(2)} м
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
                {t('createOrder.dimensions.height')}: {config.height.toFixed(2)} м
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
                {t('createOrder.dimensions.depth')}: {config.depth.toFixed(2)} м
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
            <h2 className={styles.sectionTitle}>{t('createOrder.color.title')}</h2>
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
            <h2 className={styles.sectionTitle}>{t('createOrder.material.title')}</h2>
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
              <h2 className={styles.sectionTitle}>{t('createOrder.woodType.title')}</h2>
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
            <h2 className={styles.sectionTitle}>{t('createOrder.finish.title')}</h2>
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
            <h2 className={styles.sectionTitle}>{t('createOrder.hardware.title')}</h2>
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

          {extraOptionsByType[selectedFurniture] && extraOptionsByType[selectedFurniture].length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('createOrder.extras.title')}</h2>
              <div className={styles.extrasList}>
                {extraOptionsByType[selectedFurniture].map((extra) => (
                  <label key={extra} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={config.extras.includes(extra)}
                      onChange={() => toggleExtra(extra)}
                      className={styles.checkbox}
                    />
                    <span>{getExtraTranslation(extra)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('createOrder.quantity.title')}</h2>
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
            <h2 className={styles.sectionTitle}>{t('createOrder.delivery.title')}</h2>
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
                      {delivery.price === 0 ? t('createOrder.delivery.free') : `+${delivery.price.toLocaleString()} ₸`}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {!noAssemblyOption.includes(selectedFurniture) && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('createOrder.assembly.title')}</h2>
              {alwaysRequiresAssembly.includes(selectedFurniture) ? (
                <div style={{ padding: '12px', background: '#edf2f7', borderRadius: '8px', color: '#2d3748' }}>
                  {t('createOrder.assembly.included')}
                </div>
              ) : (
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={config.assemblyRequired}
                    onChange={(e) => handleConfigChange('assemblyRequired', e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>{t('createOrder.assembly.required')}</span>
                </label>
              )}
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('createOrder.warranty.title')}</h2>
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
            <h2 className={styles.sectionTitle}>{t('createOrder.notes.title')}</h2>
            <textarea
              value={config.notes}
              onChange={(e) => handleConfigChange('notes', e.target.value)}
              placeholder={t('createOrder.notes.placeholder')}
              className={styles.notesTextarea}
              rows={4}
            />
          </div>

          {/* Расчет стоимости */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><MdAttachMoney style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {t('createOrder.pricing.title')}</h3>
            <div className={styles.priceBreakdown}>
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>{t('createOrder.pricing.basePrice')}</span>
                <span className={styles.priceValue}>{config.desiredPrice.toLocaleString()} ₸</span>
              </div>
              <div className={styles.priceItem}>
                <span className={styles.priceLabel}>{t('createOrder.pricing.maxBudget')}</span>
                <span className={styles.priceValue}>{config.maxBudget.toLocaleString()} ₸</span>
              </div>
              <div className={styles.priceNote}>
                <MdInfo style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {t('createOrder.pricing.note')}
              </div>
            </div>
          </div>

          {/* Срочность и дедлайн */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}><MdAccessTime style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {t('createOrder.timing.title')}</h3>
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
              <label className={styles.label}>{t('createOrder.timing.deadline')}</label>
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
              <MdTrendingUp style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> {t('createOrder.submit')}
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
