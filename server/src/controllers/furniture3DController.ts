import { Request, Response } from 'express';
import pool from '../config/database';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads/3d-models');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedExtensions = ['.obj', '.mtl', '.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Недопустимый формат файла'));
    }
  }
});

// Получить все 3D модели
export const getAll3DModels = async (req: Request, res: Response) => {
  try {
    const { category, active } = req.query;
    
    let query = 'SELECT * FROM furniture_3d_models WHERE 1=1';
    const params: any[] = [];
    
    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    
    if (active !== undefined) {
      params.push(active === 'true');
      query += ` AND active = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json({ models: result.rows });
  } catch (error) {
    console.error('Error fetching 3D models:', error);
    res.status(500).json({ message: 'Ошибка при получении 3D моделей' });
  }
};

// Получить одну 3D модель
export const get3DModelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM furniture_3d_models WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Модель не найдена' });
    }
    
    res.json({ model: result.rows[0] });
  } catch (error) {
    console.error('Error fetching 3D model:', error);
    res.status(500).json({ message: 'Ошибка при получении модели' });
  }
};

// Создать новую 3D модель
export const create3DModel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      furniture_type,
      base_price
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.objFile || files.objFile.length === 0) {
      return res.status(400).json({ message: 'OBJ файл обязателен' });
    }

    const objFileUrl = `/uploads/3d-models/${files.objFile[0].filename}`;
    let mtlFileUrl = files.mtlFile ? `/uploads/3d-models/${files.mtlFile[0].filename}` : null;
    
    const textureFiles = files.textureFiles ? 
      files.textureFiles.map(f => `/uploads/3d-models/${f.filename}`) : [];
    
    const previewImage = files.previewImage ? 
      `/uploads/3d-models/${files.previewImage[0].filename}` : null;

    // Если есть MTL файл и текстуры, обновить пути в MTL
    if (mtlFileUrl && files.mtlFile && textureFiles.length > 0) {
      try {
        const mtlPath = path.join(__dirname, '../../uploads/3d-models', files.mtlFile[0].filename);
        let mtlContent = fs.readFileSync(mtlPath, 'utf-8');
        
        console.log('Original MTL content:', mtlContent.substring(0, 500));
        
        // Создать карту старых имен файлов к новым
        const textureMap = new Map<string, string>();
        files.textureFiles?.forEach(file => {
          // Извлечь оригинальное имя без пути
          const originalName = file.originalname.split(/[/\\]/).pop() || file.originalname;
          textureMap.set(originalName, file.filename);
          console.log(`Mapping: ${originalName} -> ${file.filename}`);
        });
        
        // Заменить все пути к текстурам в MTL
        // Ищем строки типа: map_Kd textures/Sofa_Diffuse.png или bump textures/Sofa_Normal.png
        textureMap.forEach((newName, oldName) => {
          // Экранируем специальные символы в имени файла
          const escapedOldName = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Заменяем любой путь, заканчивающийся на это имя файла
          // Ищем map_* или bump
          const regex = new RegExp(`((?:map_\\w+|bump)\\s+).*[/\\\\]?${escapedOldName}`, 'gi');
          mtlContent = mtlContent.replace(regex, `$1${newName}`);
        });
        
        console.log('Updated MTL content:', mtlContent.substring(0, 500));
        fs.writeFileSync(mtlPath, mtlContent, 'utf-8');
        console.log('MTL file updated successfully');
      } catch (err) {
        console.error('Error updating MTL file:', err);
      }
    }

    const result = await pool.query(
      `INSERT INTO furniture_3d_models (
        name, description, category, furniture_type, base_price,
        obj_file_url, mtl_file_url, texture_files, preview_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        name, description, category, furniture_type, base_price || 0,
        objFileUrl, mtlFileUrl, JSON.stringify(textureFiles), previewImage
      ]
    );

    res.status(201).json({ 
      message: 'Модель успешно создана',
      model: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating 3D model:', error);
    res.status(500).json({ message: 'Ошибка при создании модели' });
  }
};

// Обновить 3D модель
export const update3DModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      furniture_type,
      style,
      materials,
      price,
      width,
      height,
      depth,
      active
    } = req.body;

    const result = await pool.query(
      `UPDATE furniture_3d_models 
       SET name = $1, description = $2, category = $3, furniture_type = $4,
           style = $5, materials = $6, price = $7, width = $8, height = $9,
           depth = $10, active = $11, updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [name, description, category, furniture_type, style, materials,
       price, width, height, depth, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Модель не найдена' });
    }

    res.json({ 
      message: 'Модель успешно обновлена',
      model: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating 3D model:', error);
    res.status(500).json({ message: 'Ошибка при обновлении модели' });
  }
};

// Удалить 3D модель
export const delete3DModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Получаем информацию о файлах перед удалением
    const modelResult = await pool.query(
      'SELECT obj_file_url, mtl_file_url, texture_files FROM furniture_3d_models WHERE id = $1',
      [id]
    );

    if (modelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Модель не найдена' });
    }

    const model = modelResult.rows[0];
    
    // Удаляем файлы
    const uploadDir = path.join(__dirname, '../../uploads/3d-models');
    
    try {
      if (model.obj_file_url) {
        const objPath = path.join(uploadDir, path.basename(model.obj_file_url));
        if (fs.existsSync(objPath)) fs.unlinkSync(objPath);
      }
      
      if (model.mtl_file_url) {
        const mtlPath = path.join(uploadDir, path.basename(model.mtl_file_url));
        if (fs.existsSync(mtlPath)) fs.unlinkSync(mtlPath);
      }
      
      if (model.texture_files) {
        try {
          const textures = typeof model.texture_files === 'string' 
            ? JSON.parse(model.texture_files) 
            : model.texture_files;
          
          if (Array.isArray(textures)) {
            textures.forEach((texture: string) => {
              const texturePath = path.join(uploadDir, path.basename(texture));
              if (fs.existsSync(texturePath)) fs.unlinkSync(texturePath);
            });
          }
        } catch (jsonError) {
          console.error('Error parsing texture_files:', jsonError);
        }
      }

      if (model.preview_image) {
        const previewPath = path.join(uploadDir, path.basename(model.preview_image));
        if (fs.existsSync(previewPath)) fs.unlinkSync(previewPath);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
    }

    // Удаляем запись из БД
    await pool.query('DELETE FROM furniture_3d_models WHERE id = $1', [id]);

    res.json({ message: 'Модель успешно удалена' });
  } catch (error) {
    console.error('Error deleting 3D model:', error);
    res.status(500).json({ message: 'Ошибка при удалении модели' });
  }
};

// Обновить настройки вида для 3D модели
export const updateViewSettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { view_settings } = req.body;

    const result = await pool.query(
      'UPDATE furniture_3d_models SET view_settings = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [JSON.stringify(view_settings), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Модель не найдена' });
    }

    res.json({ 
      message: 'Настройки вида сохранены', 
      model: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating view settings:', error);
    res.status(500).json({ message: 'Ошибка при сохранении настроек вида' });
  }
};
