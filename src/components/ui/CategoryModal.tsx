import { categorySchema } from '@/lib/schemas';
import { categoryService } from '@/services/categoryService';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as v from 'valibot';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (name: string, color: string, icon?: string) => void;
  initialName?: string;
  initialColor?: string;
  initialIcon?: string;
}

// 利用可能なアイコンリスト
const availableIcons = [
  { name: 'folder-outline', label: 'フォルダ' },
  { name: 'cube-outline', label: 'ボックス' },
  { name: 'heart-outline', label: 'ハート' },
  { name: 'star-outline', label: 'スター' },
  { name: 'musical-notes-outline', label: '音楽' },
  { name: 'game-controller-outline', label: 'ゲーム' },
  { name: 'book-outline', label: '本' },
  { name: 'camera-outline', label: 'カメラ' },
  { name: 'car-outline', label: '車' },
  { name: 'home-outline', label: 'ホーム' },
  { name: 'gift-outline', label: 'ギフト' },
  { name: 'trophy-outline', label: 'トロフィー' },
] as const;

export function CategoryModal({
  visible,
  onClose,
  title,
  onSubmit,
  initialName = '',
  initialColor = '#6B7280',
  initialIcon = 'folder-outline',
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [icon, setIcon] = useState(initialIcon);
  const presetColors = categoryService.getPresetColors();
  const insets = useSafeAreaInsets();

  // モーダルが開かれたときに初期値をセット
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(initialColor);
      setIcon(initialIcon);
    }
  }, [visible, initialName, initialColor, initialIcon]);

  // キャンセルボタンが押されたときにモーダルを閉じる
  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  // 保存ボタンが押されたときにカテゴリを保存
  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();

    // バリデーションかける
    const result = v.safeParse(categorySchema, {
      name: trimmedName,
      color,
      icon,
    });

    if (!result.success) {
      const firstError = result.issues[0];
      Alert.alert('入力エラー', firstError.message);
      return;
    }

    // キーボードを閉じる
    Keyboard.dismiss();

    // すぐにモーダルを閉じる
    onClose();
    
    // 送信処理を実行
    onSubmit(trimmedName, color, icon);
    setName('');
    setColor('#6B7280');
    setIcon('folder-outline');
  }, [name, color, icon, onSubmit, onClose]);

  return (
    <>
      {visible && (
        <Pressable onPress={handleDismiss} className='absolute inset-0 z-40 bg-black/50' />
      )}
      <Modal
        transparent
        visible={visible}
        onRequestClose={handleDismiss}
        animationType="slide"
      >
        <View className='flex-1 justify-end' pointerEvents="box-none">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            className='flex-1 justify-end'
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View className='bg-white rounded-t-2xl min-h-[35%] max-h-[80%]'>
              <ScrollView
                className='flex-1'
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                  padding: 24,
                  paddingBottom: Math.max(insets.bottom + 24, 48)
                }}
              >
                <Text className='text-xl font-bold mb-4'>{title}</Text>

                <Text className='text-gray-700 font-medium mb-2'>カテゴリ名</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder='カテゴリ名を入力'
                  className='border border-gray-300 rounded-lg p-3 mb-4'
                  autoCorrect={false}
                  autoCapitalize='none'
                  keyboardType='default'
                  returnKeyType='done'
                  maxLength={32}
                  autoComplete='off'
                  spellCheck={false}
                  textContentType='none'
                  importantForAutofill='no'
                  blurOnSubmit={true}
                  caretHidden={false}
                  selectTextOnFocus={false}
                  autoFocus={false}
                />

                <Text className='text-gray-700 font-medium mb-2'>カラー</Text>
                <View className='flex-row flex-wrap gap-2 mb-6'>
                  {presetColors.map((presetColor) => (
                    <Pressable
                      key={presetColor}
                      onPress={() => setColor(presetColor)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        color === presetColor ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: presetColor }}
                    />
                  ))}
                </View>

                <View className='flex-row gap-3'>
                  <Pressable onPress={handleDismiss} className='flex-1 bg-gray-200 rounded-lg p-3'>
                    <Text className='text-gray-800 text-center font-medium'>キャンセル</Text>
                  </Pressable>
                  <Pressable onPress={handleSubmit} className='flex-1 bg-blue-500 rounded-lg p-3'>
                    <Text className='text-white text-center font-medium'>保存</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
