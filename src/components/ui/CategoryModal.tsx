import { categoryService } from '@/services/categoryService';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (name: string, color: string) => void;
  initialName?: string;
  initialColor?: string;
}

export function CategoryModal({
  visible,
  onClose,
  title,
  onSubmit,
  initialName = '',
  initialColor = '#6B7280',
}: CategoryModalProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const presetColors = categoryService.getPresetColors();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // スナップポイントを定義
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  // モーダルが開かれたときに初期値をセットしてBottomSheetModalを表示
  useEffect(() => {
    if (visible) {
      setName(initialName);
      setColor(initialColor);
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible, initialName, initialColor]);

  // BottomSheetModalが閉じられたときのコールバック
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // キャンセルボタンが押されたときにBottomSheetを閉じる
  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  // 背景コンポーネントをレンダリング
  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  // TextInputがフォーカスされたときにBottomSheetを拡張
  // HACK: キーボードアニメーションと同期するため少し遅延
  const handleTextInputFocus = useCallback(() => {
    setTimeout(() => {
      bottomSheetModalRef.current?.snapToIndex(2);
    }, 50);
  }, []);

  // 保存ボタンが押されたときにカテゴリを保存
  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      Alert.alert('エラー', 'カテゴリ名を入力してください');
      return;
    }
    if (trimmedName.length > 32) {
      Alert.alert('エラー', 'カテゴリ名は32文字以内で入力してください');
      return;
    }

    // キーボードを閉じる
    Keyboard.dismiss();

    // すぐに送信処理を実行（親コンポーネントで遅延処理）
    onSubmit(trimmedName, color);
    setName('');
    setColor('#6B7280');
  }, [name, color, onSubmit]);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior='fillParent'
      keyboardBlurBehavior='restore'
      android_keyboardInputMode='adjustResize'
    >
      <BottomSheetView className='flex-1'>
        <ScrollView
          className='flex-1 p-6'
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <Text className='text-xl font-bold mb-4'>{title}</Text>

          <Text className='text-gray-700 font-medium mb-2'>カテゴリ名</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={handleTextInputFocus}
            placeholder='カテゴリ名を入力'
            className='border border-gray-300 rounded-lg p-3 mb-4'
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

          <View className='flex-row gap-3 mb-6'>
            <Pressable onPress={onClose} className='flex-1 bg-gray-200 rounded-lg p-3'>
              <Text className='text-gray-800 text-center font-medium'>キャンセル</Text>
            </Pressable>
            <Pressable onPress={handleSubmit} className='flex-1 bg-blue-500 rounded-lg p-3'>
              <Text className='text-white text-center font-medium'>保存</Text>
            </Pressable>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
