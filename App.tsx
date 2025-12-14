import React, { useState, useRef, useEffect } from 'react';
import { DailyLogCard } from './components/DailyLogCard';
import { DailyLogData, ThemeColor, LayoutConfig, FontStyleId } from './types';
import { Download, Palette, Globe, Calendar, EyeOff, Eye, Moon, Sun, Image as ImageIcon, Move, Maximize2, X, PenTool, Type, Gamepad2, Feather, BookOpen, Edit3, Heart, Sparkles, PaintBucket, Check, MessageSquare, Share } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const MOCK_DATA: DailyLogData = {
  date: new Date(),
  weight: {
    current: 72.4,
    diff: -0.4,
  },
  calories: {
    current: 1850,
    target: 2100,
  },
  pfc: {
    p: { current: 145, target: 160, unit: 'g' },
    f: { current: 48, target: 65, unit: 'g' },
    c: { current: 210, target: 240, unit: 'g' },
  },
  exercise: {
    minutes: 45,
    caloriesBurned: 320,
  },
  achievementRate: 88,
};


const BACKGROUNDS = [
  { name: 'Dark', class: 'bg-zinc-950', isDark: true },
  { name: 'Light', class: 'bg-white', isDark: false },
];

const FONTS: { id: FontStyleId; name: string; icon: React.ReactNode }[] = [
  { id: 'standard', name: 'Digital', icon: <Type size={14}/> },
  { id: 'sketch', name: 'Sketch', icon: <Edit3 size={14}/> },
  { id: 'marker', name: 'Marker', icon: <PenTool size={14}/> },
  { id: 'pen', name: 'Pen', icon: <Feather size={14}/> },
  { id: 'novel', name: 'Novel', icon: <BookOpen size={14}/> },
  { id: 'pixel', name: 'Pixel', icon: <Gamepad2 size={14}/> },
  { id: 'cute', name: 'Cute', icon: <Heart size={14}/> },
  { id: 'elegant', name: 'Elegant', icon: <Sparkles size={14}/> },
];

const NUMBER_COLORS = [
  { id: 'auto', value: 'auto', name: 'Auto', bg: 'bg-zinc-800' }, 
  { id: 'white', value: 'text-white', name: 'White', bg: 'bg-white' },
  { id: 'gray', value: 'text-zinc-400', name: 'Gray', bg: 'bg-zinc-400' },
  { id: 'red', value: 'text-red-500', name: 'Red', bg: 'bg-red-500' },
  { id: 'orange', value: 'text-orange-500', name: 'Orange', bg: 'bg-orange-500' },
  { id: 'yellow', value: 'text-yellow-400', name: 'Yellow', bg: 'bg-yellow-400' },
  { id: 'lime', value: 'text-lime-400', name: 'Lime', bg: 'bg-lime-400' },
  { id: 'green', value: 'text-emerald-500', name: 'Green', bg: 'bg-emerald-500' },
  { id: 'cyan', value: 'text-cyan-400', name: 'Cyan', bg: 'bg-cyan-400' },
  { id: 'blue', value: 'text-blue-500', name: 'Blue', bg: 'bg-blue-500' },
  { id: 'purple', value: 'text-violet-500', name: 'Purple', bg: 'bg-violet-500' },
  { id: 'pink', value: 'text-pink-500', name: 'Pink', bg: 'bg-pink-500' },
];

const REFLECTION_ANSWERS = [
  { id: 'custom', text: 'ひとこと', emoji: '✏️' },
  { id: 'yes-absolutely', text: 'Yes, absolutely! ⭐', emoji: '⭐' },
  { id: 'pretty-good', text: 'Pretty good! 😊', emoji: '😊' },
  { id: 'it-was-okay', text: 'It was okay 😐', emoji: '😐' },
  { id: 'amazing-day', text: 'Amazing day! 🎉', emoji: '🎉' },
  { id: 'not-really', text: 'Not really... 😔', emoji: '😔' },
];

const INITIAL_LAYOUT: LayoutConfig = {
  x: 0, 
  y: 0
};

