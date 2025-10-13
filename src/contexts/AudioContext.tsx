import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// 脑波类型定义
export type BrainwaveType = 'delta' | 'theta' | 'alpha' | 'beta' | 'gamma';

// 音频类型定义
export type AudioType = 'binaural_beat' | 'isochronic_tone';

// 音频配置接口
export interface AudioConfig {
  type: AudioType;
  brainwaveType: BrainwaveType;
  frequency: number;
  carrierFrequency?: number;
  duration: number;
  volume: number;
  backgroundAudio?: string;
}

// 音频播放状态
export interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLooping: boolean;
}

interface AudioContextType {
  audioState: AudioState;
  currentConfig: AudioConfig | null;
  generateAudio: (config: AudioConfig) => Promise<void>;
  playAudio: () => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  setVolume: (volume: number) => void;
  setLooping: (looping: boolean) => void;
  isGenerating: boolean;
  // 新增动态更新功能
  updateConfig: (newConfig: Partial<AudioConfig>) => Promise<void>;
  switchBackgroundAudio: (backgroundType: string) => Promise<void>;
}

const AudioPlayerContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.5,
    isLooping: false,
  });
  const [currentConfig, setCurrentConfig] = useState<AudioConfig | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Web Audio API 引用
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const isochronicSourceRef = useRef<OscillatorNode | null>(null);
  const isochronicModulatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const backgroundAudioRef = useRef<AudioBufferSourceNode | null>(null);
  const backgroundGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);

  // 初始化音频上下文
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 创建主增益节点
      const masterGain = audioContextRef.current.createGain();
      masterGain.gain.value = 1.0;
      masterGain.connect(audioContextRef.current.destination);
      masterGainRef.current = masterGain;
    }
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    return audioContextRef.current;
  }, []);

  // 停止当前背景音频
  const stopBackgroundAudio = useCallback(() => {
    if (backgroundAudioRef.current) {
      try {
        backgroundAudioRef.current.stop();
      } catch (e) {
        // 音频可能已经停止
      }
      backgroundAudioRef.current = null;
    }
    if (backgroundGainRef.current) {
      backgroundGainRef.current.disconnect();
      backgroundGainRef.current = null;
    }
  }, []);

  // 加载背景音频文件
  const loadBackgroundAudioFile = useCallback(async (audioContext: AudioContext, backgroundType: string): Promise<AudioBuffer | null> => {
    const audioFiles: Record<string, string> = {
      rain: '/audio/rain.mp3',
      ocean: '/audio/ocean.mp3',
      whitenoise: '/audio/whitenoise.wav',
      forest: '/audio/forest.mp3',
      piano: '/audio/piano.wav'
    };

    const filePath = audioFiles[backgroundType];
    if (!filePath) {
      return null;
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load audio file: ${filePath}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error(`加载背景音频文件失败 (${backgroundType}):`, error);
      return null;
    }
  }, []);

  // 生成背景音频
  const generateBackgroundAudio = useCallback(async (audioContext: AudioContext, backgroundType: string) => {
    // 先停止当前背景音频
    stopBackgroundAudio();
    
    if (!backgroundType || backgroundType === 'none') {
      return null;
    }

    // 创建背景音频增益节点
    const backgroundGain = audioContext.createGain();
    backgroundGain.gain.value = 0.3; // 背景音量较低
    backgroundGainRef.current = backgroundGain;

    try {
      // 加载音频文件
      const audioBuffer = await loadBackgroundAudioFile(audioContext, backgroundType);
      
      if (!audioBuffer) {
        console.error(`无法加载背景音频: ${backgroundType}`);
        return null;
      }

      // 创建音频源
      const backgroundSource = audioContext.createBufferSource();
      backgroundSource.buffer = audioBuffer;
      backgroundSource.loop = true; // 循环播放

      if (masterGainRef.current) {
        backgroundSource.connect(backgroundGain);
        backgroundGain.connect(masterGainRef.current);
        backgroundAudioRef.current = backgroundSource;
      }

      return { backgroundSource, backgroundGain };
    } catch (error) {
      console.error('生成背景音频失败:', error);
      return null;
    }
  }, [stopBackgroundAudio, loadBackgroundAudioFile]);



  // 停止所有音频源
  const stopAllAudioSources = useCallback(() => {
    // 停止主音频
    if (leftOscillatorRef.current) {
      try {
        leftOscillatorRef.current.stop();
        rightOscillatorRef.current?.stop();
      } catch (e) {
        // 振荡器可能已经停止
      }
      leftOscillatorRef.current = null;
      rightOscillatorRef.current = null;
    }
    if (isochronicSourceRef.current) {
      try {
        isochronicSourceRef.current.stop();
        isochronicModulatorRef.current?.stop();
      } catch (e) {
        // 振荡器可能已经停止
      }
      isochronicSourceRef.current = null;
      isochronicModulatorRef.current = null;
    }
    
    // 停止背景音频
    stopBackgroundAudio();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    isPlayingRef.current = false;
  }, [stopBackgroundAudio]);

  // 生成双耳节拍
  const generateBinauralBeat = useCallback(async (config: AudioConfig) => {
    const audioContext = await initAudioContext();
    
    // 调用后端API获取音频配置
    const { data, error } = await supabase.functions.invoke('generate-binaural-beat', {
      body: {
        baseFrequency: config.carrierFrequency || 440,
        beatFrequency: config.frequency,
        duration: config.duration,
        amplitude: config.volume
      }
    });

    if (error) {
      throw new Error(`生成双耳节拍失败: ${error.message}`);
    }

    const audioConfig = data.data.audioConfig;
    
    // 创建增益节点
    const gainNode = audioContext.createGain();
    gainNode.gain.value = config.volume;
    gainNodeRef.current = gainNode;
    
    // 左声道振荡器
    const leftOscillator = audioContext.createOscillator();
    leftOscillator.frequency.value = audioConfig.leftFrequency;
    leftOscillator.type = 'sine';
    leftOscillatorRef.current = leftOscillator;
    
    // 右声道振荡器
    const rightOscillator = audioContext.createOscillator();
    rightOscillator.frequency.value = audioConfig.rightFrequency;
    rightOscillator.type = 'sine';
    rightOscillatorRef.current = rightOscillator;
    
    // 创建左右声道分离器和合并器
    const splitter = audioContext.createChannelSplitter(2);
    const merger = audioContext.createChannelMerger(2);
    
    // 连接音频图
    leftOscillator.connect(gainNode);
    rightOscillator.connect(gainNode);
    gainNode.connect(splitter);
    splitter.connect(merger, 0, 0);  // 左声道
    splitter.connect(merger, 1, 1);  // 右声道
    
    if (masterGainRef.current) {
      merger.connect(masterGainRef.current);
    } else {
      merger.connect(audioContext.destination);
    }
    
    return { leftOscillator, rightOscillator, gainNode };
  }, [initAudioContext]);

  // 生成等时音
  const generateIsochronicTone = useCallback(async (config: AudioConfig) => {
    const audioContext = await initAudioContext();
    
    // 调用后端API获取音频配置
    const { data, error } = await supabase.functions.invoke('generate-isochronic-tone', {
      body: {
        carrierFrequency: config.carrierFrequency || 440,
        pulseRate: config.frequency,
        duration: config.duration,
        amplitude: config.volume,
        modulationDepth: 0.8
      }
    });

    if (error) {
      throw new Error(`生成等时音失败: ${error.message}`);
    }

    const audioConfig = data.data.audioConfig;
    
    // 创建载波振荡器
    const carrierOscillator = audioContext.createOscillator();
    carrierOscillator.frequency.value = audioConfig.carrierFrequency;
    carrierOscillator.type = 'sine';
    
    // 创建调制振荡器（用于幅度调制）
    const modulatorOscillator = audioContext.createOscillator();
    modulatorOscillator.frequency.value = audioConfig.pulseRate;
    modulatorOscillator.type = 'square'; // 使用方波来模拟梯形波
    
    // 创建增益节点
    const carrierGain = audioContext.createGain();
    const modulatorGain = audioContext.createGain();
    
    carrierGain.gain.value = config.volume;
    modulatorGain.gain.value = audioConfig.modulationDepth / 2; // 调整调制深度
    
    // 连接调制器到载波的增益
    modulatorOscillator.connect(modulatorGain);
    modulatorGain.connect(carrierGain.gain);
    
    // 连接载波到输出
    carrierOscillator.connect(carrierGain);
    
    if (masterGainRef.current) {
      carrierGain.connect(masterGainRef.current);
    } else {
      carrierGain.connect(audioContext.destination);
    }
    
    gainNodeRef.current = carrierGain;
    isochronicSourceRef.current = carrierOscillator;
    isochronicModulatorRef.current = modulatorOscillator;
    
    return { carrierOscillator, modulatorOscillator, carrierGain };
  }, [initAudioContext]);

  // 主要的音频生成函数
  const generateAudio = useCallback(async (config: AudioConfig) => {
    setIsGenerating(true);
    console.log('开始生成音频...', config);
    
    try {
      // 停止当前播放的音频
      stopAllAudioSources();
      
      setCurrentConfig(config);
      
      // 初始化音频上下文
      const audioContext = await initAudioContext();
      console.log('音频上下文初始化成功');
      
      // 生成主音频（双耳节拍或等时音）
      if (config.type === 'binaural_beat') {
        console.log('生成双耳节拍...');
        await generateBinauralBeat(config);
      } else {
        console.log('生成等时音...');
        await generateIsochronicTone(config);
      }
      
      // 生成背景音频
      if (config.backgroundAudio && config.backgroundAudio !== 'none') {
        console.log('生成背景音频:', config.backgroundAudio);
        await generateBackgroundAudio(audioContext, config.backgroundAudio);
      }
      
      setAudioState(prev => ({
        ...prev,
        duration: config.duration,
        currentTime: 0
      }));
      
      console.log('音频生成完成');
      
    } catch (error) {
      console.error('音频生成失败:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [generateBinauralBeat, generateIsochronicTone, generateBackgroundAudio, initAudioContext, stopAllAudioSources]);

  // 播放音频
  const playAudio = useCallback(async () => {
    if (!audioContextRef.current || isGenerating || isPlayingRef.current) {
      console.log('无法播放:', { audioContext: !!audioContextRef.current, isGenerating, isPlaying: isPlayingRef.current });
      return;
    }
    
    console.log('开始播放音频...');
    
    // 确保音频上下文处于正常状态
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    startTimeRef.current = audioContextRef.current.currentTime;
    isPlayingRef.current = true;
    
    try {
      // 启动主音频
      if (currentConfig?.type === 'binaural_beat') {
        console.log('启动双耳节拍...');
        if (leftOscillatorRef.current && rightOscillatorRef.current) {
          leftOscillatorRef.current.start();
          rightOscillatorRef.current.start();
        }
      } else {
        console.log('启动等时音...');
        if (isochronicSourceRef.current && isochronicModulatorRef.current) {
          isochronicSourceRef.current.start();
          isochronicModulatorRef.current.start();
        }
      }
      
      // 启动背景音频
      if (backgroundAudioRef.current) {
        console.log('启动背景音频...');
        backgroundAudioRef.current.start();
      }
      
      setAudioState(prev => ({ ...prev, isPlaying: true }));
      
      // 开始时间更新动画
      const updateTime = () => {
        if (audioContextRef.current && isPlayingRef.current) {
          const currentTime = audioContextRef.current.currentTime - startTimeRef.current;
          setAudioState(prev => ({ ...prev, currentTime }));
          
          if (currentTime < (currentConfig?.duration || 0)) {
            animationFrameRef.current = requestAnimationFrame(updateTime);
          } else if (!audioState.isLooping) {
            stopAudio();
          }
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(updateTime);
      
      console.log('音频播放开始');
      
    } catch (error) {
      console.error('播放音频失败:', error);
      isPlayingRef.current = false;
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [audioState.isLooping, currentConfig, isGenerating]);

  // 暂停音频
  const pauseAudio = useCallback(() => {
    console.log('暂停音频...');
    stopAllAudioSources();
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, [stopAllAudioSources]);

  // 停止音频
  const stopAudio = useCallback(() => {
    console.log('停止音频...');
    stopAllAudioSources();
    setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
  }, [stopAllAudioSources]);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
    if (currentConfig) {
      setCurrentConfig({ ...currentConfig, volume });
    }
    setAudioState(prev => ({ ...prev, volume }));
  }, [currentConfig]);

  // 设置循环播放
  const setLooping = useCallback((looping: boolean) => {
    setAudioState(prev => ({ ...prev, isLooping: looping }));
  }, []);

  // 动态更新配置（在播放过程中）
  const updateConfig = useCallback(async (newConfig: Partial<AudioConfig>) => {
    if (!currentConfig) {
      console.log('没有当前配置，无法更新');
      return;
    }
    
    const updatedConfig = { ...currentConfig, ...newConfig };
    const wasPlaying = isPlayingRef.current;
    
    console.log('动态更新配置:', newConfig);
    
    // 停止当前播放
    if (wasPlaying) {
      stopAllAudioSources();
    }
    
    // 重新生成音频
    await generateAudio(updatedConfig);
    
    // 如果之前在播放，则继续播放
    if (wasPlaying) {
      setTimeout(() => {
        playAudio();
      }, 100); // 给音频生成一点时间
    }
  }, [currentConfig, generateAudio, playAudio, stopAllAudioSources]);
  
  // 切换背景音频
  const switchBackgroundAudio = useCallback(async (backgroundType: string) => {
    if (!audioContextRef.current) {
      console.log('音频上下文未初始化');
      return;
    }
    
    console.log('切换背景音频到:', backgroundType);
    
    // 停止当前背景音频
    stopBackgroundAudio();
    
    // 生成新的背景音频
    if (backgroundType && backgroundType !== 'none') {
      await generateBackgroundAudio(audioContextRef.current, backgroundType);
      
      // 如果正在播放，立即开始播放背景音频
      if (isPlayingRef.current && backgroundAudioRef.current) {
        backgroundAudioRef.current.start();
      }
    }
    
    // 更新配置
    if (currentConfig) {
      setCurrentConfig({ ...currentConfig, backgroundAudio: backgroundType });
    }
  }, [generateBackgroundAudio, stopBackgroundAudio, currentConfig]);

  return (
    <AudioPlayerContext.Provider value={{
      audioState,
      currentConfig,
      generateAudio,
      playAudio,
      pauseAudio,
      stopAudio,
      setVolume,
      setLooping,
      isGenerating,
      updateConfig,
      switchBackgroundAudio
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}