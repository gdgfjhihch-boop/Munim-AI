import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { Document } from '@/lib/types';
import { vectorDbService } from '@/lib/vector-db-service';
import { embeddingService } from '@/lib/embedding-service';

export default function KnowledgeHubScreen() {
  const colors = useColors();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      await vectorDbService.initialize();
      const docs = await vectorDbService.getAllDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load documents:', e);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'text/markdown'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      if (!file.uri) {
        Alert.alert('Error', 'Failed to get file');
        return;
      }

      setIsUploading(true);

      let content = '';
      try {
        content = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } catch {
        content = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      if (!content) {
        Alert.alert('Error', 'File is empty');
        setIsUploading(false);
        return;
      }

      const fileInfo = await FileSystem.getInfoAsync(file.uri);
      const size = (fileInfo as any).size || content.length || 0;

      const doc: Document = {
        id: Date.now().toString(),
        name: file.name,
        content: content.substring(0, 10000),
        size,
        uploadedAt: Date.now(),
        embeddingStatus: 'pending',
      };

      setDocuments([...documents, doc]);

      try {
        await embeddingService.initialize();
        const embedding = await embeddingService.embedDocument(doc.name, doc.content);

        await vectorDbService.storeDocument(doc, embedding.embedding);

        const updatedDoc = { ...doc, embeddingStatus: 'completed' as const };
        setDocuments((docs) =>
          docs.map((d) => (d.id === doc.id ? updatedDoc : d))
        );

        Alert.alert('Success', `Document "${file.name}" uploaded and embedded`);
      } catch (e) {
        console.error('Embedding failed:', e);
        const failedDoc = { ...doc, embeddingStatus: 'failed' as const };
        setDocuments((docs) =>
          docs.map((d) => (d.id === doc.id ? failedDoc : d))
        );
        Alert.alert('Warning', 'Document uploaded but embedding failed');
      }
    } catch (e) {
      console.error('Upload failed:', e);
      Alert.alert('Error', 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = (id: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await vectorDbService.deleteDocument(id);
              setDocuments(documents.filter((doc) => doc.id !== id));
              Alert.alert('Success', 'Document deleted');
            } catch (e) {
              console.error('Failed to delete document:', e);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
          style: 'destructive',
        },
      ]
    );
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

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator color={colors.primary} size="large" />
      </ScreenContainer>
    );
  }

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
          Upload documents to enhance your AI assistant&apos;s knowledge
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