const UI_TEXT = {
  en: {
    title: 'Daily Summary',
    subtitle: 'Customize your daily report style.',
    fontStyle: 'Font Style',
    numberColor: 'Number Color',
    finishEditing: 'Finish Layout Editing',
    adjustLayout: 'Adjust Layout & Zoom',
    zoomLevel: 'Zoom Level',
    zoomHint: 'Pinch or scroll on the card to zoom all content',
    resetLayout: 'Reset Layout',
    background: 'Background',
    theme: 'Theme',
    upload: 'Upload',
    remove: 'Remove',
    overlayDarkness: 'Overlay Darkness',
    simulate: 'Simulate New Day',
    accentColor: 'Accent Color',
    shareSave: 'Share',
    dragHint: 'Drag • Pinch • Double tap to exit'
  },
  ja: {
    title: 'ヘルシーシェア プロ',
    subtitle: 'プロ仕様の健康データ共有。',
    fontStyle: 'フォントスタイル',
    numberColor: '数字のカラー',
    finishEditing: '編集を完了',
    adjustLayout: 'レイアウト・拡大率の調整',
    zoomLevel: '拡大レベル',
    zoomHint: 'ピンチやホイールで拡大・縮小できます',
    resetLayout: '配置をリセット',
    background: '背景設定',
    theme: 'テーマ',
    upload: '画像追加',
    remove: '削除',
    overlayDarkness: '画像の暗さ',
    accentColor: 'アクセント色',
    shareSave: '共有',
    dragHint: 'ドラッグ • ピンチ • ダブルタップで終了'
  }
};

