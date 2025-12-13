import React, { useState, useRef, useEffect } from 'react';
import { DailyLogCard } from './components/DailyLogCard';
import { DailyLogData, ThemeColor, LayoutConfig, FontStyleId } from './types';
import { Download, Palette, Globe, Calendar, EyeOff, Eye, Moon, Sun, Image as ImageIcon, Move, Maximize2, X, PenTool, Type, Gamepad2, Feather, BookOpen, Edit3, Heart, Sparkles, PaintBucket, Check } from 'lucide-react';

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
    shareSave: 'Share / Save',
    dragHint: 'Drag • Pinch • Double tap to exit'
  },
  ja: {
    title: 'ヘルシーシェア プロ',
    subtitle: 'プロ仕様の健康データ共有。ダブルタップで編集開始。',
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
    shareSave: '保存 / 共有',
    dragHint: 'ドラッグ • ピンチ • ダブルタップで終了'
  }
};

const App: React.FC = () => {
  const [data, setData] = useState<DailyLogData>(MOCK_DATA);
  
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
            throw new Error('無効または期限切れのデータです');
          }
          
          // ユーザー分離チェック
          if (secureData.userId !== userIdParam) {
            throw new Error('ユーザー認証に失敗しました');
          }
          
          decodedData = secureData.data;
          console.log('📊 Validated secure user data:', decodedData);
          
        } else if (dataParam) {
          console.log('⚠️ Using legacy unsecure data format');
          
          decodedData = JSON.parse(decodeURIComponent(dataParam));
          console.log('📊 Received legacy user data:', decodedData);
        } else {
          console.log('ℹ️ No URL data found, using mock data');
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
              current: Number(decodedData.weight) || 0,
              diff: Number(decodedData.weightDiff) || 0,
            },
            calories: {
              current: Number(decodedData.calories) || 0,
              target: Number(decodedData.caloriesTarget) || 2100,
            },
            pfc: {
              p: { current: Number(decodedData.protein) || 0, target: 160, unit: 'g' },
              f: { current: Number(decodedData.fat) || 0, target: 65, unit: 'g' },
              c: { current: Number(decodedData.carbs) || 0, target: 240, unit: 'g' },
            },
            exercise: {
              minutes: Number(decodedData.exerciseTime) || 0,
              caloriesBurned: Number(decodedData.exerciseBurned) || 0,
            },
            achievementRate: Number(decodedData.achievementRate) || 0,
          };
          
          console.log('✅ Processed user data:', userData);
          setData(userData);
        }
      } catch (error) {
        console.error('❌ Error parsing URL data:', error);
        console.log('🔄 Falling back to mock data');
        // Don't throw - just continue with mock data
      }
    };
    
    loadUserData();
  }, []);
  const [theme, setTheme] = useState<ThemeColor>('text-emerald-400' as ThemeColor);
  const [bgIndex, setBgIndex] = useState(0);
  const [isJapanese, setIsJapanese] = useState(true);
  const [numericDate, setNumericDate] = useState(false);
  const [hideWeight, setHideWeight] = useState(false);
  const [fontStyle, setFontStyle] = useState<FontStyleId>('standard');
  const [numberColor, setNumberColor] = useState<string>('auto');
  
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

  // Auto-switch to view mode after inactivity (Strava-like)
  React.useEffect(() => {
    if (interactionMode === 'edit') {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
      
      interactionTimeoutRef.current = setTimeout(() => {
        setInteractionMode('view');
      }, 3000); // 3 seconds of inactivity switches to view mode
      
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
    
    // ダブルタップでリセット
    const now = Date.now();
    const isQuickTap = now - lastTap.current < 300;
    if (isQuickTap && e.touches.length === 1) {
      setGlobalScale(1);
      setLayoutConfig(INITIAL_LAYOUT);
    }
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
    
    // Handle tap completion for mode switching (handled in touchStart)
    if (e.touches.length === 0) {
      touchStartPos.current = null;
    }
  };

  const currentBg = BACKGROUNDS[bgIndex];
  const ui = isJapanese ? UI_TEXT.ja : UI_TEXT.en;

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        
        {/* The Card Component Area */}
        <div 
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
             />
          </div>
          {/* Professional interaction indicators */}
          {interactionMode === 'edit' && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none z-50 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                {ui.dragHint}
              </div>
            </div>
          )}
          
          {interactionMode === 'view' && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none z-50">
              {isJapanese ? 'ダブルタップで編集' : 'Double tap to edit'}
            </div>
          )}
        </div>

        {/* Controls / Context Area */}
        <div className="flex flex-col max-w-sm w-full space-y-5 h-[640px] overflow-y-auto pr-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">{ui.title}</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {ui.subtitle}
            </p>
          </div>

          {/* Font Selector */}
          <div className="space-y-2">
             <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-1">{ui.fontStyle}</h3>
             <div className="grid grid-cols-4 gap-2">
                {FONTS.map(font => (
                  <button
                    key={font.id}
                    onClick={() => setFontStyle(font.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${fontStyle === font.id ? 'bg-zinc-100 border-white text-black shadow-lg scale-105 ring-2 ring-blue-500/50' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
                  >
                    <div className="mb-1.5">{font.icon}</div>
                    <span className="text-[9px] font-bold tracking-wide truncate w-full text-center">{font.name}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Number Color Selector (NEW) */}
          <div className="space-y-2">
             <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider px-1 flex items-center gap-2">
               <PaintBucket size={12} /> {ui.numberColor}
             </h3>
             <div className="flex flex-wrap gap-2">
                {NUMBER_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setNumberColor(color.value)}
                    title={color.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center
                      ${numberColor === color.value ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-zinc-800 hover:border-zinc-500'}
                      ${color.bg}
                    `}
                  >
                    {color.id === 'auto' && <span className="text-[8px] text-zinc-400 font-bold">A</span>}
                  </button>
                ))}
             </div>
          </div>

          {/* Touch Gesture Info */}
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Move size={12} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">タッチ操作</span>
            </div>
            <div className="space-y-1 text-[9px] text-zinc-500">
              <p>📱 ピンチ: 拡大・縮小</p>
              <p>👆 ドラッグ: 位置移動</p>
              <p>🔄 ダブルタップ: リセット</p>
            </div>
          </div>

          {/* Settings Toggles */}
          <div className="grid grid-cols-2 gap-2">
             <button 
                onClick={() => setIsJapanese(!isJapanese)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${isJapanese ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                <Globe size={12} />
                {isJapanese ? "日本語" : "English"}
             </button>

             <button 
                onClick={() => setNumericDate(!numericDate)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${numericDate ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                <Calendar size={12} />
                {numericDate ? "11/12" : "NOV 12"}
             </button>

             <button 
                onClick={() => setHideWeight(!hideWeight)}
                className={`col-span-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${hideWeight ? 'bg-zinc-800 border-zinc-600 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              >
                {hideWeight ? <EyeOff size={12} /> : <Eye size={12} />}
                {hideWeight ? "Hidden" : "Weight"}
             </button>
          </div>

          {/* Background Controls */}
           <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-xl space-y-3">
            <h3 className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">{ui.background}</h3>
            
            <div className="flex gap-2">
               <button 
                  onClick={handleBgChange}
                  disabled={!!customImage}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${!!customImage ? 'opacity-50 cursor-not-allowed border-zinc-800 text-zinc-600' : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'}`}
                >
                  {currentBg.isDark ? <Moon size={12} /> : <Sun size={12} />}
                  <span>{ui.theme}</span>
                </button>
                <div className="relative flex-1">
                   <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                   />
                   <button 
                      onClick={() => customImage ? setCustomImage(null) : fileInputRef.current?.click()}
                      className={`w-full h-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${customImage ? 'bg-red-900/30 border-red-800 text-red-400 hover:bg-red-900/50' : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'}`}
                   >
                      {customImage ? <X size={12} /> : <ImageIcon size={12} />}
                      <span>{customImage ? ui.remove : ui.upload}</span>
                   </button>
                </div>
            </div>

            {customImage && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-[10px] text-zinc-400">
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
                  className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
           </div>

          {/* Main Action Buttons */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-xl space-y-3">

            <button 
              onClick={handleThemeChange}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg border border-zinc-700 transition-all duration-200"
            >
              <Palette size={16} className={theme.split(' ')[0]} />
              <span className="font-mono text-xs">{ui.accentColor}</span>
            </button>

            <div className="h-px bg-zinc-800 my-1" />

             <button 
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-zinc-200 text-black rounded-lg transition-all duration-200 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              onClick={() => alert("In a real app, this would use html-to-image to download the card.")}
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