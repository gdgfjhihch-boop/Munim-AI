import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { tavilyService } from '@/lib/tavily-service';
import { vectorDbService } from '@/lib/vector-db-service';
import { useMemoryManagement } from '@/hooks/use-memory-management';

export default function SettingsScreen() {
  const colors = useColors();
  const { clearChatAndMemory } = useMemoryManagement();
  
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [gpuAcceleration, setGpuAcceleration] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [dbStats, setDbStats] = useState({ documentCount: 0, totalSize: 0 });
  const [tavilyStatus, setTavilyStatus] = useState({ isConfigured: false });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      await tavilyService.initialize();
      const status = tavilyService.getStatus();
      setTavilyStatus(status);
      
      const stats = vectorDbService.getStats();
      setDbStats(stats);
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      if (tavilyApiKey.trim()) {
        await tavilyService.setApiKey(tavilyApiKey);
        Alert.alert('Success', 'Tavily API key saved securely');
        setTavilyApiKey('');
        setShowApiKey(false);
        await loadSettings();
      } else {
        Alert.alert('Info', 'No API key provided');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save API key';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearApiKey = async () => {
    Alert.alert(
      'Clear API Key',
      'This will disable web search functionality.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              await tavilyService.clearApiKey();
              Alert.alert('Success', 'API key cleared');
              await loadSettings();
            } catch (e) {
              console.error('Failed to clear API key:', e);
              Alert.alert('Error', 'Failed to clear API key');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleClearDocuments = async () => {
    Alert.alert(
      'Clear Documents',
      'This will delete all uploaded documents from your knowledge base.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setIsClearing(true);
              await vectorDbService.clearAll();
              Alert.alert('Success', 'All documents cleared');
              await loadSettings();
            } catch (e) {
              console.error('Failed to clear documents:', e);
              Alert.alert('Error', 'Failed to clear documents');
            } finally {
              setIsClearing(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all conversations, documents, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete Everything',
          onPress: async () => {
            try {
              setIsClearing(true);
              await clearChatAndMemory();
              await vectorDbService.clearAll();
              await tavilyService.clearApiKey();
              Alert.alert('Success', 'All data cleared');
              await loadSettings();
            } catch (e) {
              console.error('Failed to clear data:', e);
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setIsClearing(false);
            }
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
            Web Search (Tavily API)
          </Text>

          <View
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.foreground }}
                >
                  API Key Status
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: tavilyStatus.isConfigured
                    ? colors.success
                    : colors.error,
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.background }}
                >
                  {tavilyStatus.isConfigured ? '✓ Active' : '✗ Not Set'}
                </Text>
              </View>
            </View>

            <Text
              className="text-xs mb-3"
              style={{ color: colors.muted }}
            >
              Get your free API key at{' '}
              <Text style={{ color: colors.primary }}>tavily.com</Text>
            </Text>

            {tavilyStatus.isConfigured ? (
              <Pressable
                onPress={handleClearApiKey}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.error,
                    borderRadius: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontWeight: '600',
                    textAlign: 'center',
                    fontSize: 12,
                  }}
                >
                  Remove API Key
                </Text>
              </Pressable>
            ) : (
              <View>
                <View
                  className="flex-row items-center mb-3 border rounded-lg"
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
                    <Text style={{ color: colors.primary, fontSize: 12 }}>
                      {showApiKey ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={handleSaveSettings}
                  disabled={isSaving || !tavilyApiKey.trim()}
                  style={({ pressed }) => [
                    {
                      backgroundColor: tavilyApiKey.trim()
                        ? colors.primary
                        : colors.border,
                      borderRadius: 6,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {isSaving ? (
                    <ActivityIndicator color={colors.background} size="small" />
                  ) : (
                    <Text
                      style={{
                        color: colors.background,
                        fontWeight: '600',
                        textAlign: 'center',
                      }}
                    >
                      Save API Key
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
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
                  Vulkan/Metal for faster inference
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
                  Llama-3.2-1B-Instruct (4-bit)
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: colors.muted }}
                >
                  ~1.2GB • Optimized for 4GB RAM devices
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Knowledge Base Section */}
        <View className="mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.foreground }}
          >
            Knowledge Base
          </Text>

          <View
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                Documents
              </Text>
              <View
                className="rounded-lg p-3"
                style={{ backgroundColor: colors.background }}
              >
                <Text style={{ color: colors.foreground }}>
                  {dbStats.documentCount} document{dbStats.documentCount !== 1 ? 's' : ''}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: colors.muted }}
                >
                  {(dbStats.totalSize / 1024 / 1024).toFixed(2)} MB total
                </Text>
              </View>
            </View>

            {dbStats.documentCount > 0 && (
              <Pressable
                onPress={handleClearDocuments}
                disabled={isClearing}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.warning,
                    borderRadius: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: colors.background,
                    fontWeight: '600',
                    textAlign: 'center',
                    fontSize: 12,
                  }}
                >
                  Clear Documents
                </Text>
              </Pressable>
            )}
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
              Your private AI assistant. All data stays on your device. No cloud sync, no tracking, no telemetry.
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
            onPress={handleClearAllData}
            disabled={isClearing}
            style={({ pressed }) => [
              {
                backgroundColor: colors.error,
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                opacity: pressed || isClearing ? 0.8 : 1,
              },
            ]}
          >
            {isClearing ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text
                style={{
                  color: colors.background,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                Clear All Data
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
