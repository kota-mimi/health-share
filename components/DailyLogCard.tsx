import React, { useRef } from 'react';
import { DailyLogData, ThemeColor, LayoutConfig, FontStyleId } from '../types';
import { StatBar } from './StatBar';
import { TrendingDown, TrendingUp, Minus, Lock } from 'lucide-react';
import Draggable from 'react-draggable';

interface DailyLogCardProps {
  data: DailyLogData;
  theme: ThemeColor;
  id?: string;
  isJapanese?: boolean;
  numericDate?: boolean;
  hideWeight?: boolean;
  bgClass?: string;
  isDarkMode?: boolean;
  customImage?: string | null;
  overlayOpacity?: number;
  layoutConfig?: LayoutConfig;
  onLayoutChange?: (x: number, y: number) => void;
  isEditing?: boolean;
  globalScale?: number;
  fontStyle?: FontStyleId;
  numberColor?: string;
  showReflection?: boolean;
  reflectionAnswer?: string;
  customReflectionText?: string;
}

const TEXT = {
  en: {
    date: 'Date',
    status: 'Status',
    logged: 'Logged',
    weight: 'Weight',
    intake: 'Intake',
    macroTitle: 'Macro Balance',
    protein: 'Protein',
    fat: 'Fat',
    carbs: 'Carbs',
    minutes: 'Minutes',
    burned: 'Burned',
    hidden: 'Food details hidden',
    powered: 'POWERED BY AI'
  },
  ja: {
    date: '日付',
    status: '状況',
    logged: '記録済',
    weight: '体重',
    intake: '摂取カロリー',
    macroTitle: 'PFCバランス',
    protein: 'タンパク質 (P)',
    fat: '脂質 (F)',
    carbs: '炭水化物 (C)',
    minutes: '運動時間',
    burned: '消費カロリー',
    hidden: '食事内容は非表示',
    powered: 'AIによる解析'
  }
};

