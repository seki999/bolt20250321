<template>
  <div class="container">
    <h2>テーブル管理</h2> <!-- Table Management -->
    <div class="d-flex justify-content-end mb-3">
      <button class="btn btn-primary" @click="openCreateTableModal">新規テーブル</button> <!-- New Table -->
    </div>
    <div class="row">
      <div class="col-md-4">
        <h5>テーブル一覧</h5> <!-- Table List -->
        <div v-if="tables.length === 0" class="list-group">
            <div class="list-group-item">テーブルがありません。新規作成してください。</div> <!-- No tables yet, please create one. -->
        </div>
        <div v-else class="list-group">
          <a
            href="#"
            v-for="table in tables"
            :key="table.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            :class="{ active: table.id === selectedTableId }"
            @click.prevent="selectTable(table.id)"
          >
            {{ table.name }}
            <button
              class="btn btn-sm btn-outline-danger"
              @click.stop="confirmDeleteTable(table.id)"
              title="テーブルを削除"
            >
              <i class="bi bi-trash"></i> <!-- Assuming Bootstrap Icons are available -->
            </button>
          </a>
        </div>
      </div>
      <div class="col-md-8">
        <div v-if="selectedTable" class="card" style="width: 600px;">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="card-title mb-0">テーブル詳細: {{ selectedTable.name }}</h5> <!-- Table Details: -->
          </div>
          <div class="card-body">
            <h6>フィールド:</h6> <!-- Fields: -->
            <ul>
              <li v-for="field in selectedTable.fields" :key="field.name">{{ field.name }} ({{ field.type }})</li>
            </ul>
            <hr />
            <h6>データ追加:</h6> <!-- Add Data: -->
            <form @submit.prevent="addDataToTable">
              <div v-for="field in selectedTable.fields" :key="field.name" class="mb-3">
                <label :for="`field-${field.name}`" class="form-label">{{ field.name }}:</label>
                <input
                  :type="field.type === 'number' ? 'number' : (field.type === 'date' ? 'date' : 'text')"
                  class="form-control"
                  :id="`field-${field.name}`"
                  v-model="newRowData[field.name]"
                  required
                />
              </div>
              <button type="submit" class="btn btn-success">行データ追加</button> <!-- Add Row Data -->
            </form>
            <hr />
            <h6>テーブルデータ ({{ selectedTable.data.length }} 行):</h6> <!-- Table Data (x rows) -->
            <div v-if="selectedTable.data.length === 0" class="text-muted">
              データがありません。 <!-- No data yet. -->
            </div>
            <div v-else class="table-responsive">
              <table class="table table-striped table-bordered">
                <thead>
                   <tr style="width: 300%;">
                    <th v-for="field in selectedTable.fields" :key="field.name">{{ field.name }}</th>
                    <th>操作</th> <!-- Actions -->
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in selectedTable.data" :key="rowIndex">
                    <td v-for="field in selectedTable.fields" :key="field.name">{{ row[field.name] }}</td>
                    <td>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteDataRow(rowIndex)"
                        title="行を削除"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-else class="card">
          <div class="card-body"  style="width: 600px;">
            <h5 class="card-title">テーブル詳細</h5> <!-- Table Details -->
            <p class="card-text">左側からテーブルを選択するか、新規テーブルを作成して詳細を<br>表示してください。</p> <!-- Please select a table from the left, or create a new one to see details. -->
          </div>
        </div>
      </div>
    </div>

    <!-- Create Table Modal -->
    <div v-if="showCreateTableModal" class="modal-backdrop fade show"></div>
    <div v-if="showCreateTableModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">新規テーブル作成</h5> <!-- Create New Table -->
            <button type="button" class="btn-close" @click="closeCreateTableModal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="newTableName" class="form-label">テーブル名:</label> <!-- Table Name: -->
              <input type="text" class="form-control" id="newTableName" v-model.trim="newTableName" required />
            </div>
            <h6>フィールド定義:</h6> <!-- Field Definitions: -->
            <div v-for="(field, index) in newTableFields" :key="index" class="row mb-2 align-items-center">
              <div class="col">
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="field.name"
                  placeholder="フィールド名"
                  required
                /> <!-- Field Name -->
              </div>
              <div class="col-auto">
                 <select v-model="field.type" class="form-select">
                    <option value="text">テキスト (Text)</option>
                    <option value="number">数値 (Number)</option>
                    <option value="date">日付 (Date)</option>
                 </select>
              </div>
              <div class="col-auto">
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="removeField(index)"
                  :disabled="newTableFields.length <= 1"
                >
                  削除
                </button> <!-- Remove -->
              </div>
            </div>
            <button type="button" class="btn btn-outline-primary btn-sm mt-2" @click="addField">
              <i class="bi bi-plus-circle"></i> フィールド追加
            </button> <!-- Add Field -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateTableModal">キャンセル</button> <!-- Cancel -->
            <button type="button" class="btn btn-primary" @click="createTable">テーブル作成</button> <!-- Create Table -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import axios from 'axios'; // axios をインポート

