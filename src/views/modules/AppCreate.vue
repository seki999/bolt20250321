<template>
  <div class="main-layout">
    <!-- 左側：コンポーネントリスト -->
    <aside class="sidebar">
      <div class="component-section">
        <h5>データ入力</h5>
        <div class="component-list">
          <div class="component-box">Kafka</div>
          <div class="component-box">MQTT</div>
          <div class="component-box">API呼び出し</div>
          <div class="component-box">gRPC Server Streaming</div>
          <div class="component-box">スケジュール</div>
        </div>
      </div>
      <div class="component-section">
        <h5>データ処理</h5>
        <div class="component-list">
          <div class="component-box">コード実行</div>
          <div class="component-box">データ結合</div>
          <div class="component-box">フィルター</div>
          <div class="component-box">配列を要素ごとに取り出す</div>
        </div>
      </div>
      <div class="component-section">
        <h5>データ出力</h5>
        <div class="component-list">
          <div class="component-box">Kafka</div>
          <div class="component-box">MQTT</div>
          <div class="component-box">HTTP</div>
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
    <main class="center-area">
      <!-- ここは空白 -->
    </main>
    <!-- 右側：コンポーネント詳細設定 -->
    <aside class="detail-area">
      <!-- ここは空白 -->
    </aside>
  </div>
</template>

<script setup lang="ts">
// サイドバー下部パネルの表示/非表示状態
import { ref } from 'vue'
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
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
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
  flex: 1;
  background: #fff;
}
.detail-area {
  width: 320px;
  background: #f8f9fa;
  border-left: 1px solid #ddd;
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
  border: 1px solid #ccc; /* さらに薄いグレー */
  border-radius: 6px;
  padding: 16px 12px;
  background: #fff;
  font-size: 15px;
  color: #222;
  width: 220px;
  box-sizing: border-box;
}
</style>