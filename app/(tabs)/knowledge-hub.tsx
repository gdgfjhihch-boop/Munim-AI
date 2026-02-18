import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { Document } from '@/lib/types';

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Project Proposal.pdf',
    content: 'Sample content...',
    size: 2048000,
    uploadedAt: Date.now() - 86400000,
    embeddingStatus: 'completed',
  },
  {
    id: '2',
    name: 'Meeting Notes.txt',
    content: 'Sample content...',
    size: 512000,
    uploadedAt: Date.now() - 172800000,
    embeddingStatus: 'completed',
  },
];

export default function KnowledgeHubScreen() {
  const colors = useColors();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadDocument = () => {
    setIsUploading(true);
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
    }, 2000);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <View
      className="rounded-lg p-4 mb-3 border flex-row justify-between items-center"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <View className="flex-1">
        <Text
          className="font-semibold mb-1"
          style={{ color: colors.foreground }}
        >
          {item.name}
        </Text>
        <View className="flex-row gap-4">
          <Text
            className="text-xs"
            style={{ color: colors.muted }}
          >
            {formatFileSize(item.size)}
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.muted }}
          >
            {formatDate(item.uploadedAt)}
          </Text>
        </View>
        <View className="flex-row items-center gap-2 mt-2">
          {item.embeddingStatus === 'pending' && (
            <>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                className="text-xs"
                style={{ color: colors.primary }}
              >
                Embedding...
              </Text>
            </>
          )}
          {item.embeddingStatus === 'completed' && (
            <Text
              className="text-xs"
              style={{ color: colors.success }}
            >
              ✓ Ready
            </Text>
          )}
          {item.embeddingStatus === 'failed' && (
            <Text
              className="text-xs"
              style={{ color: colors.error }}
            >
              ✗ Failed
            </Text>
          )}
        </View>
      </View>
      <Pressable
        onPress={() => handleDeleteDocument(item.id)}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <Text
          style={{ color: colors.error }}
        >
          Delete
        </Text>
      </Pressable>
    </View>
  );

  return (
    <ScreenContainer className="flex-1 p-4">
      {/* Header */}
      <View className="mb-6">
        <Text
          className="text-2xl font-bold mb-2"
          style={{ color: colors.foreground }}
        >
          Knowledge Hub
        </Text>
        <Text
          className="text-sm"
          style={{ color: colors.muted }}
        >
          Upload documents to enhance your AI assistant's knowledge
        </Text>
      </View>

      {/* Upload Button */}
      <Pressable
        onPress={handleUploadDocument}
        disabled={isUploading}
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
        <View className="flex-row items-center justify-center gap-2">
          {isUploading ? (
            <>
              <ActivityIndicator color={colors.background} />
              <Text
                style={{
                  color: colors.background,
                  fontWeight: '600',
                }}
              >
                Uploading...
              </Text>
            </>
          ) : (
            <Text
              style={{
                color: colors.background,
                fontWeight: '600',
              }}
            >
              + Upload Document
            </Text>
          )}
        </View>
      </Pressable>

      {/* Documents List */}
      {documents.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text
            className="text-lg font-semibold text-center mb-2"
            style={{ color: colors.foreground }}
          >
            No documents yet
          </Text>
          <Text
            className="text-sm text-center"
            style={{ color: colors.muted }}
          >
            Upload PDFs or text files to create a personal knowledge base
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocument}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
}
