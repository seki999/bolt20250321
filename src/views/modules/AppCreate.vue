<template>
  <div class="main-layout">
    <!-- 左側：コンポーネントリスト -->
    <aside class="sidebar">
      <div class="component-section" v-show="appToggle">
        <h5>データ入力</h5>
        <div class="component-list">
          <!-- コンポーネントドラッグエリア -->
          <div
            class="component-box"
            v-for="comp in inputComponents"
            :key="comp"
            @mousedown="startDrag(comp, 'input', $event)"
          >
            {{ comp }}
          </div>
        </div>
      </div>
      <div class="component-section" v-show="appToggle">
        <h5>データ処理</h5>
        <div class="component-list">
          <div
            class="component-box"
            v-for="comp in processComponents"
            :key="comp"
            @mousedown="startDrag(comp, 'process', $event)"
          >
            {{ comp }}
          </div>
        </div>
      </div>
      <div class="component-section" v-show="appToggle">
        <h5>データ出力</h5>
        <div class="component-list">
          <div
            class="component-box"
            v-for="comp in outputComponents"
            :key="comp"
            @mousedown="startDrag(comp, 'output', $event)"
          >
            {{ comp }}
        </div>
      </div>
      </div>
      <!-- 下部の隠せるボックス -->
      <div class="bottom-panel" :class="{ hidden: hideBottomPanel, expanded: isExpanded }">
        <div class="panel-tabs-header" style="display: flex; align-items: center; gap: 12px; padding: 8px 12px 0 12px;">
          <span style="cursor:pointer;" @click="hideBottomPanel = !hideBottomPanel">▼</span>
          <ul class="tab-list" style="display: flex; gap: 12px; margin: 0; padding: 0; list-style: none;">
            <li :class="{ active: activeTab === 'console' }" @click="activeTab = 'console'">コンソール</li>
            <li :class="{ active: activeTab === 'data' }" @click="activeTab = 'data'">データ</li>
            <li :class="{ active: activeTab === 'log' }" @click="activeTab = 'log'">ログ</li>
          </ul>
        </div>
        <div class="bottom-panel-content" v-if="!hideBottomPanel">
          <!-- 左側サイドバー -->
          <aside class="bottom-sidebar">
            <!-- ログレベル -->
            <div class="sidebar-section">
              <div class="sidebar-section-header" @click="logLevelFold = !logLevelFold">
                <span style="cursor:pointer;">▲</span>
                <span>ログレベル</span>
              </div>
              <div v-show="!logLevelFold" class="sidebar-section-body">
                <label><input type="checkbox" v-model="logLevels.debug" /> debug</label><br />
                <label><input type="checkbox" v-model="logLevels.info" /> info</label><br />
                <label><input type="checkbox" v-model="logLevels.warning" /> warning</label><br />
                <label><input type="checkbox" v-model="logLevels.error" /> error</label>
              </div>
            </div>
            <!-- コンポーネント -->
            <div class="sidebar-section">
              <div class="sidebar-section-header" @click="componentFold = !componentFold">
                <span style="cursor:pointer;">▲</span>
                <span>コンポーネント</span>
              </div>
              <div v-show="!componentFold" class="sidebar-section-body">
                <input type="text" class="search-box" placeholder="処理名" v-model="componentSearch" /><br />
                <label><input type="checkbox" v-model="componentChecks.code" /> コード実行</label><br />
                <label><input type="checkbox" v-model="componentChecks.api" /> API呼び出し</label>
              </div>
            </div>
          </aside>
          <!-- 右側タブ内容 -->
          <div class="tab-content-area">
            <div v-if="activeTab === 'console'"></div>
            <div v-if="activeTab === 'data'"></div>
            <div v-if="activeTab === 'log'"></div>
          </div>
        <div class="tab-content" v-if="!hideBottomPanel">
          <div v-if="activeTab === 'console'"></div>
          <div v-if="activeTab === 'data'"></div>
          <div v-if="activeTab === 'log'"></div>
        </div>
      </div>
      </div>
    </aside>
    <!-- 中央エリア -->
    <main
      class="center-area"
      ref="centerArea"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
    <!-- アプリ制御パネル -->
      <div class="app-control-panel">
        <div class="app-info">
          <span>{{ appName }}</span>
          <span>{{ appStatus }}</span>
        </div>
        <div class="app-actions">
          <!-- トグルスイッチ -->
          <label class="switch">
            <input type="checkbox" v-model="appToggle" />
            <span class="slider round"></span>
          </label>
          <span>変更</span>
          <button
            class="control-button"
            :style="{ visibility: appToggle ? 'visible' : 'hidden' }"
            @click="onStart"
          >起動</button>
          <button
            class="control-button"
            :style="{ visibility: appToggle ? 'visible' : 'hidden' }"
            @click="onStop"
          >停止</button>
        </div>
      </div>
      <div
        v-for="item in droppedItems"
        :key="item.id"
        class="draggable-item"
        :data-id="item.id"
        :ref="(el) => initializeDraggable(el, item)"
        :style="{ left: item.x + 'px', top: item.y + 'px', position: 'absolute' }"
      >
        <button class="close-button" @click="removeItem(item.id)" @mousedown.stop>
          &times;
        </button>
        <div
          v-if="item.type === 'process' || item.type === 'output'"
          class="connection-point top"
           :data-id="item.id"
          :data-point="'top'"
          @mousedown.stop="startLineDrag(item, 'top', $event)"
        ></div>
        <div
          v-if="item.type === 'process' || item.type === 'input'"
          class="connection-point bottom"
          :data-id="item.id"
          :data-point="'bottom'"
          @mousedown.stop="startLineDrag(item, 'bottom', $event)"
        ></div>
        {{ item.name }}
      </div>
      <!-- ドラッグプレビュー -->
      <div
        v-if="dragPreview"
        class="draggable-item preview"
        :style="{ left: dragPreview.x + 'px', top: dragPreview.y + 'px', position: 'fixed', pointerEvents: 'none', opacity: 0.7 }"
      >
        {{ dragPreview.name }}
      </div>
      <svg class="connections-svg" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;">
        <g v-for="(conn, idx) in connections" :key="idx" @mouseenter="hoveredConnectionIndex = idx" @mouseleave="hoveredConnectionIndex = null">
          <!-- ホバー用のヒットボックス線 -->
          <line
            :x1="getPointPosition(conn.fromId, conn.fromPoint).x"
            :y1="getPointPosition(conn.fromId, conn.fromPoint).y"
            :x2="getPointPosition(conn.toId, conn.toPoint).x"
            :y2="getPointPosition(conn.toId, conn.toPoint).y"
            stroke="transparent"
            stroke-width="10"
            style="cursor: pointer;"
          />
          <!-- 表示される線 -->
          <line
            :x1="getPointPosition(conn.fromId, conn.fromPoint).x"
            :y1="getPointPosition(conn.fromId, conn.fromPoint).y"
            :x2="getPointPosition(conn.toId, conn.toPoint).x"
            :y2="getPointPosition(conn.toId, conn.toPoint).y"
            stroke="#007bff"
            stroke-width="2"
            style="pointer-events: none;"
          />
          <!-- 削除ボタン -->
          <g
            v-if="hoveredConnectionIndex === idx"
            :transform="`translate(${ (getPointPosition(conn.fromId, conn.fromPoint).x + getPointPosition(conn.toId, conn.toPoint).x) / 2 }, ${ (getPointPosition(conn.fromId, conn.fromPoint).y + getPointPosition(conn.toId, conn.toPoint).y) / 2 })`"
            @click.stop="removeConnection(idx)"
            style="cursor: pointer;"
          >
            <circle r="10" fill="#ff4d4d"></circle>
            <text fill="white" text-anchor="middle" dy=".3em" style="pointer-events: none; font-size: 16px; font-weight: bold;">&times;</text>
          </g>
        </g>
        <!-- ドラッグ中の線 -->
        <line
          v-if="draggingLine"
          :x1="draggingLine.startX"
          :y1="draggingLine.startY"
          :x2="draggingLine.currentX"
          :y2="draggingLine.currentY"
          stroke="#007bff"
          stroke-width="2"
          stroke-dasharray="4"
          style="pointer-events: none;"
        />
        <g v-for="(conn, idx) in connections" :key="idx">
          <!-- ...既存の線... -->
          <g v-if="running && connections.length > 0">
            <circle
              :cx="getFlowPoint(connections[flowIndex], flowProgress).x"
              :cy="getFlowPoint(connections[flowIndex], flowProgress).y"
              r="6"
              fill="#ff9800"
              opacity="0.8"
            />
          </g>
        </g>
      </svg>
    </main>
    <!-- 右側：コンポーネント詳細設定 -->
    <aside class="detail-area">
        22222
      <!-- ここは空白 -->
    </aside>
  </div>
