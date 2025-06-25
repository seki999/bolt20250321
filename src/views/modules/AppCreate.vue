<template>
  <div class="main-layout">
    <!-- 左側：コンポーネントリスト -->
    <aside class="sidebar">
      <div class="component-section">
        <h5>データ入力</h5>
        <div class="component-list">
          <!-- 组件拖拽区域 -->
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
      <div class="component-section">
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
      <div class="component-section">
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
      <!-- 拖拽预览 -->
      <div
        v-if="dragPreview"
        class="draggable-item preview"
        :style="{ left: dragPreview.x + 'px', top: dragPreview.y + 'px', position: 'fixed', pointerEvents: 'none', opacity: 0.7 }"
      >
        {{ dragPreview.name }}
      </div>
      <svg class="connections-svg" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:5;">
        <g v-for="(conn, idx) in connections" :key="idx" @mouseenter="hoveredConnectionIndex = idx" @mouseleave="hoveredConnectionIndex = null">
          <!-- Hitbox line for hover -->
          <line
            :x1="getPointPosition(conn.fromId, conn.fromPoint).x"
            :y1="getPointPosition(conn.fromId, conn.fromPoint).y"
            :x2="getPointPosition(conn.toId, conn.toPoint).x"
            :y2="getPointPosition(conn.toId, conn.toPoint).y"
            stroke="transparent"
            stroke-width="10"
            style="cursor: pointer;"
          />
          <!-- Visible line -->
          <line
            :x1="getPointPosition(conn.fromId, conn.fromPoint).x"
            :y1="getPointPosition(conn.fromId, conn.fromPoint).y"
            :x2="getPointPosition(conn.toId, conn.toPoint).x"
            :y2="getPointPosition(conn.toId, conn.toPoint).y"
            stroke="#007bff"
            stroke-width="2"
            style="pointer-events: none;"
          />
          <!-- Delete button -->
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
        <!-- 拖动中的线 -->
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

// サンプルデータ
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
// ドラッグ中のコンポーネント
// ドラッグ中のコンポーネント名
let dragCompName: string | null = null;
let dragCompType: DroppedItem['type'] | null = null;

// Define the interface for a dropped item
interface DroppedItem {
  id: number;
  name: string;
  x: number;
  y: number;
  type: 'input' | 'process' | 'output'; // Add this property
}

interface Connection {
  fromId: number;
  fromPoint: 'top' | 'bottom';
  toId: number;
  toPoint: 'top' | 'bottom';
}

// ドロップされたアイテムリスト
const droppedItems = ref<DroppedItem[]>([]);
const connections = ref<Connection[]>([]);

// ドラッグ中の状態
let dragging = false
const dragPreview = ref<{ name: string, x: number, y: number } | null>(null)

// 新しいリアクティブな参照を追加
const draggingLine = ref<{
  fromId: number;
  fromPoint: 'top' | 'bottom';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
} | null>(null);

const hoveredConnectionIndex = ref<number | null>(null);

// ドラッグ開始
function startDrag(comp: string, type: DroppedItem['type'], event: MouseEvent) {
  event.preventDefault()
  dragging = true
  dragCompName = comp
  dragCompType = type // 保存组件的类型
  dragPreview.value = { name: comp, x: event.clientX, y: event.clientY }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// ドラッグ中
function onMouseMove(event: MouseEvent) {
  if (dragging && dragPreview.value) {
    dragPreview.value.x = event.clientX
    dragPreview.value.y = event.clientY
  }
}

// ドラッグ終了
function onMouseUp(event: MouseEvent) { // 移除 componentType 声明
  if (dragging && dragCompName && dragCompType && dragPreview.value) { // 确保 dragCompType 已设置
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
        name: dragCompName, // 使用 dragCompName
        x: event.clientX - rect.left, // Calculate relative position
        y: event.clientY - rect.top,  // Calculate relative position
        type: dragCompType // 直接使用保存的类型
      })
    }
  }
  dragging = false // 重置拖拽状态
  dragCompName = null // 重置组件名称
  dragCompType = null // 重置组件类型
  dragPreview.value = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const initializeDraggable = (el: any, item: DroppedItem) => {
  if (el) {
    interact(el).draggable({
      ignoreFrom: '.connection-point', // 忽略从 .connection-point 元素开始的拖拽
      listeners: {
        move(event) {
          // 如果是从小圆圈拖动，不移动组件
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

const removeItem = (itemId: number) => {
  droppedItems.value = droppedItems.value.filter(item => item.id !== itemId)
  // Also remove connections attached to this item
  connections.value = connections.value.filter(
    conn => conn.fromId !== itemId && conn.toId !== itemId
  );
}

function startLineDrag(item: DroppedItem, point: 'top' | 'bottom', event: MouseEvent) {
  event.stopPropagation();
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

function onLineDragMove(event: MouseEvent) {
  if (draggingLine.value) {
    const centerArea = document.querySelector('.center-area') as HTMLElement;
    const areaRect = centerArea.getBoundingClientRect();
    draggingLine.value.currentX = event.clientX - areaRect.left;
    draggingLine.value.currentY = event.clientY - areaRect.top;
  }
}

function onLineDragEnd(event: MouseEvent) {
  if (draggingLine.value) {
    const target = event.target as HTMLElement;
    if (
      target.classList.contains('connection-point') &&
      target.dataset.id &&
      target.dataset.point
    ) {
      const toId = Number(target.dataset.id);
      const toPoint = target.dataset.point as 'top' | 'bottom';
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

function removeConnection(index: number) {
  connections.value.splice(index, 1);
  hoveredConnectionIndex.value = null;
}

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
</script>


<style scoped>
.main-layout {
  display: flex;
  min-height: 100vh; /* 或 height: 100vh; */
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
  margin-right: 25vw; /* detail-areaの幅と同じだけ右にマージンを追加 */
}
.detail-area {
  position: fixed;
  top: 3%;
  right: 20px;
  height: 70vh;
  width: 25vw;
  background: #f8f9fa;
  /* 边框を削除 */
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
  width: 12px; /* Size of the circle */
  height: 12px;
  background-color: #007bff; /* Blue circle */
  border: 1px solid #0056b3;
  border-radius: 50%; /* Make it a circle */
  transform: translateX(-50%); /* Center horizontally */
  left: 50%;
  z-index: 11; /* Above the item, but below the close button if needed */
}
.connection-point.top {
  top: -6px; /* Half of its height to be outside */
}
.connection-point.bottom {
  bottom: -6px; /* Half of its height to be outside */
}
.connections-svg {
  pointer-events: none;
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 5;
}
</style>