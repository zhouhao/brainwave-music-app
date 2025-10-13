import React, { useState } from 'react';
import { Play, Trash2, Heart, Clock, Volume2, Waves } from 'lucide-react';
import { useBrainwaveSessions } from '@/hooks/useBrainwaveSessions';
import { useAudio, AudioConfig } from '@/contexts/AudioContext';
import type { BrainwaveSession } from '@/lib/supabase';

const SessionLibrary: React.FC = () => {
  const { sessions, loading, deleteSession } = useBrainwaveSessions();
  const { generateAudio, playAudio } = useAudio();
  const [selectedSession, setSelectedSession] = useState<BrainwaveSession | null>(null);

  // 脑波类型颜色映射
  const brainwaveColors = {
    delta: 'from-purple-600 to-indigo-600',
    theta: 'from-blue-600 to-purple-600',
    alpha: 'from-green-600 to-blue-600',
    beta: 'from-orange-600 to-red-600',
    gamma: 'from-yellow-600 to-orange-600'
  };

  // 播放会话
  const playSession = async (session: BrainwaveSession) => {
    try {
      const audioConfig: AudioConfig = {
        type: 'binaural_beat', // 默认使用双耳节拍
        brainwaveType: session.brainwave_type as any,
        frequency: session.target_frequency,
        carrierFrequency: session.carrier_frequency,
        duration: session.session_duration,
        volume: session.volume,
        backgroundAudio: session.background_audio_type || 'none'
      };
      
      await generateAudio(audioConfig);
      playAudio();
      setSelectedSession(session);
    } catch (error) {
      console.error('播放会话失败:', error);
    }
  };

  // 删除会话
  const handleDeleteSession = async (sessionId: string) => {
    if (window.confirm('确定要删除这个会话吗？')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('删除会话失败:', error);
      }
    }
  };

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-white">加载中...</span>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Waves className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">暂无保存的会话</h3>
        <p className="text-gray-400">创建您的第一个脑波音乐会话吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">我的会话库</h2>
        <div className="text-sm text-gray-400">
          共 {sessions.length} 个会话
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const gradientClass = brainwaveColors[session.brainwave_type as keyof typeof brainwaveColors] || 'from-gray-600 to-gray-700';
          
          return (
            <div
              key={session.id}
              className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 group"
            >
              {/* 脑波类型标签 */}
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${gradientClass} mb-3`}>
                {session.brainwave_type.toUpperCase()}波
              </div>

              {/* 会话名称 */}
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {session.session_name}
              </h3>

              {/* 会话信息 */}
              <div className="space-y-2 text-sm text-gray-300 mb-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Waves className="w-4 h-4 mr-1" />
                    {session.target_frequency}Hz
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(session.session_duration)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Volume2 className="w-4 h-4 mr-1" />
                    {Math.round(session.volume * 100)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(session.created_at)}
                  </span>
                </div>

                {session.background_audio_type && session.background_audio_type !== 'none' && (
                  <div className="text-xs text-blue-300">
                    背景音：{session.background_audio_type}
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => playSession(session)}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4 mr-2" />
                  播放
                </button>

                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 播放次数 */}
              {session.play_count > 0 && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white">
                  播放 {session.play_count} 次
                </div>
              )}

              {/* 当前播放指示 */}
              {selectedSession?.id === session.id && (
                <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-500 rounded-2xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* 分页导航（如果需要） */}
      {sessions.length >= 20 && (
        <div className="flex justify-center mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1">
            <button className="px-4 py-2 text-white hover:bg-white/20 rounded transition-colors">
              加载更多
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionLibrary;