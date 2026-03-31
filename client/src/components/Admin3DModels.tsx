import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdDelete, MdEdit, MdClose, MdViewInAr } from 'react-icons/md';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import styles from './Admin3DModels.module.css';

export interface Model3D {
  id: number;
  name: string;
  description: string;
  category: string;
  furniture_type: string;
  base_price: number;
  obj_file_url: string;
  mtl_file_url: string | null;
  texture_files: string[];
  preview_image: string | null;
  active: boolean;
  created_at: string;
  view_settings?: {
    camera_position?: { x: number; y: number; z: number };
    camera_target?: { x: number; y: number; z: number };
    object_position?: { x: number; y: number; z: number };
    object_scale?: number;
    grid_position?: number;
  };
}

export interface ModelParameter {
  id?: number;
  model_id: number;
  parameter_type: string;
  parameter_name: string;
  parameter_value: string;
  price_modifier: number;
  is_default: boolean;
}

interface Admin3DModelsProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Admin3DModels = ({ onShowToast }: Admin3DModelsProps) => {
  const { t } = useTranslation();
  const [models, setModels] = useState<Model3D[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showParametersModal, setShowParametersModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model3D | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [modelParameters, setModelParameters] = useState<ModelParameter[]>([]);
  const viewerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    furniture_type: '',
    base_price: '',
  });

  const [parameterForm, setParameterForm] = useState({
    parameter_type: '',
    parameter_name: '',
    parameter_value: '',
    price_modifier: '',
    is_default: false
  });

  const [files, setFiles] = useState<{
    objFile: File | null;
    mtlFile: File | null;
    textureFiles: File[];
    previewImage: File | null;
  }>({
    objFile: null,
    mtlFile: null,
    textureFiles: [],
    previewImage: null,
  });

  const [cameraCoords, setCameraCoords] = useState({ x: 0, y: 0, z: 0 });
  const [cameraTarget, setCameraTarget] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/furniture-3d', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(Array.isArray(data) ? data : (data.models || []));
    } catch (error) {
      console.error('Error fetching models:', error);
      onShowToast(t('admin.loadError'), 'error');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    if (!e.target.files) return;

    if (fileType === 'textureFiles') {
      const newFiles = Array.from(e.target.files);
      setFiles({
        ...files,
        textureFiles: [...files.textureFiles, ...newFiles]
      });
    } else {
      setFiles({
        ...files,
        [fileType]: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files.objFile) {
      onShowToast(t('admin.objRequired'), 'error');
      return;
    }

    const data = new FormData();
    
    // Add form fields
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    // Add files
    data.append('objFile', files.objFile);
    if (files.mtlFile) data.append('mtlFile', files.mtlFile);
    if (files.previewImage) data.append('previewImage', files.previewImage);
    files.textureFiles.forEach(file => {
      data.append('textureFiles', file);
    });

    try {
      const response = await fetch('http://localhost:5000/api/furniture-3d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });

      if (!response.ok) throw new Error('Failed to upload model');
      
      onShowToast(t('admin.uploadSuccess'), 'success');
      setShowUploadModal(false);
      resetForm();
      fetchModels();
    } catch (error) {
      console.error('Error uploading model:', error);
      onShowToast(t('admin.uploadError'), 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('admin.deleteModel'))) return;

    try {
      const response = await fetch(`http://localhost:5000/api/furniture-3d/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete model');
      
      onShowToast('Модель удалена', 'success');
      fetchModels();
    } catch (error) {
      console.error('Error deleting model:', error);
      onShowToast('Ошибка при удалении модели', 'error');
    }
  };

  const handleSaveViewSettings = async () => {
    if (!selectedModel) return;

    const viewSettings = {
      camera_position: cameraCoords,
      camera_target: cameraTarget,
      grid_position: -50 // Can be made adjustable later
    };

    try {
      const response = await fetch(`http://localhost:5000/api/furniture-3d/${selectedModel.id}/view-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ view_settings: viewSettings })
      });

      if (!response.ok) throw new Error('Failed to save view settings');
      
      onShowToast('Настройки вида сохранены', 'success');
      fetchModels(); // Refresh to get updated data
    } catch (error) {
      console.error('Error saving view settings:', error);
      onShowToast('Ошибка при сохранении настроек', 'error');
    }
  };

  const handlePreview = async (model: Model3D) => {
    setSelectedModel(model);
    setShowPreviewModal(true);

    // Wait for modal to render
    setTimeout(() => {
      renderModel(model);
    }, 100);
  };

  const renderModel = (model: Model3D) => {
    if (!viewerRef.current) {
      console.error('Viewer ref is not available');
      return;
    }

    console.log('Rendering model:', model.name);
    console.log('OBJ URL:', model.obj_file_url);
    console.log('MTL URL:', model.mtl_file_url);

    // Clear previous content
    viewerRef.current.innerHTML = '';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(
      75,
      viewerRef.current.clientWidth / viewerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, -45, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerRef.current.clientWidth, viewerRef.current.clientHeight);
    viewerRef.current.appendChild(renderer.domElement);

    // Add orbit controls for interactive navigation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.enablePan = true;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;

    console.log('Viewer setup complete, canvas added');

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);
    // Add grid helper for better spatial reference - position it below the model
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0xcccccc);
    gridHelper.position.y = model.view_settings?.grid_position ?? -50;
    scene.add(gridHelper);
    
    // Apply saved camera position if exists
    if (model.view_settings?.camera_position) {
      camera.position.set(
        model.view_settings.camera_position.x,
        model.view_settings.camera_position.y,
        model.view_settings.camera_position.z
      );
    }
    
    // Apply saved camera target if exists
    if (model.view_settings?.camera_target) {
      controls.target.set(
        model.view_settings.camera_target.x,
        model.view_settings.camera_target.y,
        model.view_settings.camera_target.z
      );
    }
    // Load model
    const mtlLoader = new MTLLoader();
    const objLoader = new OBJLoader();

    // Установить базовый путь для текстур
    const basePath = `http://localhost:5000/uploads/3d-models/`;
    mtlLoader.setPath(basePath);
    mtlLoader.setResourcePath(basePath);

    const loadObj = () => {
      const objUrl = `http://localhost:5000${model.obj_file_url}`;
      console.log('Loading OBJ from:', objUrl);
      
      objLoader.load(
        objUrl,
        (object) => {
          console.log('OBJ loaded successfully');
          // Center and scale the object
          const box = new THREE.Box3().setFromObject(object);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 4 / maxDim;
          
          object.position.sub(center);
          object.scale.multiplyScalar(scale);
          
          // Apply saved object settings if exists
          if (model.view_settings?.object_position) {
            object.position.set(
              model.view_settings.object_position.x,
              model.view_settings.object_position.y,
              model.view_settings.object_position.z
            );
          }
          
          if (model.view_settings?.object_scale) {
            object.scale.setScalar(model.view_settings.object_scale);
          }
          
          scene.add(object);
          console.log('Object added to scene, size:', size, 'scale:', scale);
          
          // Adjust camera position based on object size - bring it closer
          if (!model.view_settings?.camera_position) {
            camera.position.z = 6;
            camera.lookAt(0, 0, 0);
          }
        },
        (progress) => {
          console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        },
        (error) => {
          console.error('Error loading OBJ:', error);
          onShowToast('Ошибка загрузки модели', 'error');
        }
      );
    };

    if (model.mtl_file_url) {
      // Извлечь имя файла из полного пути
      const mtlFileName = model.mtl_file_url.split('/').pop();
      console.log('Loading MTL:', mtlFileName, 'from base path:', basePath);
      
      mtlLoader.load(
        mtlFileName || model.mtl_file_url,
        (materials) => {
          console.log('MTL loaded successfully');
          materials.preload();
          objLoader.setMaterials(materials);
          loadObj();
        },
        (progress) => {
          console.log('MTL loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        },
        (error) => {
          console.error('Error loading MTL:', error);
          console.log('Loading OBJ without materials');
          loadObj(); // Load without materials
        }
      );
    } else {
      console.log('No MTL file, loading OBJ only');
      loadObj();
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Update controls for smooth damping
      controls.update();
      
      // Update camera coordinates display
      setCameraCoords({
        x: parseFloat(camera.position.x.toFixed(2)),
        y: parseFloat(camera.position.y.toFixed(2)),
        z: parseFloat(camera.position.z.toFixed(2))
      });
      setCameraTarget({
        x: parseFloat(controls.target.x.toFixed(2)),
        y: parseFloat(controls.target.y.toFixed(2)),
        z: parseFloat(controls.target.z.toFixed(2))
      });
      
      renderer.render(scene, camera);
    };
    animate();

    // Keyboard controls for FPS-style camera movement
    const moveSpeed = 0.5;
    const handleKeyDown = (event: KeyboardEvent) => {
      // Get camera direction vectors
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);
      
      // Create right vector (perpendicular to direction)
      const right = new THREE.Vector3();
      right.crossVectors(camera.up, direction).normalize();
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          // Move forward in the direction camera is looking
          camera.position.addScaledVector(direction, -moveSpeed);
          controls.target.addScaledVector(direction, -moveSpeed);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          // Move backward
          camera.position.addScaledVector(direction, moveSpeed);
          controls.target.addScaledVector(direction, moveSpeed);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          // Move left (strafe)
          camera.position.addScaledVector(right, moveSpeed);
          controls.target.addScaledVector(right, moveSpeed);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          // Move right (strafe)
          camera.position.addScaledVector(right, -moveSpeed);
          controls.target.addScaledVector(right, -moveSpeed);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      window.removeEventListener('keydown', handleKeyDown);
      controls.dispose();
      renderer.dispose();
    };
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      furniture_type: '',
      base_price: '',
    });
    setFiles({
      objFile: null,
      mtlFile: null,
      textureFiles: [],
      previewImage: null,
    });
  };

  const fetchModelParameters = async (modelId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/furniture-3d/${modelId}/parameters`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch parameters');
      const data = await response.json();
      setModelParameters(data);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      onShowToast('Ошибка загрузки параметров', 'error');
    }
  };

  const handleAddParameter = async () => {
    if (!selectedModel) return;

    try {
      const response = await fetch('http://localhost:5000/api/furniture-3d/parameters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          model_id: selectedModel.id,
          ...parameterForm,
          price_modifier: parseFloat(parameterForm.price_modifier) || 0
        })
      });

      if (!response.ok) throw new Error('Failed to add parameter');
      
      onShowToast('Параметр добавлен', 'success');
      setParameterForm({
        parameter_type: '',
        parameter_name: '',
        parameter_value: '',
        price_modifier: '',
        is_default: false
      });
      fetchModelParameters(selectedModel.id);
    } catch (error) {
      console.error('Error adding parameter:', error);
      onShowToast('Ошибка добавления параметра', 'error');
    }
  };

  const handleDeleteParameter = async (parameterId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/furniture-3d/parameters/${parameterId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete parameter');
      
      onShowToast('Параметр удалён', 'success');
      if (selectedModel) {
        fetchModelParameters(selectedModel.id);
      }
    } catch (error) {
      console.error('Error deleting parameter:', error);
      onShowToast('Ошибка удаления параметра', 'error');
    }
  };

  const handleManageParameters = (model: Model3D) => {
    setSelectedModel(model);
    setShowParametersModal(true);
    fetchModelParameters(model.id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{t('admin.models3d')}</h1>
        <button className={styles.addButton} onClick={() => setShowUploadModal(true)}>
          <MdAdd /> {t('admin.uploadModel')}
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{models.length}</div>
          <div className={styles.statLabel}>{t('admin.totalModels')}</div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
      ) : models.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <MdViewInAr style={{ fontSize: '4rem', marginBottom: '1rem' }} />
          <p>Нет загруженных 3D моделей. Загрузите первую модель!</p>
        </div>
      ) : (
        <div className={styles.modelsGrid}>
          {models.map(model => (
            <div key={model.id} className={styles.modelCard}>
              <div className={styles.modelPreview}>
                {model.preview_image ? (
                  <img src={`http://localhost:5000${model.preview_image}`} alt={model.name} />
                ) : (
                  <div className={styles.noPreview}>
                    <MdViewInAr />
                  </div>
                )}
              </div>
              <div className={styles.modelInfo}>
                <h3>{model.name}</h3>
                <p className={styles.modelCategory}>{model.category}</p>
                <p className={styles.modelPrice}>Базовая: {model.base_price} ₸</p>
              </div>
              <div className={styles.modelActions}>
                <button 
                  className={styles.previewButton}
                  onClick={() => handlePreview(model)}
                  title={t('admin.preview')}
                >
                  {t('admin.preview')}
                </button>
                <button 
                  className={styles.parametersButton}
                  onClick={() => handleManageParameters(model)}
                  title="Управление параметрами"
                >
                  <MdEdit />
                </button>
                <button 
                  className={styles.deleteButton}
                  onClick={() => handleDelete(model.id)}
                  title={t('admin.deleteModel')}
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{t('admin.uploadModel')}</h2>
              <button className={styles.closeButton} onClick={() => setShowUploadModal(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t('admin.modelName')}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Базовая цена (₸)</label>
                  <input
                    type="number"
                    name="base_price"
                    value={formData.base_price}
                    onChange={handleInputChange}
                    required
                    placeholder="Базовая цена без параметров"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>{t('admin.modelDescription')}</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Описание 3D шаблона мебели"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t('admin.modelCategory')}</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    <option value="kitchen">Кухня</option>
                    <option value="bedroom">Спальня</option>
                    <option value="living_room">Гостиная</option>
                    <option value="office">Офис</option>
                    <option value="dining">Столовая</option>
                    <option value="bathroom">Ванная</option>
                    <option value="children">Детская</option>
                    <option value="hallway">Прихожая</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>{t('createOrder.furnitureType')}</label>
                  <input
                    type="text"
                    name="furniture_type"
                    value={formData.furniture_type}
                    onChange={handleInputChange}
                    placeholder="Шкаф, стол, стул..."
                  />
                </div>
              </div>

              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                💡 После создания модели добавьте параметры (материалы, размеры, стили) с ценами через кнопку управления параметрами
              </p>

              <div className={styles.fileSection}>
                <h3>Файлы 3D модели</h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.fileLabel}>
                    {t('admin.objFile')} *
                    <input
                      type="file"
                      accept=".obj"
                      onChange={(e) => handleFileChange(e, 'objFile')}
                      required
                    />
                    <span className={styles.fileButton}>
                      {files.objFile ? files.objFile.name : t('admin.selectObjFile')}
                    </span>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fileLabel}>
                    {t('admin.mtlFile')}
                    <input
                      type="file"
                      accept=".mtl"
                      onChange={(e) => handleFileChange(e, 'mtlFile')}
                    />
                    <span className={styles.fileButton}>
                      {files.mtlFile ? files.mtlFile.name : t('admin.selectMtlFile')}
                    </span>
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fileLabel}>
                    {t('admin.textureFiles')}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif"
                      multiple
                      onChange={(e) => handleFileChange(e, 'textureFiles')}
                    />
                    <span className={styles.fileButton}>
                      {files.textureFiles.length > 0 
                        ? `${files.textureFiles.length} файлов выбрано` 
                        : 'Выбрать текстуры'}
                    </span>
                  </label>
                  {files.textureFiles.length > 0 && (
                    <div className={styles.fileList}>
                      {files.textureFiles.map((file, index) => (
                        <span key={index} className={styles.fileName}>{file.name}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.fileLabel}>
                    Превью изображение
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, 'previewImage')}
                    />
                    <span className={styles.fileButton}>
                      {files.previewImage ? files.previewImage.name : 'Выбрать превью'}
                    </span>
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowUploadModal(false)}>
                  Отмена
                </button>
                <button type="submit" className={styles.submitButton}>
                  Загрузить модель
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedModel && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '90%', height: '90vh' }}>
            <div className={styles.modalHeader}>
              <h2>{selectedModel.name}</h2>
              <button className={styles.closeButton} onClick={() => setShowPreviewModal(false)}>
                <MdClose />
              </button>
            </div>
            
            {/* Camera Coordinates Display */}
            <div className={styles.coordinatesPanel}>
              <div className={styles.coordSection}>
                <strong>Камера:</strong> X: {cameraCoords.x}, Y: {cameraCoords.y}, Z: {cameraCoords.z}
              </div>
              <div className={styles.coordSection}>
                <strong>Цель:</strong> X: {cameraTarget.x}, Y: {cameraTarget.y}, Z: {cameraTarget.z}
              </div>
              <button 
                className={styles.saveViewButton}
                onClick={handleSaveViewSettings}
              >
                💾 Сохранить настройки вида
              </button>
              <div className={styles.coordHint}>
                Используйте WASD или стрелки для перемещения, мышь для вращения
              </div>
            </div>
            
            <div ref={viewerRef} className={styles.viewer}></div>
          </div>
        </div>
      )}

      {/* Parameters Management Modal */}
      {showParametersModal && selectedModel && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '900px' }}>
            <div className={styles.modalHeader}>
              <h2>Параметры: {selectedModel.name}</h2>
              <button className={styles.closeButton} onClick={() => setShowParametersModal(false)}>
                <MdClose />
              </button>
            </div>
            <div className={styles.parametersContent}>
              <div className={styles.basePrice}>
                <strong>Базовая цена модели:</strong> {selectedModel.base_price} ₸
              </div>

              {/* Add Parameter Form */}
              <div className={styles.addParameterForm}>
                <h3>Добавить параметр</h3>
                <div className={styles.formRow}>
                  <select
                    value={parameterForm.parameter_type}
                    onChange={(e) => setParameterForm({...parameterForm, parameter_type: e.target.value})}
                  >
                    <option value="">Тип параметра</option>
                    <option value="material">Материал</option>
                    <option value="size">Размер</option>
                    <option value="style">Стиль</option>
                    <option value="color">Цвет</option>
                    <option value="finish">Отделка</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Название (например, 'Дуб')"
                    value={parameterForm.parameter_name}
                    onChange={(e) => setParameterForm({...parameterForm, parameter_name: e.target.value})}
                  />
                </div>
                <div className={styles.formRow}>
                  <input
                    type="text"
                    placeholder="Значение (например, '200x100x80')"
                    value={parameterForm.parameter_value}
                    onChange={(e) => setParameterForm({...parameterForm, parameter_value: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Доп. цена (₸)"
                    value={parameterForm.price_modifier}
                    onChange={(e) => setParameterForm({...parameterForm, price_modifier: e.target.value})}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={parameterForm.is_default}
                      onChange={(e) => setParameterForm({...parameterForm, is_default: e.target.checked})}
                    />
                    По умолчанию
                  </label>
                  <button onClick={handleAddParameter} className={styles.addButton}>
                    <MdAdd /> Добавить
                  </button>
                </div>
              </div>

              {/* Parameters List */}
              <div className={styles.parametersList}>
                <h3>Текущие параметры</h3>
                {modelParameters.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>
                    Параметры не добавлены
                  </p>
                ) : (
                  <div className={styles.parametersGrid}>
                    {modelParameters.map(param => (
                      <div key={param.id} className={styles.parameterCard}>
                        <div className={styles.parameterHeader}>
                          <span className={styles.parameterType}>{param.parameter_type}</span>
                          {param.is_default && <span className={styles.defaultBadge}>По умолчанию</span>}
                        </div>
                        <h4>{param.parameter_name}</h4>
                        <p>{param.parameter_value}</p>
                        <div className={styles.parameterFooter}>
                          <span className={styles.parameterPrice}>
                            +{param.price_modifier} ₸
                          </span>
                          <button 
                            onClick={() => handleDeleteParameter(param.id!)}
                            className={styles.deleteButton}
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin3DModels;
