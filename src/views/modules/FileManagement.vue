<template>
  <div class="container">
    <h2>ファイル管理</h2>
    <!-- 非表示のファイル入力 -->
    <input type="file" ref="fileInput" @change="handleFileSelected" style="display: none;" />

    <div class="mb-4">
      <button class="btn btn-primary me-2" @click="triggerFileUpload">ファイルをアップロード</button>
      <button class="btn btn-secondary">選択したものをダウンロード</button>
    </div>

    <div class="table-responsive">
      <table class="table">
        <thead>
          <tr>
            <th><input type="checkbox" @change="toggleSelectAll" :checked="allSelected" /></th>
            <th>ファイル名</th>
            <th>作成日</th>
            <th>サイズ</th>
            <th>アクション</th>
          </tr>
        </thead>
        <tbody v-if="uploadedFiles.length > 0">
          <tr v-for="file in uploadedFiles" :key="file.name">
            <td><input type="checkbox" v-model="selectedFiles" :value="file.name" /></td>
            <td>{{ file.name }}</td>
            <td>{{ formatDateTime(file.creationDate) }}</td>
            <td>{{ formatFileSize(file.size) }}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-2" @click="downloadFile(file)">ダウンロード</button>
              <button class="btn btn-sm btn-outline-danger" @click="deleteFile(file.name)">削除</button>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="5" class="text-center">まだファイルはアップロードされていません。</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios'; // axiosがインストールされていることを確認してください (npm install axios または yarn add axios)

interface FileInfo {
  name: string;
  creationDate: string; // ISO文字列
  size: number; // バイト単位
  url: string; // ダウンロードURL (サーバーのルートからの相対パス)
}

const fileInput = ref<HTMLInputElement | null>(null);
const uploadedFiles = ref<FileInfo[]>([]);
const selectedFiles = ref<string[]>([]); // チェックボックス選択用

// アップロードサーバーのAPIベースURL
const UPLOAD_API_BASE_URL = 'http://localhost:3003';

const triggerFileUpload = () => {
  // 非表示のファイル入力をプログラムでクリックします
  fileInput.value?.click();
};

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    // console.log('File selected:', file.name);
    await uploadFile(file); // ファイルリストをアップロード後に更新
    await fetchUploadedFiles();

    // 必要に応じて同じファイルを再度選択できるようにファイル入力をリセットします
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' はバックエンドがアップロードされたファイルを期待するキーです

  try {
    const response = await axios.post(`${UPLOAD_API_BASE_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('File uploaded successfully:', response.data);
    alert(`ファイル "${file.name}" が正常にアップロードされました！`);
  } catch (error) {
    console.error('Error uploading file:', error); // errorオブジェクトにはより詳細な情報が含まれます
    if (axios.isAxiosError(error) && error.response) {
      console.error('Axios error details:', error.response.data, error.response.status, error.request);
    }
    alert(`ファイル "${file.name}" のアップロード中にエラーが発生しました。詳細はコンソールを確認してください。`);
  }
};

const fetchUploadedFiles = async () => {
  try {
    const response = await axios.get<FileInfo[]>(`${UPLOAD_API_BASE_URL}/api/files`);
    uploadedFiles.value = response.data;
  } catch (error) {
    console.error('Error fetching uploaded files:', error);
    // alert('ファイルリストの読み込みに失敗しました。'); // オプション: ユーザーへのアラート
  }
};

const downloadFile = async (file: FileInfo) => {
  try {
    const response = await axios({
        // file.url は既にサーバー側で encodeURIComponent されている想定
        url: `${UPLOAD_API_BASE_URL}${file.url}`, 
      method: 'GET',
      responseType: 'blob', // 重要: responseTypeをblobに設定
    });

    // ファイルのレスポンスデータを使用して新しいBlobオブジェクトを作成します
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', file.name); // download属性にファイル名を設定します
    document.body.appendChild(link);
    link.click();

    // オブジェクトURLを破棄し、リンクを削除してクリーンアップします
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading file:', error);
    alert(`ファイル "${file.name}" のダウンロードに失敗しました。コンソールを確認してください。`);
  }
};

const deleteFile = async (fileName: string) => {
  if (!confirm(`本当に "${fileName}" を削除しますか？この操作は元に戻せません。`)) {
    return;
  }
  try {
      // fileName は日本語を含む生のファイル名なので、ここでエンコードする
      await axios.delete(`${UPLOAD_API_BASE_URL}/api/files/${encodeURIComponent(fileName)}`); 
    alert(`File "${fileName}" deleted successfully.`);
    fetchUploadedFiles(); // Refresh the list
  } catch (error) {
    console.error(`Error deleting file "${fileName}":`, error);
    if (axios.isAxiosError(error) && error.response) {
      alert(`ファイル "${fileName}" の削除に失敗しました: ${error.response.data.message || error.message}`);
    } else {
      alert(`ファイル "${fileName}" の削除に失敗しました。`);
    }
  }
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return '該当なし';
  const date = new Date(isoString);
  return date.toLocaleString(); // 必要に応じてフォーマットを調整してください
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// チェックボックス選択ロジック
const allSelected = computed({
  get: () => {
    return uploadedFiles.value.length > 0 && selectedFiles.value.length === uploadedFiles.value.length;
  },
  set: (value: boolean) => {
    if (value) {
      selectedFiles.value = uploadedFiles.value.map(file => file.name);
    } else {
      selectedFiles.value = [];
    }
  }
});

const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  allSelected.value = target.checked;
};

// コンポーネントがマウントされたときにファイルを取得します
onMounted(() => {
  fetchUploadedFiles();
});

</script>