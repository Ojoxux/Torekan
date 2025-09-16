import { useAuth } from '@/contexts/AuthContext';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('エラー', 'すべての項目を入力してください');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      Alert.alert('エラー', 'パスワードは6文字以上で入力してください');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(
        '登録完了',
        'アカウントの作成が完了しました。メールを確認してアカウントを有効化してください。',
        [{ text: 'OK', onPress: () => router.replace('./login') }]
      );
    } catch (error) {
      Alert.alert(
        '登録エラー',
        error instanceof Error ? error.message : 'アカウントの作成に失敗しました'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1 bg-white'
    >
      <View className='flex-1 justify-center px-6'>
        <Text className='text-3xl font-bold text-center mb-8'>アカウント作成</Text>

        <View className='space-y-4'>
          <View>
            <Text className='text-sm font-medium text-gray-700 mb-1'>メールアドレス</Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='email@example.com'
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
              keyboardType='email-address'
              editable={!loading}
            />
          </View>

          <View className='mt-4'>
            <Text className='text-sm font-medium text-gray-700 mb-1'>パスワード</Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='6文字以上のパスワード'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View className='mt-4'>
            <Text className='text-sm font-medium text-gray-700 mb-1'>パスワード（確認）</Text>
            <TextInput
              className='border border-gray-300 rounded-lg px-3 py-2 text-base'
              placeholder='パスワードを再入力'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View className='mt-4'>
            <TouchableOpacity
              className={`bg-blue-500 rounded-lg py-3 ${loading ? 'opacity-50' : ''}`}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color='white' />
              ) : (
                <Text className='text-white text-center font-semibold text-base'>
                  アカウント作成
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className='mt-6'>
          <Link href='./login' asChild>
            <TouchableOpacity disabled={loading}>
              <Text className='text-center text-blue-500'>
                すでにアカウントをお持ちの方はこちら
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
