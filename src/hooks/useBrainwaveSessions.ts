import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { BrainwaveSession, BackgroundAudioTrack } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useBrainwaveSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<BrainwaveSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取用户会话列表
  const fetchSessions = async (includePublic = false) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('session-management', {
        body: null // GET request
      });
      
      if (error) {
        throw error;
      }
      
      setSessions(data.data.sessions || []);
    } catch (err: any) {
      setError(err.message || '获取会话列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建新会话
  const createSession = async (sessionData: Omit<BrainwaveSession, 'id' | 'user_id' | 'play_count' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      throw new Error('需要登录后才能创建会话');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('session-management', {
        body: sessionData
      });
      
      if (error) {
        throw error;
      }
      
      const newSession = data.data.session;
      setSessions(prev => [newSession, ...prev]);
      
      return newSession;
    } catch (err: any) {
      const errorMessage = err.message || '创建会话失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 删除会话
  const deleteSession = async (sessionId: string) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 直接使用数据库删除
      const { error } = await supabase
        .from('brainwave_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error('删除会话失败: ' + error.message);
      }
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      setError(err.message || '删除会话失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 加载初始数据
  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    deleteSession
  };
}

// 获取背景音频的hook
export function useBackgroundAudio() {
  const [tracks, setTracks] = useState<BackgroundAudioTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('background_audio_tracks')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        throw error;
      }
      
      setTracks(data || []);
    } catch (err: any) {
      setError(err.message || '获取背景音频失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  return {
    tracks,
    loading,
    error,
    fetchTracks
  };
}