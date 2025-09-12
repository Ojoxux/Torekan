import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('AuthGuard check:', { loading, hasUser: !!user });
    if (!loading && !user) {
      console.log('Redirecting to login...');
      router.replace('./auth/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}