</template>

<script setup lang="ts">
// サイドバー下部パネルの表示/非表示状態
import { ref } from 'vue'
import interact from 'interactjs'
// New refs for app control panel
const appToggle = ref(false); // Default to closed
const appName = ref('My New App'); // Placeholder
const appStatus = ref('停止済み'); // Placeholder

// 下部パネルの表示/非表示
const hideBottomPanel = ref(false)
const isExpanded = ref(false)
const activeTab = ref('console')

// ログレベルの折りたたみ状態
const logLevelFold = ref(false)
// ログレベルのチェック状態
const logLevels = ref({
  debug: false,
  info: false,
  warning: false,
  error: false
})

// コンポーネントの折りたたみ状態
const componentFold = ref(false)
// 検索ボックス
const componentSearch = ref('')
// コンポーネントのチェック状態
const componentChecks = ref({
  code: false,
  api: false
})

// サンプルデータ（左側のコンポーネントリスト）
const inputComponents = [
  'Kafka',
  'MQTT',
  'API呼び出し',
  'gRPC Server Streaming',
  'スケジュール'
];
const processComponents = [
  'コード実行',
  'データ結合',
  'フィルター',
  '配列を要素ごとに取り出す'
];
const outputComponents = [
  'Kafka',
  'MQTT',
  'HTTP'
];