// Assuming Bootstrap Icons are available, if not, text can be used for buttons.
// 例: <i class="bi bi-trash"></i> は "削除" に置き換え可能です

interface Field {
  name: string;
  type: 'text' | 'number' | 'date'; // Added type for basic input handling
}

interface Table {
  id: number | string; // バックエンドが生成するIDは文字列の場合もあるため string も許容
  name: string;
  fields: Field[];
  data: Record<string, any>[]; // Each object in data is a row
}

// APIのエンドポイント
const API_URL = 'http://localhost:3002/tables'; // tables.json 専用サーバーのエンドポイントに変更

const tables = ref<Table[]>([]);
const selectedTableId = ref<number | null>(null);

const showCreateTableModal = ref(false);
const newTableName = ref('');
const newTableFields = ref<Field[]>([{ name: '', type: 'text' }]);

// For data input form
const newRowData = ref<Record<string, any>>({});

const selectedTable = computed(() => {
  return tables.value.find(t => t.id === selectedTableId.value) || null;
});

// --- API連携のための関数 ---
const fetchTables = async () => {
  try {
    const response = await axios.get<Table[]>(API_URL);
    tables.value = response.data;
    if (tables.value.length > 0 && !selectedTableId.value) {
      // Optionally select the first table if none is selected
      // selectTable(tables.value[0].id);
    }
  } catch (error) {
    console.error('テーブルの読み込みに失敗しました:', error);
    alert('テーブルの読み込みに失敗しました。');
  }
};

// Watch selectedTable to reset newRowData and prepare it for the new table structure
watch(selectedTable, (currentTable) => {
  if (currentTable) {
    const initialData: Record<string, any> = {};
    currentTable.fields.forEach(field => {
      // Set default value based on type for better UX
      if (field.type === 'number') initialData[field.name] = null; 
      else if (field.type === 'date') initialData[field.name] = ''; 
      else initialData[field.name] = '';
    });
    newRowData.value = initialData;
  } else {
    newRowData.value = {};
  }
}, { immediate: true });

// コンポーネントマウント時にテーブルを読み込む
onMounted(() => {
  fetchTables();
});

const openCreateTableModal = () => {
  newTableName.value = '';
  newTableFields.value = [{ name: '', type: 'text' }];
  showCreateTableModal.value = true;
};

const closeCreateTableModal = () => {
  showCreateTableModal.value = false;
};

const addField = () => {
  newTableFields.value.push({ name: '', type: 'text' });
};

const removeField = (index: number) => {
  if (newTableFields.value.length > 1) {
    newTableFields.value.splice(index, 1);
  }
};

const createTable = async () => {
  if (!newTableName.value.trim()) {
    alert('テーブル名を入力してください。'); // Table name cannot be empty!
    return;
  }
  if (newTableFields.value.some(f => !f.name.trim())) {
    alert('すべてのフィールド名を入力してください。'); // All field names must not be empty!
    return;
  }
  const fieldNames = newTableFields.value.map(f => f.name.trim());
  if (new Set(fieldNames).size !== fieldNames.length) {
    alert('フィールド名は重複できません。'); // Field names must be unique!
    return;
  }
  if (tables.value.some(t => t.name === newTableName.value.trim())) {
    alert('テーブル名は既に存在します。'); // Table name already exists!
    return;
  }

  const newTableData = {
    name: newTableName.value.trim(),
    fields: newTableFields.value.map(f => ({ name: f.name.trim(), type: f.type })),
    data: [],
  };

  try {
    const response = await axios.post<Table>(API_URL, newTableData);
    tables.value.push(response.data);
    closeCreateTableModal();
    selectTable(response.data.id);
  } catch (error) {
    console.error('テーブルの作成に失敗しました:', error);
    alert('テーブルの作成に失敗しました。');
  }
};

