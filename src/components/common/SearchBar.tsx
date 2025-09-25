import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

/*
 * 検索バーのコンポーネント
 */
export function SearchBar({ value, onChangeText, placeholder = '検索...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /*
   * テキストを入力時に検索バーのテキストを更新
   */
  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText(text);
  };

  /*
   * クリアボタンを押下時に検索バーのテキストをクリア
   */
  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
  };

  return (
    <View className='flex-row items-center bg-gray-100 rounded-xl px-3 py-2'>
      <Ionicons name='search-outline' size={20} color='#9CA3AF' className='mr-2' />
      <TextInput
        value={localValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor='#9CA3AF'
        className='flex-1 text-gray-900 text-base ml-2'
        returnKeyType='search'
        clearButtonMode='never'
      />
      {localValue.length > 0 && (
        <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
          <Ionicons name='close-circle' size={20} color='#9CA3AF' />
        </TouchableOpacity>
      )}
    </View>
  );
}
