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
              current: decodedData.weight || 0,
              diff: decodedData.weightDiff || 0,
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

  // ひとことドロップダウンの外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.reflection-dropdown-container')) {
        setShowReflectionDropdown(false);
      }
    };

    if (showReflectionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showReflectionDropdown]);

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
  const [isSaving, setIsSaving] = useState(false);
  const [isImageReady, setIsImageReady] = useState(false);

  const handleSaveAndShare = async () => {
    // 🔍 詳細デバッグ: 呼び出し回数をカウント
    const callCount = (window as any).saveCallCount = ((window as any).saveCallCount || 0) + 1;
    console.log(`🚨 handleSaveAndShare呼び出し #${callCount} - isSaving:`, isSaving);
    
    if (isSaving) {
      console.log('⚠️ 保存処理中のため中断 - 重複実行防止');
      return;
    }
    
    // 🔍 1回目 vs 2回目の状態比較
    const cardElementForDebug = document.getElementById('daily-log-card');
    if (cardElementForDebug) {
      const bgStyle = window.getComputedStyle(cardElementForDebug);
      const backgroundImage = bgStyle.backgroundImage;
      console.log(`🎯 #${callCount} DOM状態チェック:`, {
        customImageState: customImage,
        customImageType: typeof customImage,
        customImageLength: customImage?.length,
        domBackgroundImage: backgroundImage,
        domBackgroundImageLength: backgroundImage.length,
        hasCustomImageInDOM: backgroundImage !== 'none' && backgroundImage.includes('blob:'),
        stateVsDOMMatch: customImage && backgroundImage.includes('blob:')
      });
      
      // 🔍 より詳細なDOM画像確認
      const imgElements = cardElementForDebug.querySelectorAll('img');
      console.log(`🔍 #${callCount} DOM内img要素:`, {
        imgElementsCount: imgElements.length,
        imgSources: Array.from(imgElements).map(img => ({
          src: img.src.substring(0, 50) + '...',
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        }))
      });
    }
    
    // React stateの更新を待つ
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // React state更新待機
    console.log(`🔒 #${callCount} 保存処理開始 - ロック中`);
    
    // 🚨 重要: DOMスタイル反映の確実な待機（1回目の問題解決）
    if (customImage && callCount === 1) {
      console.log('🔄 1回目: カスタム画像のDOMスタイル反映を確実に待機...');
      
      // DOMスタイルが反映されるまで待機
      let attempts = 0;
      const maxAttempts = 10; // 最大3秒待機
      
      while (attempts < maxAttempts) {
        const checkElement = document.getElementById('daily-log-card');
        if (checkElement) {
          const computedStyle = window.getComputedStyle(checkElement);
          const bgImage = computedStyle.backgroundImage;
          
          if (bgImage !== 'none' && bgImage.includes('blob:')) {
            console.log(`✅ DOMスタイル反映完了 - 試行回数: ${attempts + 1}`);
            break;
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 300)); // 0.3秒ずつ待機
        attempts++;
        console.log(`⏳ DOMスタイル反映待機中... ${attempts}/${maxAttempts}`);
      }
      
      if (attempts >= maxAttempts) {
        console.warn('⚠️ DOMスタイル反映タイムアウト - 強制続行');
      }
    }
    
    // 重要: ボタンイベントの即座実行を防ぐ
    console.log('⏳ 画像処理開始まで待機...');
    const cardElement = cardRef.current;
    if (!cardElement) {
      return;
    }

    // ローディング表示
    const buttonElement = document.querySelector('.save-share-button span');
    const originalText = buttonElement?.textContent || '共有';
    if (buttonElement) {
      buttonElement.textContent = '準備中...';
    }

    try {
      // モバイル検出と設定最適化
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      
      // 高品質画像変換（カスタム画像対応）
      const config = {
        quality: 0.95,
        pixelRatio: isMobile ? 1.5 : 2,
        backgroundColor: customImage ? null : '#ffffff',
        cacheBust: !!customImage,
        // カスタム画像がある場合は寛容な設定
        useCORS: customImage ? false : true,
        allowTaint: customImage ? true : false,
        skipFonts: true,
        timeout: isMobile ? 20000 : 15000,
        // 追加: カスタム画像用の設定
        ...(customImage && {
          filter: (node) => {
            // img要素は必ず含める
            if (node.tagName === 'IMG') return true;
            return true;
          }
        })
      };

      // カスタム画像がある場合の特別処理
      let dataUrl;
      
      // カスタム画像がある場合、画像の完全なロードを待つ
      if (customImage) {
        console.log('📸 カスタム画像検出:', {
          customImageUrl: customImage,
          userAgent: navigator.userAgent,
          isMobile: /Mobi|Android/i.test(navigator.userAgent)
        });
        
        await new Promise((resolve) => {
          const img = cardElement.querySelector('img');
          console.log('🖼️ 画像要素確認:', {
            imgElement: img,
            imgSrc: img?.src,
            imgComplete: img?.complete,
            imgNaturalWidth: img?.naturalWidth,
            imgNaturalHeight: img?.naturalHeight,
            computedStyle: img ? window.getComputedStyle(img).display : 'none'
          });
          
          if (img) {
            if (img.complete && img.naturalWidth > 0) {
              console.log('✅ 画像既読み込み済み - さらなる描画確認中');
              // 追加: 描画完了まで確実に待機
              setTimeout(() => {
                console.log('✅ 画像描画完了確認');
                resolve(true);
              }, 500); // 0.5秒の描画待機
            } else {
              img.onload = () => {
                console.log('✅ 画像onload完了');
                resolve(true);
              };
              img.onerror = (e) => {
                console.error('❌ 画像読み込みエラー:', e);
                resolve(true);
              };
              // 携帯用に待機時間延長
              setTimeout(() => {
                console.warn('⏰ 画像読み込みタイムアウト');
                resolve(true);
              }, 5000);
            }
          } else {
            console.warn('⚠️ img要素が見つからない');
            resolve(true);
          }
        });
        console.log('✅ 画像ロード完了');
      }
      
      // DOM更新完了を確実に待機
      console.log('⏳ DOM更新完了待機中...');
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            console.log('✅ DOM更新完了');
            resolve(true);
          });
        });
      });
      
      try {
        console.log('🔄 画像変換開始...', {
          customImage: !!customImage,
          cardElementSize: { width: cardElement.offsetWidth, height: cardElement.offsetHeight },
          config: config
        });
        
        // 🔍 htmlToImage実行直前のDOM最終確認
        console.log(`🎯 #${callCount} htmlToImage実行直前チェック:`, {
          cardElementExists: !!cardElement,
          cardElementVisible: cardElement && cardElement.offsetWidth > 0 && cardElement.offsetHeight > 0,
          cardComputedStyle: cardElement ? window.getComputedStyle(cardElement).backgroundImage : 'none',
          customImageState: customImage,
          hasCustomImageInStyle: cardElement ? window.getComputedStyle(cardElement).backgroundImage.includes('blob:') : false
        });
        
        // 重要: htmlToImageの処理状態確認
        const startTime = Date.now();
        console.log(`🚀 #${callCount} htmlToImage開始 - ${new Date(startTime).toLocaleTimeString()}`);
        dataUrl = await htmlToImage.toPng(cardElement, config);
        const endTime = Date.now();
        console.log(`✅ #${callCount} htmlToImage完了 - ${new Date(endTime).toLocaleTimeString()}`);
        
        console.log('✅ 画像変換成功', {
          processingTime: `${endTime - startTime}ms`,
          dataUrlSize: dataUrl.length,
          dataUrlStart: dataUrl.substring(0, 100)
        });
        
        // 画像データの実際の内容を確認
        if (customImage) {
          console.log(`🔍 #${callCount} カスタム画像の変換結果確認中...`);
          console.log(`🔍 #${callCount} カスタム画像変換前確認:`, {
            htmlToImageProcessingTime: `${endTime - startTime}ms`,
            dataUrlPrefix: dataUrl.substring(0, 100),
            isFirstCall: callCount === 1,
            customImageUrl: customImage.substring(0, 50) + '...'
          });
          
          // 追加：初回処理用のさらなる待機
          console.log(`⏳ #${callCount} 初回カスタム画像処理の安定化待機...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒追加待機
          
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // さらに厳格な確認：画像サイズが妥当か
              if (img.width < 100 || img.height < 100) {
                console.warn('⚠️ 変換画像サイズ異常:', img.width, 'x', img.height);
                setTimeout(() => resolve(true), 500); // 追加待機
                return;
              }
              
              // 重要: 画像の実際の色データを確認
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              // 画像の中央ピクセルを確認
              const centerX = Math.floor(img.width / 2);
              const centerY = Math.floor(img.height / 2);
              const pixelData = ctx.getImageData(centerX, centerY, 1, 1).data;
              
              console.log(`✅ #${callCount} 変換画像確認完了:`, {
                size: `${img.width}x${img.height}`,
                centerPixel: `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3]})`,
                hasCustomBackground: pixelData[3] > 0 && (pixelData[0] !== 255 || pixelData[1] !== 255 || pixelData[2] !== 255),
                isFirstCall: callCount === 1,
                pixelAnalysis: {
                  isWhite: pixelData[0] === 255 && pixelData[1] === 255 && pixelData[2] === 255,
                  isBlack: pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0,
                  hasAlpha: pixelData[3] > 0,
                  rgbSum: pixelData[0] + pixelData[1] + pixelData[2]
                }
              });
              
              // 🚨 1回目と2回目の重要な違いをログ出力
              if (callCount === 1) {
                console.log('🚨 【1回目】画像変換結果 - カスタム背景が含まれているか？', {
                  backgroundDetected: pixelData[3] > 0 && (pixelData[0] !== 255 || pixelData[1] !== 255 || pixelData[2] !== 255),
                  centerRGB: [pixelData[0], pixelData[1], pixelData[2]],
                  alpha: pixelData[3]
                });
              } else if (callCount === 2) {
                console.log('🎉 【2回目】画像変換結果 - カスタム背景が含まれているか？', {
                  backgroundDetected: pixelData[3] > 0 && (pixelData[0] !== 255 || pixelData[1] !== 255 || pixelData[2] !== 255),
                  centerRGB: [pixelData[0], pixelData[1], pixelData[2]],
                  alpha: pixelData[3]
                });
              }
              
              resolve(true);
            };
            img.onerror = () => {
              console.error('❌ 変換画像確認失敗');
              reject(new Error('変換画像の検証に失敗'));
            };
            img.src = dataUrl;
            // タイムアウト延長
            setTimeout(() => {
              console.warn('⏰ 変換画像確認タイムアウト');
              resolve(true);
            }, 5000); // 3秒→5秒に延長
          });
          
          // 追加：変換完了後のさらなる安定化待機
          console.log('⏳ 変換完了後の安定化待機...');
          await new Promise(resolve => setTimeout(resolve, 800)); // 0.8秒追加
        }
      } catch (corsError) {
        console.log('⚠️ 1st試行失敗、フォールバック設定で再試行:', corsError);
        
        // フォールバック: カスタム画像用最寛容設定
        const fallbackConfig = {
          quality: 0.9, // 軽量化
          pixelRatio: 1, // さらに軽量化
          backgroundColor: null,
          cacheBust: true,
          allowTaint: true,
          useCORS: false,
          skipFonts: false,
          timeout: 30000,
          // カスタム画像を強制的に含める
          ...(customImage && {
            preferredFormat: 'png',
            style: {
              // 背景画像を強制表示
              backgroundImage: `url(${customImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }
          })
        };
        
        try {
          dataUrl = await htmlToImage.toPng(cardElement, fallbackConfig);
          console.log('✅ フォールバック変換成功');
          
          // フォールバック画像も確認
          if (customImage) {
            console.log('🔍 フォールバック画像の確認中...');
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = () => {
                console.log('✅ フォールバック画像確認完了:', img.width, 'x', img.height);
                resolve(true);
              };
              img.onerror = () => {
                console.error('❌ フォールバック画像確認失敗');
                reject(new Error('フォールバック画像の検証に失敗'));
              };
              img.src = dataUrl;
              setTimeout(() => {
                console.warn('⏰ フォールバック画像確認タイムアウト');
                resolve(true);
              }, 3000);
            });
          }
        } catch (fallbackError) {
          console.error('❌ フォールバック変換も失敗:', fallbackError);
          throw fallbackError;
        }
      }
      
      // ファイル名生成
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const fileName = `健康記録_${dateStr}.png`;

      // 画像生成完了確認
      if (!dataUrl) {
        throw new Error('画像生成が失敗しました');
      }
      
      console.log('🎯 画像生成完了確認 - Web Share API開始');

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
          
          // 画像Blobの最終確認
          console.log('🔍 最終Blob確認中...');
          const blobUrl = URL.createObjectURL(blob);
          const finalImg = new Image();
          await new Promise((resolve) => {
            finalImg.onload = () => {
              console.log('✅ 最終画像確認完了 - 共有準備OK');
              URL.revokeObjectURL(blobUrl);
              resolve(true);
            };
            finalImg.onerror = () => {
              console.error('❌ 最終画像確認失敗');
              URL.revokeObjectURL(blobUrl);
              resolve(true);
            };
            finalImg.src = blobUrl;
            // 5秒でタイムアウト
            setTimeout(() => {
              console.warn('⏰ 最終画像確認タイムアウト');
              URL.revokeObjectURL(blobUrl);
              resolve(true);
            }, 5000);
          });

          // ファイル共有サポートチェック
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            // 🎯 準備完了 - iOSネイティブ共有を表示
            console.log('🚀 画像準備完了 - iOSネイティブ共有表示');
            await navigator.share({
              title: '健康記録',
              files: [file]
            });
            
            // 共有完了または閉じた場合
            console.log('✅ iOSネイティブ共有完了');
            if (buttonElement) {
              buttonElement.textContent = originalText; // 元に戻す
            }
            return;
          } else {
            // ファイル共有非対応の場合、URLのみで共有を試行
            console.log('📤 URLのみ共有実行');
            await navigator.share({
              title: '健康記録',
              text: '健康データを共有します！',
              url: window.location.href
            });
            
            if (buttonElement) {
              buttonElement.textContent = originalText;
            }
            return;
          }
        } catch (shareError) {
          console.log('共有エラー:', shareError);
          // エラーの場合はフォールバックに進む
        }
      }

      // Web Share API非対応の場合はフォールバック（直接ダウンロード）
      console.log('💾 ダウンロード実行:', {
        fileName,
        dataUrlLength: dataUrl.length,
        dataUrlPrefix: dataUrl.substring(0, 50),
        hasCustomImage: !!customImage
      });
      
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ ダウンロードリンククリック完了');

      if (buttonElement) {
        buttonElement.textContent = originalText; // シンプルに元に戻す
      }
      
    } catch (error) {
      console.error('❌ 共有エラー:', error);
      if (buttonElement) {
        buttonElement.textContent = 'エラー';
        setTimeout(() => {
          buttonElement.textContent = originalText;
        }, 1000);
      }
    } finally {
      setIsSaving(false);
      setIsImageReady(true); // 1回目完了後、画像準備完了状態に
      console.log('🔓 保存処理完了 - ロック解除');
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
                 <div className="absolute top-full left-0 right-0 mt-1 z-50 reflection-dropdown-container">
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
                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className={`save-share-button w-full flex items-center justify-center gap-3 px-4 py-2.5 ${
                isImageReady 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white rounded-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={handleSaveAndShare}
              disabled={isSaving}
            >
              <Download size={16} />
              <span className="font-mono text-xs font-bold">
                {isImageReady ? '画像準備完了' : ui.shareSave}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;