const App: React.FC = () => {
  const [data, setData] = useState<DailyLogData | null>(null);
  
  // ブラウザ環境でURLパラメータからデータを読み込み
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const secureParam = urlParams.get('secure');
        const timestampParam = urlParams.get('t');
        const userIdParam = urlParams.get('u');
        
        // レガシーサポート（古いdata形式）
        const dataParam = urlParams.get('data');
        
        let decodedData;
        
        if (secureParam && timestampParam && userIdParam) {
          console.log('🔒 Processing secure encrypted data...');
          
          const { decryptData, validateSecureData } = await import('./lib/encryption');
          
          try {
            // セキュアデータを復号化
            const timestamp = parseInt(timestampParam);
            const secureData = await decryptData(decodeURIComponent(secureParam), userIdParam, timestamp);
            
            console.log('🔓 Decrypted secure data:', {
              userId: secureData.userId,
              sessionId: secureData.sessionId,
              expiresAt: new Date(secureData.expiresAt).toISOString()
            });
            
            // データ有効性をチェック
            if (!validateSecureData(secureData)) {
              console.warn('⚠️ 無効または期限切れのデータです - MOCKデータを使用');
              setData(MOCK_DATA);
              return;
            }
            
            // ユーザー分離チェック
            if (secureData.userId !== userIdParam) {
              console.warn('⚠️ ユーザー認証に失敗しました - MOCKデータを使用');
              setData(MOCK_DATA);
              return;
            }
            
            decodedData = secureData.data;
          } catch (decryptError) {
            console.warn('⚠️ 復号化に失敗しました - MOCKデータを使用:', decryptError);
            setData(MOCK_DATA);
            return;
          }
          console.log('📊 Validated secure user data:', decodedData);
          
        } else if (dataParam) {
          console.log('⚠️ Using legacy unsecure data format');
          
          decodedData = JSON.parse(decodeURIComponent(dataParam));
          console.log('📊 Received legacy user data:', decodedData);
        } else {
          console.log('ℹ️ No URL data found, using mock data');
          setData(MOCK_DATA);
          return;
        }
        
        // 共通のデータ変換処理
        if (decodedData) {
          // Validate the decoded data has required properties
          if (typeof decodedData !== 'object' || decodedData === null) {
            console.warn('⚠️ Invalid data format received');
            return;
          }
          
          // useShareRecord.tsの形式に合わせてデータを変換
          const userData: DailyLogData = {
            date: new Date(decodedData.date || new Date()),
            weight: {
              current: parseFloat(decodedData.weight) || 0,
              diff: parseFloat(decodedData.weightDiff) || 0,
            },
            calories: {
              current: parseInt(decodedData.calories) || 0,
              target: parseInt(decodedData.caloriesTarget) || 2100,
            },
            pfc: {
              p: { current: parseFloat(decodedData.protein) || 0, target: 160, unit: 'g' },
              f: { current: parseFloat(decodedData.fat) || 0, target: 65, unit: 'g' },
              c: { current: parseFloat(decodedData.carbs) || 0, target: 240, unit: 'g' },
            },
            exercise: {
              minutes: parseInt(decodedData.exerciseTime) || 0,
              caloriesBurned: parseInt(decodedData.exerciseBurned) || 0,
            },
            achievementRate: parseInt(decodedData.achievementRate) || 0,
          };
          
          console.log('✅ Processed user data:', userData);
          setData(userData);
        }
      } catch (error) {
        console.error('❌ Error parsing URL data:', error);
        console.log('🔄 Falling back to mock data');
        setData(MOCK_DATA);
      }
    };
    
    loadUserData();
    
    // 安全のため3秒後には強制的にローディング停止
    const maxLoadingTimer = setTimeout(() => {
      setIsDataLoading(false);
    }, 3000);
    
    return () => clearTimeout(maxLoadingTimer);
  }, []);

  // ローディング状態を追加
  const [isDataLoading, setIsDataLoading] = useState(true);

  // データ読み込み完了時にローディングを停止（体重・運動データ含む）
  useEffect(() => {
    if (data) {
      // データが設定されたら適切な時間でローディング停止
      setTimeout(() => {
        setIsDataLoading(false);
      }, 1500); // ユーザーが認識できる時間に延長
    } else {
      // データがない場合も一定時間後にはローディング停止（フォールバック）
      const fallbackTimer = setTimeout(() => {
        setIsDataLoading(false);
      }, 3000);
      return () => clearTimeout(fallbackTimer);
    }
  }, [data]);

  const [theme, setTheme] = useState<ThemeColor>('text-emerald-400' as ThemeColor);
  const [bgIndex, setBgIndex] = useState(1);
  const [isJapanese, setIsJapanese] = useState(true);
  const [numericDate, setNumericDate] = useState(false);
  const [hideWeight, setHideWeight] = useState(false);
  const [fontStyle, setFontStyle] = useState<FontStyleId>('standard');
  const [numberColor, setNumberColor] = useState<string>('auto');
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  
  // Daily reflection feature
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionAnswer, setReflectionAnswer] = useState<string>('');
  const [showReflectionDropdown, setShowReflectionDropdown] = useState(false);
  const [customReflectionText, setCustomReflectionText] = useState<string>('');
  
  // Customization State
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  // Enhanced interaction states
  const [interactionMode, setInteractionMode] = useState<'view' | 'edit' | 'customize'>('view');
  const [lastInteraction, setLastInteraction] = useState<number>(Date.now());
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(INITIAL_LAYOUT);
  const [globalScale, setGlobalScale] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Enhanced touch and interaction states
  const touchStartDist = useRef<number | null>(null);
  const startScale = useRef<number>(1);
  const lastTap = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);


  const handleThemeChange = () => {
    if (theme === ThemeColor.EMERALD) setTheme(ThemeColor.CYAN);
    else if (theme === ThemeColor.CYAN) setTheme(ThemeColor.INDIGO);
    else setTheme(ThemeColor.EMERALD);
  };

  const handleBgChange = () => {
    setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Enhanced interaction mode management
  const handleLayoutChange = (x: number, y: number) => {
    setLayoutConfig({ x, y });
    setLastInteraction(Date.now());
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowFontDropdown(false);
      setShowColorDropdown(false);
      setShowReflectionDropdown(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // PointerEventsでpassive制限を回避
  React.useEffect(() => {
    const cardElement = cardRef.current;
    if (!cardElement) return;

    let pointers: Map<number, PointerEvent> = new Map();

    const handlePointerDown = (e: PointerEvent) => {
      if (interactionMode === 'view') {
        enterEditMode();
      }
      
      pointers.set(e.pointerId, e);
      
      if (pointers.size === 2) {
        const [p1, p2] = Array.from(pointers.values());
        const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
        touchStartDist.current = dist;
        startScale.current = globalScale;
      }
      
      // Record pointer for double tap detection
      if (pointers.size === 1) {
        lastTap.current = Date.now();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (pointers.has(e.pointerId)) {
        pointers.set(e.pointerId, e);
      }
      
      if (pointers.size === 2 && touchStartDist.current !== null) {
        const [p1, p2] = Array.from(pointers.values());
        const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
        
        const scaleFactor = dist / touchStartDist.current;
        const rawScale = startScale.current * scaleFactor;
        const newScale = Math.min(5, Math.max(0.2, rawScale));
        
        setGlobalScale(newScale);
        setLastInteraction(Date.now());
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      
      if (pointers.size < 2) {
        touchStartDist.current = null;
      }
      
      // ダブルタップでリセット
      if (pointers.size === 0) {
        const now = Date.now();
        const isQuickTap = now - lastTap.current < 500;
        if (isQuickTap) {
          setGlobalScale(1);
          setLayoutConfig(INITIAL_LAYOUT);
        }
      }
    };

    // PointerEventsはpassive制限がない
    cardElement.addEventListener('pointerdown', handlePointerDown);
    cardElement.addEventListener('pointermove', handlePointerMove);
    cardElement.addEventListener('pointerup', handlePointerUp);

    return () => {
      cardElement.removeEventListener('pointerdown', handlePointerDown);
      cardElement.removeEventListener('pointermove', handlePointerMove);
      cardElement.removeEventListener('pointerup', handlePointerUp);
    };
  }, [interactionMode, globalScale, lastInteraction]);

  // Auto-switch to view mode immediately after interaction ends
  React.useEffect(() => {
    if (interactionMode === 'edit') {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      
      interactionTimeoutRef.current = setTimeout(() => {
        setInteractionMode('view');
      }, 100); // Immediately lock after interaction
      
      return () => {
        if (interactionTimeoutRef.current) {
          clearTimeout(interactionTimeoutRef.current);
        }
      };
    }
  }, [interactionMode, lastInteraction]);

  // Intelligent mode switching
  const enterEditMode = () => {
    setInteractionMode('edit');
    setLastInteraction(Date.now());
  };

  const exitEditMode = () => {
    setInteractionMode('view');
  };

  const handleWheel = (e: React.WheelEvent) => {
    // ホイールでも即座に編集モード & 自由ズーム
    if (interactionMode === 'view') {
      enterEditMode();
    }
    
    e.preventDefault();
    const delta = -e.deltaY * 0.002; // より敏感な操作感
    const newScale = Math.min(5, Math.max(0.2, globalScale + delta)); // 指操作と同じ範囲
    setGlobalScale(newScale);
    setLastInteraction(Date.now());
  };

  // 指でつまんで自由操作システム（写真アプリ風）
  const handleTouchStart = (e: React.TouchEvent) => {
    // 常に編集モードに - 指タッチで即座に操作開始
    if (interactionMode === 'view') {
      enterEditMode();
    }
    
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    
    if (e.touches.length === 2) {
      // 2本指ピンチ - リアルタイムズーム
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      startScale.current = globalScale;
    }
    
    // Record tap time for double tap detection
    const now = Date.now();
    lastTap.current = now;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      e.preventDefault(); // ページスクロール防止
      
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const scaleFactor = dist / touchStartDist.current;
      // スマホアプリ風スムーズスケーリング - 超広範囲対応
      const rawScale = startScale.current * scaleFactor;
      const newScale = Math.min(5, Math.max(0.2, rawScale)); // 0.2倍～5倍まで自由
      
      setGlobalScale(newScale);
      setLastInteraction(Date.now());
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStartDist.current = null;
    }
    
    // ダブルタップでリセット
    if (e.touches.length === 0) {
      const now = Date.now();
      const isQuickTap = now - lastTap.current < 500; // タップ間隔を少し長めに
      if (isQuickTap) {
        setGlobalScale(1);
        setLayoutConfig(INITIAL_LAYOUT);
      }
      touchStartPos.current = null;
    }
  };

  const currentBg = BACKGROUNDS[bgIndex];
  const ui = isJapanese ? UI_TEXT.ja : UI_TEXT.en;
  
  // iOSネイティブ共有機能
  const handleSaveAndShare = async () => {
    const cardElement = cardRef.current;
    if (!cardElement) {
      return;
    }

    // ローディング表示
    const buttonElement = document.querySelector('.save-share-button span');
    const originalText = buttonElement?.textContent || '共有';
    if (buttonElement) {
      buttonElement.textContent = '変換中...';
    }

    try {
      // 高品質画像変換
      const config = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: false
      };

      const dataUrl = await htmlToImage.toPng(cardElement, config);
      
      // ファイル名生成
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const fileName = `健康記録_${dateStr}.png`;

      if (buttonElement) {
        buttonElement.textContent = '共有準備中...';
      }

      // Web Share API対応チェック
      if (navigator.share) {
        try {
          // 画像をBlobに変換
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          // ファイルサイズチェック（10MB未満に制限）
          if (blob.size > 10 * 1024 * 1024) {
            throw new Error('ファイルサイズが大きすぎます');
          }
          
          const file = new File([blob], fileName, { type: 'image/png' });

          // ファイル共有サポートチェック
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            // ネイティブ共有シートを表示
            await navigator.share({
              title: '健康記録',
              files: [file]
            });

            if (buttonElement) {
              buttonElement.textContent = '共有完了！';
              setTimeout(() => {
                buttonElement.textContent = originalText;
              }, 2000);
            }
            return;
          } else {
            // ファイル共有非対応の場合、URLのみで共有を試行
            await navigator.share({
              title: '健康記録',
              text: '健康データを共有します！',
              url: window.location.href
            });
            
            if (buttonElement) {
              buttonElement.textContent = '共有完了！';
              setTimeout(() => {
                buttonElement.textContent = originalText;
              }, 2000);
            }
            return;
          }
        } catch (shareError) {
          console.log('共有エラー:', shareError);
          // エラーの場合はフォールバックに進む
        }
      }

      // Web Share API非対応の場合はフォールバック（直接ダウンロード）
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (buttonElement) {
        buttonElement.textContent = '保存完了！';
        setTimeout(() => {
          buttonElement.textContent = originalText;
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ 共有エラー:', error);
      if (buttonElement) {
        buttonElement.textContent = '共有失敗';
        setTimeout(() => {
          buttonElement.textContent = originalText;
        }, 2000);
      }
    }
  };

  // ローディング画面またはデータなし
  if (isDataLoading || !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-medium">読み込み中</p>
          <p className="text-gray-500 text-sm">データを準備しています...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        
        {/* The Card Component Area */}
        <div 
          ref={cardRef}
          className={`relative group transition-all duration-500 ${
            interactionMode === 'edit' 
              ? 'scale-[1.02] drop-shadow-2xl' 
              : 'hover:scale-[1.01]'
          }`}
          style={{ touchAction: 'none' }}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Professional glow effect */}
          <div className={`absolute -inset-1 bg-gradient-to-r rounded-lg blur transition-all duration-700 ${
            interactionMode === 'edit'
              ? 'from-blue-500/30 to-purple-500/30 opacity-75 animate-pulse'
              : 'from-zinc-700 to-zinc-800 opacity-25 group-hover:opacity-50'
          }`}></div>
          <div className="relative">
             <DailyLogCard 
               data={data} 
               theme={theme} 
               id="share-card" 
               isJapanese={isJapanese}
               numericDate={numericDate}
               hideWeight={hideWeight}
               bgClass={currentBg.class}
               isDarkMode={currentBg.isDark}
               customImage={customImage}
               overlayOpacity={overlayOpacity}
               layoutConfig={layoutConfig}
               onLayoutChange={handleLayoutChange}
               isEditing={interactionMode === 'edit'}
               globalScale={globalScale}
               fontStyle={fontStyle}
               numberColor={numberColor}
               showReflection={showReflection}
               reflectionAnswer={reflectionAnswer}
               customReflectionText={customReflectionText}
             />
          </div>
          {/* Professional interaction indicators */}
          {interactionMode === 'edit' && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none z-50 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                {ui.dragHint}
              </div>
            </div>
          )}
          
        </div>

        {/* Controls / Context Area */}
        <div className="flex flex-col max-w-sm w-full space-y-5 h-[640px] overflow-y-auto pr-2">

          {/* Settings Toggles */}
          <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={handleBgChange}
                disabled={!!customImage}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${!!customImage ? 'opacity-50 cursor-not-allowed border-gray-300 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'}`}
              >
                {currentBg.isDark ? <Moon size={12} /> : <Sun size={12} />}
                <span>テーマ</span>
              </button>
              <div className="relative">
                 <input 
                    type="file" 
                    accept="image/*" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                 />
                 <button 
                    onClick={() => customImage ? setCustomImage(null) : fileInputRef.current?.click()}
                    className={`w-full h-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${customImage ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'}`}
                 >
                    {customImage ? <X size={12} /> : <ImageIcon size={12} />}
                    <span>{customImage ? '削除' : '画像追加'}</span>
                 </button>
              </div>

             <button 
                onClick={() => setIsJapanese(!isJapanese)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${isJapanese ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'}`}
              >
                <Globe size={12} />
                {isJapanese ? "日本語" : "English"}
             </button>

             <button 
                onClick={() => setNumericDate(!numericDate)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${numericDate ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'}`}
              >
                <Calendar size={12} />
                {numericDate ? "11/12" : "11月 12日"}
             </button>

             <button 
                onClick={() => setHideWeight(!hideWeight)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${hideWeight ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'}`}
              >
                {hideWeight ? <EyeOff size={12} /> : <Eye size={12} />}
                {hideWeight ? "非表示" : "体重"}
             </button>

             <div className="relative">
               <button 
                  onClick={() => setShowReflection(!showReflection)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${showReflection ? 'bg-blue-100 border-blue-300 text-blue-900' : 'bg-gray-100 border-gray-300 text-gray-700 hover:text-gray-900'}`}
                >
                  <MessageSquare size={12} />
                  {showReflection ? "ひとこと" : "ひとこと無し"}
               </button>
               {showReflection && (
                 <div className="absolute top-full left-0 right-0 mt-1 z-50">
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       setShowReflectionDropdown(!showReflectionDropdown);
                     }}
                     className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                   >
                     <div className="flex items-center gap-3">
                       <span className="text-sm font-medium text-gray-900">
                         {reflectionAnswer ? (reflectionAnswer === 'custom' ? (customReflectionText || 'ひとこと') : REFLECTION_ANSWERS.find(a => a.id === reflectionAnswer)?.text.replace(/[⭐😊😐🎉😔✏️]/g, '').trim()) : 'ひとことを選択...'}
                       </span>
                     </div>
                     <svg className={`w-4 h-4 text-gray-500 transition-transform ${showReflectionDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                     </svg>
                   </button>
                   {showReflectionDropdown && (
                     <div className="mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                       {REFLECTION_ANSWERS.map(answer => (
                         <button
                           key={answer.id}
                           onClick={() => {
                             setReflectionAnswer(answer.id);
                             // 全ての選択で即座に閉じる
                             setShowReflectionDropdown(false);
                           }}
                           className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${reflectionAnswer === answer.id ? 'bg-blue-50 text-blue-900' : 'text-gray-700'}`}
                         >
                           <span className="text-sm font-medium">{answer.text.replace(/[⭐😊😐🎉😔✏️]/g, '').trim()}</span>
                           {reflectionAnswer === answer.id && (
                             <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                             </svg>
                           )}
                         </button>
                       ))}
                     </div>
                   )}
                 </div>
               )}
               
               {/* カスタム入力フィールド */}
               {showReflection && reflectionAnswer === 'custom' && (
                 <div className="mt-2 p-3 bg-white border border-gray-300 rounded-lg">
                   <input
                     type="text"
                     placeholder="ひとこと (例: 今日は充実していた)"
                     value={customReflectionText}
                     onChange={(e) => setCustomReflectionText(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                     autoFocus
                   />
                 </div>
               )}
             </div>
          </div>

          {/* Font Selector */}
          <div className="space-y-2 relative">
             <h3 className="text-[10px] font-bold uppercase text-zinc-700 tracking-wider px-1">{ui.fontStyle}</h3>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowFontDropdown(!showFontDropdown);
               }}
               className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
             >
               <div className="flex items-center gap-3">
                 {FONTS.find(f => f.id === fontStyle)?.icon}
                 <span className="text-sm font-medium text-gray-900">
                   {FONTS.find(f => f.id === fontStyle)?.name}
                 </span>
               </div>
               <svg className={`w-4 h-4 text-gray-500 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </button>
             {showFontDropdown && (
               <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                 {FONTS.map(font => (
                   <button
                     key={font.id}
                     onClick={() => {
                       setFontStyle(font.id);
                       setShowFontDropdown(false);
                     }}
                     className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${fontStyle === font.id ? 'bg-blue-50 text-blue-900' : 'text-gray-700'}`}
                   >
                     {font.icon}
                     <span className="text-sm font-medium">{font.name}</span>
                     {fontStyle === font.id && (
                       <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                     )}
                   </button>
                 ))}
               </div>
             )}
          </div>

          {/* Number Color Selector */}
          <div className="space-y-2 relative">
             <h3 className="text-[10px] font-bold uppercase text-zinc-700 tracking-wider px-1 flex items-center gap-2">
               <PaintBucket size={12} /> {ui.numberColor}
             </h3>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowColorDropdown(!showColorDropdown);
               }}
               className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
             >
               <div className="flex items-center gap-3">
                 <div className={`w-5 h-5 rounded-full border-2 border-gray-300 ${NUMBER_COLORS.find(c => c.value === numberColor)?.bg || 'bg-gray-200'} flex items-center justify-center`}>
                   {numberColor === 'auto' && <span className="text-[10px] text-zinc-600 font-bold">A</span>}
                 </div>
                 <span className="text-sm font-medium text-gray-900">
                   {NUMBER_COLORS.find(c => c.value === numberColor)?.name || 'Auto'}
                 </span>
               </div>
               <svg className={`w-4 h-4 text-gray-500 transition-transform ${showColorDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
               </svg>
             </button>
             {showColorDropdown && (
               <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                 {NUMBER_COLORS.map(color => (
                   <button
                     key={color.id}
                     onClick={() => {
                       setNumberColor(color.value);
                       setShowColorDropdown(false);
                     }}
                     className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${numberColor === color.value ? 'bg-blue-50 text-blue-900' : 'text-gray-700'}`}
                   >
                     <div className={`w-5 h-5 rounded-full border-2 border-gray-300 ${color.bg} flex items-center justify-center`}>
                       {color.id === 'auto' && <span className="text-[10px] text-zinc-600 font-bold">A</span>}
                     </div>
                     <span className="text-sm font-medium">{color.name}</span>
                     {numberColor === color.value && (
                       <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                     )}
                   </button>
                 ))}
               </div>
             )}
          </div>


          {/* Overlay Controls */}
          {customImage && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-zinc-700">
                <span>{ui.overlayDarkness}</span>
                <span>{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="0.95" 
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="bg-gray-100 p-4 rounded-xl border border-gray-300 shadow-xl space-y-3">


             <button 
              className="save-share-button w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg"
              onClick={handleSaveAndShare}
            >
              <Download size={16} />
              <span className="font-mono text-xs font-bold">{ui.shareSave}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;