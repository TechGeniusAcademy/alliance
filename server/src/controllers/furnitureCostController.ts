import { Request, Response } from 'express';
import axios from 'axios';

interface FurnitureAnalysis {
  type: string;
  style: string;
  materials: string[];
  complexity: 'simple' | 'medium' | 'complex' | 'luxury';
  estimatedSize: {
    width: number;
    height: number;
    depth: number;
  };
  features: string[];
}

interface CostEstimate {
  materials: {
    wood: number;
    fabric: number;
    hardware: number;
    finishing: number;
  };
  labor: {
    design: number;
    carpentry: number;
    assembly: number;
    finishing: number;
  };
  total: number;
  minPrice: number;
  maxPrice: number;
  estimatedTime: string;
}

export const furnitureCostController = {
  // Analyze furniture image and calculate cost
  async analyzeFurnitureImage(req: Request, res: Response) {
    try {
      const { imageUrl, prompt } = req.body;

      if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
      }

      // Analyze furniture using OpenAI Vision API or custom logic
      const analysis = await analyzeFurnitureFromImage(imageUrl, prompt);
      
      // Calculate cost based on analysis
      const costEstimate = calculateFurnitureCost(analysis);

      res.json({
        success: true,
        analysis,
        costEstimate,
        disclaimer: 'Это приблизительная оценка. Точная стоимость зависит от выбора мастера, материалов и сложности работы.'
      });
    } catch (error: any) {
      console.error('Error analyzing furniture:', error);
      res.status(500).json({ 
        error: 'Ошибка при анализе изображения',
        details: error.message 
      });
    }
  }
};

// Helper function to analyze furniture from image
async function analyzeFurnitureFromImage(imageUrl: string, prompt?: string): Promise<FurnitureAnalysis> {
  const openaiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiKey) {
    throw new Error('OpenAI API ключ не настроен. Невозможно проанализировать изображение без Vision API.');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `ВАЖНО: Внимательно проанализируй изображение мебели и определи ЧТО ИМЕННО изображено на картинке.

Верни детальную информацию СТРОГО в JSON формате (без дополнительного текста):
{
  "type": "точный тип мебели который ты видишь (диван/кресло/стол/стул/кровать/шкаф/тумба/полка/комод и т.д.)",
  "style": "стиль (современный/классический/минимализм/лофт/скандинавский/барокко/модерн и т.д.)",
  "materials": ["массив", "ткань", "кожа", "металл", "стекло", "ДСП" и т.д. - только видимые материалы],
  "complexity": "simple/medium/complex/luxury - оцени сложность изготовления",
  "estimatedSize": {
    "width": реалистичная ширина в см,
    "height": реалистичная высота в см,
    "depth": реалистичная глубина в см
  },
  "features": ["конкретные особенности: мягкая обивка, резные элементы, выдвижные ящики, регулируемые ножки и т.д."]
}

Будь точным - определи РЕАЛЬНЫЙ тип мебели на изображении, не полагайся на текстовое описание.
Если изображение нечеткое или непонятное - укажи "неопределенная мебель" в поле type.`
              },
              {
                type: 'image_url',
                image_url: { 
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 600,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('AI Analysis Response:', content);
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return analysis;
    } else {
      throw new Error('Не удалось получить структурированный ответ от AI');
    }
  } catch (error: any) {
    console.error('Error in AI analysis:', error.response?.data || error.message);
    if (error.message.includes('API ключ')) {
      throw error;
    }
    throw new Error('Ошибка при анализе изображения через AI. Проверьте корректность изображения.');
  }
}

// Fallback analysis based on prompt text
function analyzeFromPrompt(prompt: string): FurnitureAnalysis {
  const lowerPrompt = prompt.toLowerCase();
  
  // Determine furniture type
  let type = 'мебель';
  if (lowerPrompt.includes('диван') || lowerPrompt.includes('sofa')) type = 'диван';
  else if (lowerPrompt.includes('стол') || lowerPrompt.includes('table')) type = 'стол';
  else if (lowerPrompt.includes('стул') || lowerPrompt.includes('chair')) type = 'стул';
  else if (lowerPrompt.includes('кровать') || lowerPrompt.includes('bed')) type = 'кровать';
  else if (lowerPrompt.includes('шкаф') || lowerPrompt.includes('wardrobe')) type = 'шкаф';
  else if (lowerPrompt.includes('тумб') || lowerPrompt.includes('cabinet')) type = 'тумба';
  else if (lowerPrompt.includes('полк') || lowerPrompt.includes('shelf')) type = 'полка';

  // Determine style
  let style = 'современный';
  if (lowerPrompt.includes('классич') || lowerPrompt.includes('classic')) style = 'классический';
  else if (lowerPrompt.includes('минимал') || lowerPrompt.includes('minimal')) style = 'минимализм';
  else if (lowerPrompt.includes('лофт') || lowerPrompt.includes('loft')) style = 'лофт';
  else if (lowerPrompt.includes('скандинав') || lowerPrompt.includes('scandinavian')) style = 'скандинавский';
  else if (lowerPrompt.includes('luxury') || lowerPrompt.includes('роскош')) style = 'люкс';

  // Determine materials
  const materials: string[] = [];
  if (lowerPrompt.includes('дерев') || lowerPrompt.includes('wood')) materials.push('дерево');
  if (lowerPrompt.includes('ткань') || lowerPrompt.includes('fabric')) materials.push('ткань');
  if (lowerPrompt.includes('кож') || lowerPrompt.includes('leather')) materials.push('кожа');
  if (lowerPrompt.includes('метал') || lowerPrompt.includes('metal')) materials.push('металл');
  if (lowerPrompt.includes('стекл') || lowerPrompt.includes('glass')) materials.push('стекло');
  if (materials.length === 0) materials.push('дерево'); // default

  // Determine complexity
  let complexity: FurnitureAnalysis['complexity'] = 'medium';
  if (lowerPrompt.includes('прост') || lowerPrompt.includes('simple')) complexity = 'simple';
  else if (lowerPrompt.includes('сложн') || lowerPrompt.includes('complex')) complexity = 'complex';
  else if (lowerPrompt.includes('luxury') || lowerPrompt.includes('роскош')) complexity = 'luxury';

  // Estimate size based on furniture type
  const estimatedSize = getSizeByType(type);

  // Extract features
  const features: string[] = [];
  if (lowerPrompt.includes('обив') || lowerPrompt.includes('upholster')) features.push('мягкая обивка');
  if (lowerPrompt.includes('резьб') || lowerPrompt.includes('carv')) features.push('резьба по дереву');
  if (lowerPrompt.includes('механизм') || lowerPrompt.includes('mechanism')) features.push('механизмы');
  if (lowerPrompt.includes('ящик') || lowerPrompt.includes('drawer')) features.push('ящики для хранения');
  if (lowerPrompt.includes('полк') || lowerPrompt.includes('shelf')) features.push('полки');

  return {
    type,
    style,
    materials,
    complexity,
    estimatedSize,
    features
  };
}

