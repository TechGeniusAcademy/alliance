import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MdSend, 
  MdAutoAwesome, 
  MdDownload, 
  MdContentCopy,
  MdDelete,
  MdImage,
  MdRefresh,
  MdChat,
  MdClose,
  MdCalculate,
  MdCheckCircle
} from 'react-icons/md';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import styles from './AIDesigner.module.css';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  imageId?: number;
  timestamp: Date;
  isGenerating?: boolean;
  costAnalysis?: CostAnalysisResult;
}

interface CostAnalysisResult {
  analysis: {
    type: string;
    style: string;
    materials: string[];
    complexity: string;
    estimatedSize: {
      width: number;
      height: number;
      depth: number;
    };
    features: string[];
  };
  costEstimate: {
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
  };
  disclaimer: string;
}

interface Chat {
  id: number;
  order_id: number;
  order_title: string;
  other_user_name: string;
  other_user_role: 'master' | 'customer';
  last_message?: string;
  last_message_at?: string;
}

const AIDesigner = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: t('aiDesigner.welcomeMessage'),
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedImageToSend, setSelectedImageToSend] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [sendingToChat, setSendingToChat] = useState(false);
  const [calculatingCost, setCalculatingCost] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка сохранённых изображений при загрузке компонента
  useEffect(() => {
    const loadSavedImages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/ai/my-images?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.images && response.data.images.length > 0) {
          const savedMessages: Message[] = [
            {
              id: '1',
              type: 'ai',
              content: t('aiDesigner.welcomeMessage'),
              timestamp: new Date(),
            }
          ];

          // Добавляем сохранённые изображения
          response.data.images.reverse().forEach((img: any) => {
            savedMessages.push(
              {
                id: `user-${img.id}`,
                type: 'user',
                content: img.prompt,
                timestamp: new Date(img.created_at),
              },
              {
                id: `ai-${img.id}`,
                type: 'ai',
                content: t('aiDesigner.generatedImage'),
                imageUrl: img.image_url,
                imageId: img.id,
                timestamp: new Date(img.created_at),
              }
            );
          });

          setMessages(savedMessages);
        }
      } catch (error) {
        console.error('Error loading saved images:', error);
      }
    };

    loadSavedImages();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Добавляем сообщение "генерация"
    const generatingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: t('aiDesigner.generating'),
      timestamp: new Date(),
      isGenerating: true,
    };
    setMessages(prev => [...prev, generatingMessage]);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/generate-image`,
        { prompt: inputValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Удаляем сообщение "генерация" и добавляем результат
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== generatingMessage.id);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: t('aiDesigner.generatedImage'),
            imageUrl: response.data.imageUrl,
            imageId: response.data.imageId,
            timestamp: new Date(),
          }
        ];
      });
    } catch (error) {
      console.error('Error generating image:', error);
      
      // Удаляем сообщение "генерация" и показываем ошибку
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== generatingMessage.id);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: axios.isAxiosError(error) && error.response?.data?.message 
              ? error.response.data.message 
              : t('aiDesigner.generationError'),
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `furniture-design-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleCopyPrompt = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleRegenerateImage = async (originalPrompt: string) => {
    setInputValue(originalPrompt);
    inputRef.current?.focus();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: t('aiDesigner.welcomeMessage'),
        timestamp: new Date(),
      }
    ]);
  };

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChats(response.data);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleOpenChatModal = (imageUrl: string) => {
    setSelectedImageToSend(imageUrl);
    setShowChatModal(true);
    loadChats();
  };
  const handleCalculateCost = async (messageId: string, imageUrl: string, prompt: string) => {
    try {
      setCalculatingCost(messageId);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/furniture-cost/analyze-cost`,
        {
          imageUrl,
          prompt
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update message with cost analysis
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, costAnalysis: response.data }
            : msg
        )
      );
    } catch (error) {
      console.error('Error calculating cost:', error);
      alert('Ошибка при расчете стоимости. Попробуйте еще раз.');
    } finally {
      setCalculatingCost(null);
    }
  };
  const handleSendToChat = async (chatId: number) => {
    if (!selectedImageToSend) return;

    try {
      setSendingToChat(true);
      const token = localStorage.getItem('token');
      
      // Отправляем изображение в чат
      await axios.post(
        `${API_BASE_URL}/api/chats/${chatId}/messages`,
        {
          content: t('aiDesigner.sentFromAI'),
          imageUrl: selectedImageToSend,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowChatModal(false);
      setSelectedImageToSend(null);
      
      // Показываем уведомление об успехе
      alert(t('aiDesigner.imageSentSuccess'));
    } catch (error) {
      console.error('Error sending image to chat:', error);
      alert(t('aiDesigner.imageSentError'));
    } finally {
      setSendingToChat(false);
    }
  };

  const examplePrompts = [
    t('aiDesigner.examples.modernSofa'),
    t('aiDesigner.examples.woodenTable'),
    t('aiDesigner.examples.minimalistBed'),
    t('aiDesigner.examples.luxuryChair'),
  ];

  const handleExampleClick = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className={styles.aiDesigner}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>
            <MdAutoAwesome size={32} />
          </div>
          <div>
            <h1 className={styles.title}>{t('aiDesigner.title')}</h1>
            <p className={styles.subtitle}>{t('aiDesigner.subtitle')}</p>
          </div>
        </div>
        <button onClick={handleClearChat} className={styles.clearButton}>
          <MdDelete size={20} />
          {t('aiDesigner.clearChat')}
        </button>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.type === 'user' ? styles.userMessage : styles.aiMessage
              }`}
            >
              <div className={styles.messageAvatar}>
                {message.type === 'user' ? (
                  <div className={styles.userAvatar}>
                    {JSON.parse(localStorage.getItem('user') || '{}').name?.[0]?.toUpperCase() || 'U'}
                  </div>
                ) : (
                  <div className={styles.aiAvatar}>
                    <MdAutoAwesome size={20} />
                  </div>
                )}
              </div>
              
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageSender}>
                    {message.type === 'user' 
                      ? JSON.parse(localStorage.getItem('user') || '{}').name || 'You'
                      : 'AI Designer'}
                  </span>
                  <span className={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                
                <div className={styles.messageText}>{message.content}</div>
                
                {message.isGenerating && (
                  <div className={styles.generatingLoader}>
                    <div className={styles.loaderDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                {message.imageUrl && (
                  <div className={styles.imageContainer}>
                    <img 
                      src={message.imageUrl} 
                      alt="Generated furniture" 
                      className={styles.generatedImage}
                    />
                    <div className={styles.imageActions}>
                      <button 
                        onClick={() => handleDownloadImage(message.imageUrl!)}
                        className={styles.imageActionButton}
                        title={t('aiDesigner.downloadImage')}
                      >
                        <MdDownload size={20} />
                      </button>
                      <button 
                        onClick={() => {
                          const userMessage = messages.find(m => 
                            m.type === 'user' && messages.indexOf(m) < messages.indexOf(message)
                          );
                          handleCalculateCost(message.id, message.imageUrl!, userMessage?.content || '');
                        }}
                        className={`${styles.imageActionButton} ${styles.calculateButton}`}
                        title="Рассчитать стоимость"
                        disabled={calculatingCost === message.id}
                      >
                        {calculatingCost === message.id ? (
                          <span className={styles.spinner}>⏳</span>
                        ) : (
                          <MdCalculate size={20} />
                        )}
                      </button>
                      <button 
                        onClick={() => handleOpenChatModal(message.imageUrl!)}
                        className={styles.imageActionButton}
                        title={t('aiDesigner.sendToChat')}
                      >
                        <MdChat size={20} />
                      </button>
                      <button 
                        onClick={() => handleRegenerateImage(
                          messages.find(m => m.type === 'user' && 
                            messages.indexOf(m) < messages.indexOf(message))?.content || ''
                        )}
                        className={styles.imageActionButton}
                        title={t('aiDesigner.regenerate')}
                      >
                        <MdRefresh size={20} />
                      </button>
                    </div>

                    {message.costAnalysis && (
                      <div className={styles.costAnalysis}>
                        <div className={styles.costHeader}>
                          <MdCheckCircle size={20} />
                          <h4>Расчет стоимости изготовления</h4>
                        </div>

                        <div className={styles.analysisDetails}>
                          <div className={styles.analysisRow}>
                            <span className={styles.label}>Тип:</span>
                            <span className={styles.value}>{message.costAnalysis.analysis.type}</span>
                          </div>
                          <div className={styles.analysisRow}>
                            <span className={styles.label}>Стиль:</span>
                            <span className={styles.value}>{message.costAnalysis.analysis.style}</span>
                          </div>
                          <div className={styles.analysisRow}>
                            <span className={styles.label}>Материалы:</span>
                            <span className={styles.value}>{message.costAnalysis.analysis.materials.join(', ')}</span>
                          </div>
                          <div className={styles.analysisRow}>
                            <span className={styles.label}>Размеры (ШxВxГ):</span>
                            <span className={styles.value}>
                              {message.costAnalysis.analysis.estimatedSize.width} x{' '}
                              {message.costAnalysis.analysis.estimatedSize.height} x{' '}
                              {message.costAnalysis.analysis.estimatedSize.depth} см
                            </span>
                          </div>
                          {message.costAnalysis.analysis.features.length > 0 && (
                            <div className={styles.analysisRow}>
                              <span className={styles.label}>Особенности:</span>
                              <span className={styles.value}>{message.costAnalysis.analysis.features.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        <div className={styles.costBreakdown}>
                          <h5>Стоимость материалов:</h5>
                          <div className={styles.costRow}>
                            <span>Древесина:</span>
                            <span>{message.costAnalysis.costEstimate.materials.wood.toLocaleString()} ₸</span>
                          </div>
                          <div className={styles.costRow}>
                            <span>Ткань/обивка:</span>
                            <span>{message.costAnalysis.costEstimate.materials.fabric.toLocaleString()} ₸</span>
                          </div>
                          <div className={styles.costRow}>
                            <span>Фурнитура:</span>
                            <span>{message.costAnalysis.costEstimate.materials.hardware.toLocaleString()} ₸</span>
                          </div>
                          <div className={styles.costRow}>
                            <span>Отделка:</span>
                            <span>{message.costAnalysis.costEstimate.materials.finishing.toLocaleString()} ₸</span>
                          </div>
                        </div>

                        <div className={styles.costBreakdown}>
                          <h5>Стоимость работ:</h5>
                          <div className={styles.costRow}>
                            <span>Проектирование:</span>
                            <span>{message.costAnalysis.costEstimate.labor.design.toLocaleString()} ₸</span>
                          </div>
                          <div className={styles.costRow}>
                            <span>Столярные работы:</span>
                            <span>{message.costAnalysis.costEstimate.labor.carpentry.toLocaleString()} ₸</span>
                          </div>
                          <div className={styles.costRow}>
                            <span>Сборка:</span>
                            <span>{message.costAnalysis.costEstimate.labor.assembly.toLocaleString()} ₸</span>
                          </div>
                          <div className={styles.costRow}>
                            <span>Финишная отделка:</span>
                            <span>{message.costAnalysis.costEstimate.labor.finishing.toLocaleString()} ₸</span>
                          </div>
                        </div>

                        <div className={styles.totalCost}>
                          <div className={styles.priceRange}>
                            <span className={styles.rangeLabel}>Ориентировочная стоимость:</span>
                            <span className={styles.rangeValue}>
                              {message.costAnalysis.costEstimate.minPrice.toLocaleString()} - {' '}
                              {message.costAnalysis.costEstimate.maxPrice.toLocaleString()} ₸
                            </span>
                          </div>
                          <div className={styles.estimatedTime}>
                            <span>Срок изготовления: {message.costAnalysis.costEstimate.estimatedTime}</span>
                          </div>
                        </div>

                        <div className={styles.disclaimer}>
                          <small>ℹ️ {message.costAnalysis.disclaimer}</small>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {message.type === 'user' && (
                  <button
                    onClick={() => handleCopyPrompt(message.content)}
                    className={styles.copyButton}
                    title={t('aiDesigner.copyPrompt')}
                  >
                    <MdContentCopy size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className={styles.examplesSection}>
            <h3 className={styles.examplesTitle}>{t('aiDesigner.tryExamples')}</h3>
            <div className={styles.examplesGrid}>
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(prompt)}
                  className={styles.exampleCard}
                >
                  <MdImage size={24} />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <div className={styles.inputContainer}>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={t('aiDesigner.inputPlaceholder')}
              className={styles.input}
              rows={1}
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isGenerating}
              className={styles.sendButton}
            >
              <MdSend size={20} />
            </button>
          </div>
          <div className={styles.inputHint}>
            {t('aiDesigner.inputHint')}
          </div>
        </form>
      </div>

      {/* Modal for chat selection */}
      {showChatModal && (
        <div className={styles.modalOverlay} onClick={() => setShowChatModal(false)}>
          <div className={styles.chatModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t('aiDesigner.selectChat')}</h3>
              <button
                className={styles.closeModalButton}
                onClick={() => setShowChatModal(false)}
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {loadingChats ? (
                <div className={styles.loadingChats}>
                  <div className={styles.loader}></div>
                  <p>{t('aiDesigner.loadingChats')}</p>
                </div>
              ) : chats.length === 0 ? (
                <div className={styles.noChats}>
                  <MdChat size={48} style={{ color: '#cbd5e0' }} />
                  <p>{t('aiDesigner.noChats')}</p>
                </div>
              ) : (
                <div className={styles.chatList}>
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      className={styles.chatItem}
                      onClick={() => handleSendToChat(chat.id)}
                      disabled={sendingToChat}
                    >
                      <div className={styles.chatItemContent}>
                        <div className={styles.chatItemHeader}>
                          <span className={styles.chatItemName}>
                            {chat.other_user_name}
                          </span>
                          <span className={styles.chatItemRole}>
                            {chat.other_user_role === 'master' ? t('aiDesigner.master') : t('aiDesigner.client')}
                          </span>
                        </div>
                        <div className={styles.chatItemOrder}>{chat.order_title}</div>
                      </div>
                      <MdSend size={20} className={styles.chatItemIcon} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedImageToSend && (
              <div className={styles.modalPreview}>
                <img
                  src={selectedImageToSend}
                  alt="Preview"
                  className={styles.previewImage}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDesigner;