// ドラッグ中のコンポーネント名とタイプ
let dragCompName: string | null = null;
let dragCompType: DroppedItem['type'] | null = null;

// ドロップされたアイテムの型定義
interface DroppedItem {
  id: number;
  name: string;
  x: number;
  y: number;
  type: 'input' | 'process' | 'output'; // コンポーネントの種類
}

// 接続線の型定義
interface Connection {
  fromId: number;
  fromPoint: 'top' | 'bottom';
  toId: number;
  toPoint: 'top' | 'bottom';
}

// ドロップされたアイテムリスト
const droppedItems = ref<DroppedItem[]>([]);
// 接続線リスト
const connections = ref<Connection[]>([]);

// ドラッグ中の状態管理
let dragging = false
const dragPreview = ref<{ name: string, x: number, y: number } | null>(null)

// 線をドラッグ中の状態
const draggingLine = ref<{
  fromId: number;
  fromPoint: 'top' | 'bottom';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
} | null>(null);

// ホバー中の接続インデックス
const hoveredConnectionIndex = ref<number | null>(null);

// 起動中かどうか
const running = ref(false);
const flowIndex = ref(0); // 現在流れているconnectionのインデックス
const flowProgress = ref(0); // 0～1の進捗

// 左側リストからドラッグ開始
function startDrag(comp: string, type: DroppedItem['type'], event: MouseEvent) {
  event.preventDefault()
  dragging = true
  dragCompName = comp
  dragCompType = type // コンポーネントのタイプを保存
  dragPreview.value = { name: comp, x: event.clientX, y: event.clientY }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// ドラッグ中のプレビュー位置更新
function onMouseMove(event: MouseEvent) {
  if (dragging && dragPreview.value) {
    dragPreview.value.x = event.clientX
    dragPreview.value.y = event.clientY
  }
}

// ドラッグ終了時の処理（中央エリアにドロップされたら追加）
function onMouseUp(event: MouseEvent) {
  if (dragging && dragCompName && dragCompType && dragPreview.value) {
    // 中央エリア内か判定
    const centerArea = document.querySelector('.center-area') as HTMLElement
    const rect = centerArea.getBoundingClientRect()
    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      droppedItems.value.push({
        id: Date.now() + Math.random(),
        name: dragCompName,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        type: dragCompType
      })
    }
  }
  dragging = false // ドラッグ状態をリセット
  dragCompName = null // コンポーネント名をリセット
  dragCompType = null // コンポーネントタイプをリセット
  dragPreview.value = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

// 中央エリアのコンポーネントをドラッグ可能にする
const initializeDraggable = (el: any, item: DroppedItem) => {
  if (el) {
    interact(el).draggable({
      // 小さい円（connection-point）からのドラッグを無視
      ignoreFrom: '.connection-point',
      listeners: {
        move(event) {
          // 小さい円からドラッグしている場合は、コンポーネントを移動しない
          if (
            event?.downEvent?.target?.classList?.contains('connection-point')
          ) {
            return;
          }
          item.x += event.dx;
          item.y += event.dy;
        }
      }
    });
  }
};

// コンポーネント削除（接続線も削除）
const removeItem = (itemId: number) => {
  droppedItems.value = droppedItems.value.filter(item => item.id !== itemId)
  // このアイテムに接続されている接続も削除
  connections.value = connections.value.filter(
    conn => conn.fromId !== itemId && conn.toId !== itemId
  );
}

// 小さい円から線をドラッグ開始
function startLineDrag(item: DroppedItem, point: 'top' | 'bottom', event: MouseEvent) {
  event.stopPropagation();
  // 円の中心座標を中央エリア基準で取得
  const circleRect = (event.target as HTMLElement).getBoundingClientRect();
  const centerArea = document.querySelector('.center-area') as HTMLElement;
  const areaRect = centerArea.getBoundingClientRect();
  const x = circleRect.left + circleRect.width / 2 - areaRect.left;
  const y = circleRect.top + circleRect.height / 2 - areaRect.top;
  draggingLine.value = {
    fromId: item.id,
    fromPoint: point,
    startX: x,
    startY: y,
    currentX: x,
    currentY: y,
  };
  window.addEventListener('mousemove', onLineDragMove);
  window.addEventListener('mouseup', onLineDragEnd);
}

// 線ドラッグ中のマウス移動
function onLineDragMove(event: MouseEvent) {
  if (draggingLine.value) {
    const centerArea = document.querySelector('.center-area') as HTMLElement;
    const areaRect = centerArea.getBoundingClientRect();
    draggingLine.value.currentX = event.clientX - areaRect.left;
    draggingLine.value.currentY = event.clientY - areaRect.top;
  }
}

// 線ドラッグ終了時の処理
function onLineDragEnd(event: MouseEvent) {
  if (draggingLine.value) {
    const target = event.target as HTMLElement;
    // 他の小さい円の上で離した場合のみ接続
    if (
      target.classList.contains('connection-point') &&
      target.dataset.id &&
      target.dataset.point
    ) {
      const toId = Number(target.dataset.id);
      const toPoint = target.dataset.point as 'top' | 'bottom';
      // 自分自身の同じポイントには接続しない
      if (
        toId !== draggingLine.value.fromId ||
        toPoint !== draggingLine.value.fromPoint
      ) {
        connections.value.push({
          fromId: draggingLine.value.fromId,
          fromPoint: draggingLine.value.fromPoint,
          toId,
          toPoint,
        });
      }
    }
    draggingLine.value = null;
    window.removeEventListener('mousemove', onLineDragMove);
    window.removeEventListener('mouseup', onLineDragEnd);
  }
}

// 接続線の削除
function removeConnection(index: number) {
  connections.value.splice(index, 1);
  hoveredConnectionIndex.value = null;
}

// 小さい円の中心座標を中央エリア基準で取得
function getPointPosition(id: number, point: 'top' | 'bottom') {
  const el = document.querySelector(
    `.draggable-item[data-id="${id}"] .connection-point.${point}`
  ) as HTMLElement;
  const centerArea = document.querySelector('.center-area') as HTMLElement;
  if (el && centerArea) {
    const rect = el.getBoundingClientRect();
    const areaRect = centerArea.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - areaRect.left,
      y: rect.top + rect.height / 2 - areaRect.top,
    };
  }
  return { x: 0, y: 0 };
}

