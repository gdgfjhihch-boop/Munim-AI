import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';

export default function SettingsScreen() {
  const colors = useColors();
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = () => {
    // TODO: Save to secure storage
    Alert.alert('Success', 'Settings saved successfully');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all conversations and documents. This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: () => {
            // TODO: Clear all data
            Alert.alert('Success', 'All data cleared');
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScreenContainer className="flex-1 p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text
          className="text-2xl font-bold mb-6"
          style={{ color: colors.foreground }}
        >
          Settings
        </Text>

        {/* API Configuration Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.foreground }}
          >
            API Configuration
          </Text>

          <View
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-sm font-semibold mb-2"
              style={{ color: colors.foreground }}
            >
              Tavily API Key
            </Text>
            <Text
              className="text-xs mb-3"
              style={{ color: colors.muted }}
            >
              Required for real-time web search. Get your free key at tavily.com
            </Text>

            <View className="flex-row items-center mb-3 border rounded-lg"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              <TextInput
                value={tavilyApiKey}
                onChangeText={setTavilyApiKey}
                placeholder="tvly-..."
                placeholderTextColor={colors.muted}
                secureTextEntry={!showApiKey}
                style={{
                  flex: 1,
                  color: colors.foreground,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              />
              <Pressable
                onPress={() => setShowApiKey(!showApiKey)}
                style={{ paddingHorizontal: 12 }}
              >
                <Text style={{ color: colors.primary }}>
                  {showApiKey ? 'Hide' : 'Show'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Model Configuration Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.foreground }}
          >
            Model Configuration
          </Text>

          <View
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text
                  className="font-semibold"
                  style={{ color: colors.foreground }}
                >
                  GPU Acceleration
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.muted }}
                >
                  Enable Vulkan/Metal for faster inference
                </Text>
              </View>
              <Switch
                value={gpuAcceleration}
                onValueChange={setGpuAcceleration}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>

            <View className="border-t" style={{ borderTopColor: colors.border }} />

            <View className="mt-4">
              <Text
                className="font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                Active Model
              </Text>
              <View
                className="rounded-lg p-3"
                style={{ backgroundColor: colors.background }}
              >
                <Text style={{ color: colors.foreground }}>
                  Llama-3.2-3B-Instruct (4-bit)
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: colors.muted }}
                >
                  ~3GB • Optimized for mobile
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.foreground }}
          >
            Appearance
          </Text>

          <View
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <Text
              className="text-sm"
              style={{ color: colors.muted }}
            >
              Theme: Dark (System Default)
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.foreground }}
          >
            About
          </Text>

          <View
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="mb-3">
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.foreground }}
              >
                GENESIS-1
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.muted }}
              >
                Version 1.0.0
              </Text>
            </View>

            <View className="border-t mb-3" style={{ borderTopColor: colors.border }} />

            <Text
              className="text-xs leading-relaxed"
              style={{ color: colors.muted }}
            >
              Your private AI assistant. All data stays on your device. No cloud sync, no tracking.
            </Text>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-8">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.error }}
          >
            Danger Zone
          </Text>

          <Pressable
            onPress={handleClearData}
            style={({ pressed }) => [
              {
                backgroundColor: colors.error,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: colors.background,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Clear All Data
            </Text>
          </Pressable>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSaveSettings}
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 16,
              marginBottom: 16,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text
            style={{
              color: colors.background,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            Save Settings
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
