import React, { useState } from 'react';
import { Play, Pause, Square, Brain, Waves, Moon, Focus, Zap } from 'lucide-react';
import { useAudio, AudioConfig, BrainwaveType } from '@/contexts/AudioContext';

const BrainwaveApp: React.FC = () => {
  const { 
    audioState, 
    currentConfig, 
    generateAudio, 
    playAudio, 
    pauseAudio, 
    stopAudio, 
    setVolume, 
    isGenerating,
    updateConfig,
    switchBackgroundAudio
  } = useAudio();
  
  const [audioConfig, setAudioConfig] = useState<AudioConfig>({
    type: 'binaural_beat',
    brainwaveType: 'alpha',
    frequency: 10,
    carrierFrequency: 440,
    duration: 600, // 10分钟
    volume: 0.5,
    backgroundAudio: 'none'
  });

  // 脑波类型配置
  const brainwaveTypes = {
    delta: {
      name: 'Delta波',
      description: '深度睡眠和恢复',
      frequency: 2,
      icon: Moon,
      color: 'from-purple-600 to-indigo-600',
      benefits: ['改善睡眠质量', '促进身体恢复']
    },
    theta: {
      name: 'Theta波',
      description: '深度冥想和创造力',
      frequency: 6,
      icon: Brain,
      color: 'from-blue-600 to-purple-600',
      benefits: ['增强创造力', '深度放松']
    },
    alpha: {
      name: 'Alpha波',
      description: '放松专注和学习',
      frequency: 10,
      icon: Waves,
      color: 'from-green-600 to-blue-600',
      benefits: ['提高专注力', '减少压力']
    },
    beta: {
      name: 'Beta波',
      description: '清醒思维和解决问题',
      frequency: 20,
      icon: Focus,
      color: 'from-orange-600 to-red-600',
      benefits: ['增强逻辑思维', '提高警觉性']
    },
    gamma: {
      name: 'Gamma波',
      description: '高级认知和洞察力',
      frequency: 40,
      icon: Zap,
      color: 'from-yellow-600 to-orange-600',
      benefits: ['增强记忆力', '提高认知能力']
    }
  };

  // 处理参数变化（动态更新）
  const handleConfigChange = async (key: keyof AudioConfig, value: any) => {
    const newConfig = { ...audioConfig, [key]: value };
    setAudioConfig(newConfig);
    
    // 如果当前有音频在播放，动态更新
    if (currentConfig) {
      if (key === 'backgroundAudio') {
        // 背景音频切换
        await switchBackgroundAudio(value);
      } else if (key === 'volume') {
        // 音量变化立即生效
        setVolume(value);
      } else if (audioState.isPlaying) {
        // 其他参数变化需要重新生成
        await updateConfig({ [key]: value });
      }
    }
  };

  // 更新脑波类型
  const handleBrainwaveChange = async (type: BrainwaveType) => {
    const brainwave = brainwaveTypes[type];
    const newConfig = {
      ...audioConfig,
      brainwaveType: type,
      frequency: brainwave.frequency
    };
    
    setAudioConfig(newConfig);
    
    // 如果当前有音频在播放，动态更新
    if (currentConfig && audioState.isPlaying) {
      await updateConfig({
        brainwaveType: type,
        frequency: brainwave.frequency
      });
    }
  };

  // 生成音频
  const handleGenerateAudio = async () => {
    try {
      console.log('用户请求生成音频:', audioConfig);
      await generateAudio(audioConfig);
      console.log('音频生成成功');
    } catch (error) {
      console.error('生成音频失败:', error);
      alert('生成音频失败，请稍后再试');
    }
  };

  // 播放/暂停切换
  const handlePlayPause = async () => {
    try {
      if (audioState.isPlaying) {
        console.log('暂停播放');
        pauseAudio();
      } else {
        // 如果没有生成过音频，先生成
        if (!currentConfig) {
          console.log('首次播放，先生成音频');
          await handleGenerateAudio();
        }
        console.log('开始播放');
        await playAudio();
      }
    } catch (error) {
      console.error('播放控制失败:', error);
      alert('播放失败，请稍后再试');
    }
  };



  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background - no external image needed */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-indigo-900/30 animate-pulse" />
        <div className="relative px-6 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              AI驱动的
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                脑波音乐
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              借助科学的双耳节拍和等时音技术，为您量身定制脑波音乐，提升专注力、促进放松或改善睡眠。
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 脑波类型选择 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">选择您的脑波模式</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Object.entries(brainwaveTypes).map(([type, config]) => {
              const Icon = config.icon;
              const isActive = audioConfig.brainwaveType === type;
              
              return (
                <div
                  key={type}
                  onClick={() => handleBrainwaveChange(type as BrainwaveType)}
                  className={`
                    relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105
                    ${isActive 
                      ? `bg-gradient-to-br ${config.color} shadow-2xl ring-2 ring-white/30` 
                      : 'bg-white/10 hover:bg-white/20 backdrop-blur-sm'
                    }
                  `}
                >
                  <div className="text-center">
                    <Icon className={`w-8 h-8 mx-auto mb-3 ${isActive ? 'text-white' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-semibold mb-2 ${isActive ? 'text-white' : 'text-gray-200'}`}>
                      {config.name}
                    </h3>
                    <p className={`text-sm mb-3 ${isActive ? 'text-white/90' : 'text-gray-400'}`}>
                      {config.description}
                    </p>
                    <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {config.frequency}Hz
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 bg-white/10 rounded-2xl border border-white/20" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 参数设置 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-semibold text-white mb-6">高级设置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 音频类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">音频类型</label>
              <select
                value={audioConfig.type}
                onChange={(e) => handleConfigChange('type', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="binaural_beat">双耳节拍</option>
                <option value="isochronic_tone">等时音</option>
              </select>
            </div>

            {/* 目标频率 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                目标频率 ({audioConfig.frequency}Hz)
              </label>
              <input
                type="range"
                min="0.5"
                max="100"
                step="0.5"
                value={audioConfig.frequency}
                onChange={(e) => handleConfigChange('frequency', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 载波频率 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                载波频率 ({audioConfig.carrierFrequency}Hz)
              </label>
              <input
                type="range"
                min="200"
                max="800"
                step="10"
                value={audioConfig.carrierFrequency}
                onChange={(e) => handleConfigChange('carrierFrequency', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 会话时长 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                会话时长 ({Math.floor(audioConfig.duration / 60)}分钟)
              </label>
              <input
                type="range"
                min="300"
                max="3600"
                step="300"
                value={audioConfig.duration}
                onChange={(e) => handleConfigChange('duration', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 音量 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                音量 ({Math.round(audioConfig.volume * 100)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={audioConfig.volume}
                onChange={(e) => handleConfigChange('volume', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* 背景音频 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">背景音频</label>
              <select
                value={audioConfig.backgroundAudio}
                onChange={(e) => handleConfigChange('backgroundAudio', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">无背景音</option>
                <option value="rain">雨声</option>
                <option value="ocean">海浪声</option>
                <option value="whitenoise">白噪音</option>
                <option value="forest">森林声</option>
                <option value="piano">钢琴声</option>
              </select>
            </div>
          </div>
        </div>

        {/* 播放控制 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-white">播放控制</h3>
          </div>
          
          {/* 播放按钮 */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={handlePlayPause}
              disabled={isGenerating}
              className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 relative"
            >
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-1" />
                </div>
              ) : audioState.isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </button>
            
            <button
              onClick={stopAudio}
              className="w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <Square className="w-6 h-6" />
            </button>
          </div>
          
          {/* 加载状态文字提示 */}
          {isGenerating && (
            <div className="text-center mb-4">
              <p className="text-blue-300 text-sm font-medium animate-pulse">
                🎧 正在生成个性化脑波音频...
              </p>
            </div>
          )}
          
          {/* 进度条 */}
          {currentConfig && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-300">
                <span>{formatTime(audioState.currentTime)}</span>
                <span className="text-center">
                  {brainwaveTypes[audioConfig.brainwaveType].name} - {audioConfig.frequency}Hz
                </span>
                <span>{formatTime(audioState.duration)}</span>
              </div>
              
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(audioState.currentTime / audioState.duration) * 100}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default BrainwaveApp;