// アニメーション関連
function onStart() {
  if (connections.value.length === 0) return;
  running.value = true;
  flowIndex.value = 0;
  flowProgress.value = 0;
  animateFlow();
}

let flowTimer: number | null = null;
function animateFlow() {
  if (!running.value) return;
  // 速度を遅くするには増分を小さくする（例: 0.01）
  flowProgress.value += 0.01;
  if (flowProgress.value > 1) {
    flowProgress.value = 0;
    flowIndex.value++;
    if (flowIndex.value >= connections.value.length) {
      flowIndex.value = 0;
    }
  }
  flowTimer = requestAnimationFrame(animateFlow);
}

function onStop() {
  running.value = false;
  if (flowTimer) {
    cancelAnimationFrame(flowTimer);
    flowTimer = null;
  }
}

// データ流動アニメーションのポイント取得
function getFlowPoint(conn: Connection, progress: number) {
  const from = getPointPosition(conn.fromId, conn.fromPoint);
  const to = getPointPosition(conn.toId, conn.toPoint);
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
  };
}
</script>


<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh; /* または height: 100vh; */
  box-sizing: border-box;
}
.sidebar {
  width: 260px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  /* 下部の隠せるボックスの高さ分だけ下側に余白を追加 */
  padding-bottom: 120px; /* 下部パネルの高さに合わせて調整 */
  justify-content: flex-start;
  border-right: 1px solid #ddd;
  position: relative;
  margin-left: 0;   /* 左側の余白をなくす */
  padding-left: 0;
}
.component-section {
  padding: 16px 12px 0 12px;
}
.component-section h5 {
  margin-bottom: 8px;
  font-size: 15px;
  color: #333;
}
.component-section ul {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
}
.component-section li {
  padding: 4px 0 4px 12px;
  font-size: 14px;
  color: #555;
}
.bottom-panel {
  position: absolute; /* 追加：絶対配置で幅を制御 */
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw; /* 画面全体の幅に広げる */
  background: #e9ecef;
  border-top: 1px solid #ccc;
  transition: height 0.2s;
  z-index: 10;
}
.bottom-panel.hidden .panel-tabs {
  display: none;
}
.panel-header {
  cursor: pointer;
  padding: 8px 12px;
  font-size: 14px;
  background: #d1d5db;
  border-bottom: 1px solid #bbb;
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-tabs {
  padding: 0 12px 12px 12px;
}
.tab-list {
  display: flex;
  gap: 12px;
  margin: 8px 0;
  padding: 0;
  list-style: none;
}
.tab-list li {
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px 4px 0 0;
  background: #f8f9fa;
  color: #333;
}
.tab-list li.active {
  background: #fff;
  border-bottom: 2px solid #007bff;
  color: #007bff;
}
.tab-content {
  min-height: 120px;
  background: #fff;
  border-radius: 0 0 4px 4px;
  padding: 8px;
}
.center-area {
  background: #fff;
  width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
  margin-right: 25vw; /* detail-area の幅と同じだけ右にマージンを追加 */
}
.detail-area {
  position: fixed;
  top: 3%;
  right: 20px;
  height: 70vh;
  width: 25vw;
  background: #f8f9fa;
  /* 枠線を削除 */
  border: none;
  box-sizing: border-box;
  z-index: 100;
  overflow-y: auto;
}
.bottom-panel-content {
  display: flex;
  height: 100%;
}
.bottom-sidebar {
  width: 220px;
  background: #f4f6fa;
  border-right: 1px solid #ddd;
  padding: 10px 8px 0 8px;
  box-sizing: border-box;
}
.sidebar-section {
  margin-bottom: 18px;
  background: #f8f9fb;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}
.sidebar-section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  font-size: 15px;
  padding: 6px 8px;
  cursor: pointer;
  background: #e9ecef;
  border-radius: 4px 4px 0 0;
}
.sidebar-section-body {
  padding: 8px 12px 8px 24px;
  font-size: 14px;
}
.sidebar-section-body label {
  color: #222;
  font-weight: normal;
}
.search-box {
  width: 100%;
  margin-bottom: 8px;
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.tab-content-area {
  flex: 1;
  padding: 12px;
  background: #fff;
  min-height: 80px;
}
.component-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.component-box {
  border: 1.5px solid #ccc;
  border-radius: 6px;
  padding: 16px 12px;
  background: #fff;
  font-size: 15px;
  color: #222;
  width: 220px;
  box-sizing: border-box;
  cursor: grab;
}
.center-area {
  position: relative;
  flex: 1;
  background: #fff;
  min-height: 100vh;
  overflow: hidden;
}
.draggable-item {
  width: 220px;
  height: auto;
  padding: 16px 30px 16px 12px;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 6px;
  font-size: 15px;
  color: #222;
  text-align: left;
  line-height: normal;
  cursor: move;
  user-select: none;
  position: absolute;
  z-index: 10;
  box-sizing: border-box;
}
.draggable-item.preview {
  border-style: dashed;
  pointer-events: none;
  opacity: 0.7;
}
.detail-area {
  position: fixed;
  top: 10%;
  right: 20px;
  height: 80vh;
  width: 25vw;
  background: #f8f9fa;
  border: none;
  box-sizing: border-box;
  z-index: 100;
  overflow-y: auto;
}
.close-button {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #666;
  cursor: pointer;
  padding: 0;
  font-weight: bold;
}
.close-button:hover {
  color: #000;
}
.connection-point {
  position: absolute;
  width: 12px; /* 円のサイズ */
  height: 12px;
  background-color: #007bff; /* 青い円 */
  border: 1px solid #0056b3;
  border-radius: 50%; /* 円形にする */
  transform: translateX(-50%); /* 水平方向に中央揃え */
  left: 50%;
  z-index: 11; /* アイテムの上、必要に応じて閉じるボタンの下 */
}
.connection-point.top {
  top: -6px; /* 高さが半分外側になるように */
}
.connection-point.bottom {
  bottom: -6px; /* 高さが半分外側になるように */
}
.connections-svg {
  pointer-events: none;
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 5;
}
.app-control-panel {
  position: absolute;
  top: 20px; /* Adjust as needed */
  left: 20px; /* Adjust as needed */
  background: #f0f8ff; /* Light blue background */
  border: 1px solid #add8e6; /* Light blue border */
  border-radius: 8px;
  padding: 15px 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 20; /* Ensure it's above other elements */
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.app-info {
  display: flex;
  justify-content: space-between;
}

.app-info span,
.app-actions span {
  font-size: 14px;
  color: #333;
  margin-right: 15px;
}

.app-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px; /* 必要に応じて調整 */
}

.control-button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.control-button:first-of-type { /* 起動ボタン */
  background-color: #28a745; /* Green */
  color: white;
}

.control-button:last-of-type { /* 停止ボタン */
  background-color: #dc3545; /* Red */
  color: white;
}

.control-button:hover {
  opacity: 0.9;
}

/* Toggle Switch Styles */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(20px);
  -ms-transform: translateX(20px);
  transform: translateX(20px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 20px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>