const selectTable = (tableId: number) => {
  selectedTableId.value = tableId;
};

const addDataToTable = async () => {
  if (!selectedTable.value) {
    alert('追加先のテーブルが選択されていません。');
    return;
  }
  const currentTable = selectedTable.value;

  const rowToAdd = { ...newRowData.value };

  selectedTable.value.fields.forEach(field => {
    if (field.type === 'number' && rowToAdd[field.name] !== null && rowToAdd[field.name] !== '') {
      const numVal = parseFloat(rowToAdd[field.name]);
      rowToAdd[field.name] = isNaN(numVal) ? null : numVal; // Store as number or null if invalid
    }
  });

  const updatedData = [...currentTable.data, rowToAdd];

  try {
    const response = await axios.put<Table>(`${API_URL}/${currentTable.id}`, { ...currentTable, data: updatedData });
    const tableIndex = tables.value.findIndex(t => t.id === currentTable.id);
    if (tableIndex !== -1) {
      tables.value[tableIndex] = response.data;
    }
    // newRowData をリセット
    const initialDataReset: Record<string, any> = {};
    currentTable.fields.forEach(field => {
      if (field.type === 'number') initialDataReset[field.name] = null;
      else if (field.type === 'date') initialDataReset[field.name] = '';
      else initialDataReset[field.name] = '';
    });
    newRowData.value = initialDataReset;
  } catch (error) {
    console.error('データの追加に失敗しました:', error);
    alert('データの追加に失敗しました。');
  }
};

const confirmDeleteTable = async (tableId: number | string) => {
  const tableToDelete = tables.value.find(t => t.id === tableId);
  if (tableToDelete && confirm(`テーブル「${tableToDelete.name}」を削除してもよろしいですか？この操作は元に戻せません。`)) { // Are you sure you want to delete table "..."? This action cannot be undone.
    try {
      await axios.delete(`${API_URL}/${tableId}`);
      tables.value = tables.value.filter(t => t.id !== tableId);
      if (selectedTableId.value === tableId) {
        selectedTableId.value = null;
      }
    } catch (error) {
      console.error('テーブルの削除に失敗しました:', error);
      alert('テーブルの削除に失敗しました。');
    }
  }
};

const deleteDataRow = async (rowIndex: number) => {
  if (!selectedTable.value) {
     alert('行を削除するテーブルが選択されていません。');
     return;
  }
  const currentTable = selectedTable.value;
  if (confirm('この行データを削除してもよろしいですか？')) { // Are you sure you want to delete this data row?
    const updatedData = [...currentTable.data];
    updatedData.splice(rowIndex, 1);
    try {
      const response = await axios.put<Table>(`${API_URL}/${currentTable.id}`, { ...currentTable, data: updatedData });
      const tableIndex = tables.value.findIndex(t => t.id === currentTable.id);
      if (tableIndex !== -1) {
        tables.value[tableIndex] = response.data;
      }
    } catch (error) {
      console.error('行データの削除に失敗しました:', error);
      alert('行データの削除に失敗しました。');
    }
  }
};

</script>

<style scoped>
/* Basic modal styling if not using Bootstrap's JS for full modal behavior */
.modal.d-block {
  background-color: rgba(0,0,0,0.5);
}
.modal-dialog {
  margin-top: 5vh; /* Adjust as needed */
}
.list-group-item-action.active {
  z-index: 2; /* Ensure active item is above others for box-shadow etc. */
}
.table-responsive {
  max-height: 400px; /* Example max height for scrollable table data */
  overflow-y: auto;
}
/* Add some spacing for buttons in list */
.list-group-item .btn {
  margin-left: 0.5rem;
}
</style>