function getSizeByType(type: string): { width: number; height: number; depth: number } {
  const sizes: Record<string, { width: number; height: number; depth: number }> = {
    'диван': { width: 200, height: 85, depth: 90 },
    'стол': { width: 180, height: 75, depth: 90 },
    'стул': { width: 45, height: 90, depth: 50 },
    'кровать': { width: 160, height: 100, depth: 200 },
    'шкаф': { width: 180, height: 220, depth: 60 },
    'тумба': { width: 60, height: 75, depth: 40 },
    'полка': { width: 120, height: 180, depth: 30 },
  };
  return sizes[type] || { width: 100, height: 100, depth: 50 };
}

function calculateFurnitureCost(analysis: FurnitureAnalysis): CostEstimate {
  const { type, materials, complexity, estimatedSize, features } = analysis;

  // Base material costs (тенге за единицу)
  const materialRates = {
    wood: 50000, // за кубометр высококачественного дерева
    fabric: 15000, // за квадратный метр ткани
    leather: 45000, // за квадратный метр кожи
    hardware: 20000, // фурнитура
    finishing: 15000, // лакокрасочные материалы
  };

  // Calculate volume in cubic meters
  const volume = (estimatedSize.width * estimatedSize.height * estimatedSize.depth) / 1000000;

  // Material costs
  let woodCost = 0;
  let fabricCost = 0;
  let hardwareCost = 10000; // базовая фурнитура
  let finishingCost = 8000; // базовая отделка

  if (materials.includes('дерево')) {
    woodCost = volume * materialRates.wood * 1.5; // с запасом
  }

  if (materials.includes('ткань') || materials.includes('кожа')) {
    const surfaceArea = (estimatedSize.width * estimatedSize.height + 
                        estimatedSize.width * estimatedSize.depth + 
                        estimatedSize.height * estimatedSize.depth) * 2 / 10000;
    
    if (materials.includes('кожа')) {
      fabricCost = surfaceArea * materialRates.leather;
    } else {
      fabricCost = surfaceArea * materialRates.fabric;
    }
  }

  // Adjust for complexity
  const complexityMultiplier = {
    simple: 1.0,
    medium: 1.3,
    complex: 1.7,
    luxury: 2.5
  };

  const multiplier = complexityMultiplier[complexity];
  
  woodCost *= multiplier;
  fabricCost *= multiplier;
  hardwareCost *= multiplier;
  finishingCost *= multiplier;

  // Add costs for special features
  features.forEach(feature => {
    if (feature.includes('резьба')) {
      woodCost *= 1.4;
      finishingCost += 15000;
    }
    if (feature.includes('механизм')) {
      hardwareCost += 25000;
    }
    if (feature.includes('ящик')) {
      hardwareCost += 10000;
    }
  });

  const totalMaterials = woodCost + fabricCost + hardwareCost + finishingCost;

  // Labor costs (обычно 60-80% от стоимости материалов)
  const laborRate = 0.7;
  const designCost = totalMaterials * 0.15;
  const carpentryCost = totalMaterials * 0.35;
  const assemblyCost = totalMaterials * 0.15;
  const finishingLaborCost = totalMaterials * 0.05;

  const totalLabor = designCost + carpentryCost + assemblyCost + finishingLaborCost;
  const total = totalMaterials + totalLabor;

  // Calculate price range (±20%)
  const minPrice = Math.round(total * 0.8);
  const maxPrice = Math.round(total * 1.2);

  // Estimate time
  const timeEstimate = complexity === 'simple' ? '5-7 дней' :
                      complexity === 'medium' ? '10-14 дней' :
                      complexity === 'complex' ? '20-30 дней' :
                      '30-45 дней';

  return {
    materials: {
      wood: Math.round(woodCost),
      fabric: Math.round(fabricCost),
      hardware: Math.round(hardwareCost),
      finishing: Math.round(finishingCost)
    },
    labor: {
      design: Math.round(designCost),
      carpentry: Math.round(carpentryCost),
      assembly: Math.round(assemblyCost),
      finishing: Math.round(finishingLaborCost)
    },
    total: Math.round(total),
    minPrice,
    maxPrice,
    estimatedTime: timeEstimate
  };
}