export const DailyLogCard: React.FC<DailyLogCardProps> = ({ 
  data, 
  theme, 
  id,
  isJapanese = false,
  numericDate = false,
  hideWeight = false,
  bgClass = 'bg-zinc-950',
  isDarkMode = true,
  customImage = null,
  overlayOpacity = 0.5,
  layoutConfig = { x: 0, y: 0 },
  onLayoutChange,
  isEditing = false,
  globalScale = 1,
  fontStyle = 'standard',
  numberColor = 'auto',
  showReflection = false,
  reflectionAnswer = '',
  customReflectionText = ''
}) => {
  const t = isJapanese ? TEXT.ja : TEXT.en;
  const contentRef = useRef<HTMLDivElement>(null);

  // Font class switching
  const getFontClasses = () => {
    switch (fontStyle) {
      case 'sketch': 
        return { label: 'font-hand font-bold tracking-[0.1em]', val: 'font-hand' };
      case 'marker': 
        return { label: 'font-marker font-bold tracking-[0.05em]', val: 'font-marker' };
      case 'pen': 
        return { label: 'font-pen font-bold tracking-[0.05em]', val: 'font-pen' };
      case 'novel': 
        return { label: 'font-serif font-bold tracking-[0.2em]', val: 'font-serif' };
      case 'pixel': 
        return { label: 'font-pixel tracking-[0.1em]', val: 'font-pixel' };
      case 'cute': 
        return { label: 'font-cute tracking-[0.05em]', val: 'font-cute' };
      case 'elegant': 
        return { label: 'font-elegant font-bold tracking-[0.15em]', val: 'font-elegant' };
      case 'standard':
      default: 
        return { label: 'font-sans font-bold tracking-[0.2em]', val: 'font-mono' };
    }
  };
  
  const fonts = getFontClasses();

  // Reflection answers mapping
  const REFLECTION_ANSWERS = [
    { id: 'yes-absolutely', text: 'Yes, absolutely! ⭐', emoji: '⭐' },
    { id: 'pretty-good', text: 'Pretty good! 😊', emoji: '😊' },
    { id: 'it-was-okay', text: 'It was okay 😐', emoji: '😐' },
    { id: 'amazing-day', text: 'Amazing day! 🎉', emoji: '🎉' },
    { id: 'not-really', text: 'Not really... 😔', emoji: '😔' },
    { id: 'custom', text: 'カスタム入力...', emoji: '✏️' },
  ];

  // Define styles based on mode (if no custom image)
  const effectiveIsDarkMode = customImage ? true : isDarkMode;
  
  const styles = effectiveIsDarkMode ? {
    textPrimary: 'text-white',
    textSecondary: 'text-white/80',
    textTertiary: 'text-white/20',
    textMuted: 'text-white/70',
    border: 'border-white/10',
    panelBg: 'bg-white/5',
    iconBg: 'bg-white/5',
    footer: 'text-white/60'
  } : {
    textPrimary: 'text-zinc-900',
    textSecondary: 'text-zinc-700',
    textTertiary: 'text-zinc-300',
    textMuted: 'text-zinc-800',
    border: 'border-zinc-200',
    panelBg: 'bg-zinc-50',
    iconBg: 'bg-zinc-100',
    footer: 'text-zinc-400'
  };

  const formatDate = (date: Date) => {
    if (numericDate) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const getWeightDiffIcon = (diff: number) => {
    if (diff < 0) return <TrendingDown size={14} />;
    if (diff > 0) return <TrendingUp size={14} />;
    return <Minus size={14} />;
  };

  const diffColor = data.weight.diff < 0 ? 'text-green-500' : (data.weight.diff > 0 ? 'text-red-500' : styles.textSecondary);

  // Helper to determine text color for numbers
  const numColorClass = numberColor !== 'auto' ? numberColor : styles.textPrimary;

  return (
    <div 
      id={id}
      className={`w-[300px] h-[480px] sm:w-[375px] sm:h-[640px] ${!customImage ? bgClass : 'bg-black'} relative overflow-hidden flex flex-col select-none shadow-2xl transition-colors duration-500`}
      style={{
        boxShadow: '0 0 50px -12px rgba(0,0,0,0.5)',
        maxWidth: '90vw',
        maxHeight: '85vh'
      }}
    >
      {/* Background Layer (Static) */}
      {customImage ? (
        <>
          <img src={customImage} alt="Background" className="absolute inset-0 w-full h-full object-cover z-0" />
          <div 
            className="absolute inset-0 bg-black z-1 pointer-events-none transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />
        </>
      ) : (
        <>
          <div className={`absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${isDarkMode ? 'from-zinc-800/20' : 'from-zinc-200/40'} via-transparent to-transparent z-0 pointer-events-none`} />
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 blur-[100px] rounded-full pointer-events-none ${theme.replace('text-', 'bg-').split(' ')[0]}`} />
        </>
      )}

      {/* Draggable & Scalable Content Layer (Health Data Only) */}
      <Draggable
        nodeRef={contentRef}
        position={{ x: layoutConfig.x, y: layoutConfig.y }}
        onStop={(_e, data) => onLayoutChange && onLayoutChange(data.x, data.y)}
        disabled={!isEditing}
      >
        <div 
          ref={contentRef}
          className={`absolute top-0 left-0 w-full h-full origin-center transition-transform duration-200 ease-out ${isEditing ? 'cursor-move ring-1 ring-white/20' : ''}`}
        >
          {/* Separate scaling layer */}
          <div 
            className="w-full h-full p-4 sm:p-6"
            style={{
               transform: `scale(${globalScale})`,
               transformOrigin: 'center center'
            }}
          >
          {/* Inner Flex Container */}
          <div className="flex flex-col h-full">
            
            {/* Header */}
            <header className={`flex justify-between items-start mb-4 sm:mb-8 border-b ${styles.border} pb-2 sm:pb-4`}>
              <div className="flex flex-col">
                <span className={`text-[8px] sm:text-[10px] uppercase mb-1 ${fonts.label} ${styles.textSecondary}`}>{t.date}</span>
                <h1 className={`text-2xl sm:text-3xl ${fonts.val} font-bold tracking-tight ${numColorClass}`}>{formatDate(data.date)}</h1>
              </div>
            </header>

            {/* First Row: Weight, Intake, Burned (smaller text) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
              {/* Weight */}
              <div className="flex flex-col">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-[7px] sm:text-[8px] uppercase ${fonts.label} ${styles.textSecondary}`}>{t.weight}</span>
                  </div>
                  
                  {hideWeight ? (
                    <div className="flex items-baseline gap-1">
                      <div className={`text-lg sm:text-2xl ${fonts.val} font-bold tracking-tighter flex items-center h-[24px] sm:h-[32px] ${styles.textTertiary}`}>
                        <span className="text-sm sm:text-lg">●●●</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-lg sm:text-2xl ${fonts.val} font-bold tracking-tighter ${numColorClass}`}>{data.weight.current}</span>
                        <span className={`text-[10px] sm:text-xs font-bold ${fonts.val} ${effectiveIsDarkMode ? 'text-white/60' : 'text-zinc-500'}`}>KG</span>
                      </div>
                      <div className={`flex items-center gap-1 mt-1 text-[10px] ${fonts.val} ${diffColor}`}>
                        {getWeightDiffIcon(data.weight.diff)}
                        <span>{Math.abs(data.weight.diff)} kg</span>
                      </div>
                    </div>
                  )}
                  
                  {hideWeight && (
                    <div className={`flex items-center gap-1 mt-1 text-[9px] ${fonts.val} ${styles.textMuted}`}>
                      <Lock size={10} />
                      <span>PRIVATE</span>
                    </div>
                  )}
                </div>

              {/* Intake Calories */}
              <div className="flex flex-col text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className={`text-[7px] sm:text-[8px] uppercase ${fonts.label} ${styles.textSecondary}`}>{t.intake}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-lg sm:text-2xl ${fonts.val} font-bold tracking-tighter ${numColorClass}`}>{data.calories.current}</span>
                    <div className={`text-[9px] sm:text-[10px] ${fonts.val} ${styles.textSecondary} mt-1`}>
                      <span>/ {data.calories.target} KCAL</span>
                    </div>
                  </div>
                </div>

              {/* Burned Calories */}
              <div className="flex flex-col text-right">
                  <div className="flex items-center justify-end gap-1 mb-1">
                    <span className={`text-[7px] sm:text-[8px] uppercase ${fonts.label} ${styles.textSecondary}`}>{t.burned}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-lg sm:text-2xl ${fonts.val} font-bold tracking-tighter ${numColorClass}`}>{data.exercise.caloriesBurned}</span>
                    <div className={`text-[9px] sm:text-[10px] ${fonts.val} ${styles.textSecondary} mt-1`}>
                      <span>KCAL</span>
                    </div>
                  </div>
                </div>
            </div>

            {/* PFC Visualizer */}
            <div className="mb-4 sm:mb-8">
                <div className="flex justify-between items-end mb-2 sm:mb-4">
                  <span className={`text-[8px] sm:text-[10px] uppercase ${fonts.label} ${styles.textMuted}`}>{t.macroTitle}</span>
                </div>
                <div className="mt-2">
                  <StatBar 
                    label={t.protein}
                    current={data.pfc.p.current} 
                    target={data.pfc.p.target} 
                    unit="g" 
                    colorClass="text-red-500" 
                    isDarkMode={effectiveIsDarkMode}
                    fontStyle={fontStyle}
                    numberColor={numberColor}
                  />
                  <div className="h-4" />
                  <StatBar 
                    label={t.fat} 
                    current={data.pfc.f.current} 
                    target={data.pfc.f.target} 
                    unit="g" 
                    colorClass="text-yellow-400" 
                    isDarkMode={effectiveIsDarkMode}
                    fontStyle={fontStyle}
                    numberColor={numberColor}
                  />
                  <div className="h-4" />
                  <StatBar 
                    label={t.carbs} 
                    current={data.pfc.c.current} 
                    target={data.pfc.c.target} 
                    unit="g" 
                    colorClass="text-green-500" 
                    isDarkMode={effectiveIsDarkMode}
                    fontStyle={fontStyle}
                    numberColor={numberColor}
                  />
                </div>
              </div>

            {/* ヘルシーくん - ひとことがない場合はここに表示 */}
            {!showReflection && (
              <div className="mt-6 sm:mt-8 text-center">
                <span className={`text-[8px] sm:text-[9px] ${fonts.label} font-normal ${styles.textMuted}`}>ヘルシーくん</span>
              </div>
            )}

            {/* Daily Reflection */}
            {showReflection && reflectionAnswer && (
              <div className="mt-6 sm:mt-8">
                <div className="flex justify-between items-end mb-2 sm:mb-3">
                  <span className={`text-[8px] sm:text-[10px] uppercase ${fonts.label} ${styles.textMuted}`}>Did you have a good day?</span>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm sm:text-base ${fonts.val} ${styles.textPrimary}`}>
                    {reflectionAnswer === 'custom' 
                      ? (customReflectionText || 'カスタム入力...') 
                      : REFLECTION_ANSWERS.find(a => a.id === reflectionAnswer)?.text.replace(/[⭐😊😐🎉😔✏️]/g, '').trim()
                    }
                  </span>
                </div>
              </div>
            )}

            {/* ヘルシーくん - ひとことがある場合は一番下に表示 */}
            {showReflection && reflectionAnswer && (
              <div className="mt-4 sm:mt-6 text-center">
                <span className={`text-[8px] sm:text-[9px] ${fonts.label} font-normal ${styles.textMuted}`}>ヘルシーくん</span>
              </div>
            )}

          </div>
          </div>
        </div>
      </Draggable>
    </div>
  );
};