import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3100; // 新しいポートを使用します。例: 3100

app.use(cors()); // すべてのオリジンからのリクエストを許可します。本番環境ではより厳格なルールを設定する必要があります。

// UploadFiles ディレクトリが存在することを確認します
const uploadDir = path.join(__dirname, 'UploadFiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multerのファイル保存を設定します
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // ファイルの保存パス
  },
  filename: function (req, file, cb) {
    console.log('[UPLOAD_SERVER_DEBUG] Original filename from multer:', file.originalname);
    cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8')); // latin1からUTF-8へ強制的に変換してみる
  }
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 例: ファイルサイズを10MBに制限します
});

// ファイルアップロードを処理するための /api/upload ルートを定義します
// 'file' はフロントエンドの FormData.append('file', fileToUpload) の 'file' に対応します
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'ファイルがアップロードされていません。' });
  }
  // ファイルアップロード成功
  console.log(`File uploaded: ${req.file.filename} to ${req.file.path}`);
  res.send({
    message: 'ファイルが正常にアップロードされました！',
    filename: req.file.filename,
    path: req.file.path, // サーバー上のファイルの完全なパス
    url: `/UploadFiles/${encodeURIComponent(req.file.filename)}` // オプション: フロントエンドがアクセスするための相対URLを提供します (UploadFilesが静的サービスの場合)
  });
}, (error, req, res, next) => {
  // Multerエラー処理
  if (error instanceof multer.MulterError) {
    // アップロード中にMulterエラーが発生しました。
    console.error('Multer error:', error);
    return res.status(400).send({ message: `Multerエラー: ${error.message}` });
  } else if (error) {
    // アップロード中に不明なエラーが発生しました。
    console.error('不明なアップロードエラー:', error);
    return res.status(500).send({ message: `アップロード中の不明なエラー: ${error.message}` });
  }
  // すべて問題ありませんでした。
  next();
});

// API endpoint to list files in UploadFiles directory
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadDir);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadDir, file);
        const stats = await fs.promises.stat(filePath);
        return {
          name: file,
          // birthtimeが利用可能な場合はそれを使用し、そうでない場合はmtimeを使用します。ISO文字列としてフォーマットします。
          creationDate: (stats.birthtimeMs ? new Date(stats.birthtimeMs) : new Date(stats.mtimeMs)).toISOString(),
          size: stats.size, // サイズ (バイト単位)
          url: `/UploadFiles/${encodeURIComponent(file)}`, // 直接ダウンロード用のURL
        };
      })
    );
    res.json(fileDetails);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).send({ message: 'ファイルのリストの取得に失敗しました。' });
  }
});

// ファイルを削除するためのAPIエンドポイント
app.delete('/api/files/:filename', async (req, res) => {
  const filename = req.params.filename;
  // 基本的なサニタイズ: パストラバーサルを防ぎます。
  // ファイル名に '..' やスラッシュが含まれていないことを確認します。
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).send({ message: '無効なファイル名です。' });
  }

  const filePath = path.join(uploadDir, filename);

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      console.log(`ファイルが削除されました: ${filename} (Path: ${filePath})`);
      res.send({ message: `ファイル "${filename}" が正常に削除されました。` });
    } else {
      res.status(404).send({ message: 'ファイルが見つかりません。' });
    }
  } catch (error) {
    console.error(`ファイル "${filename}" の削除中にエラーが発生しました:`, error);
    res.status(500).send({ message: `ファイル "${filename}" の削除に失敗しました。` });
  }
});

// オプション: アップロードされたファイルにURL経由で直接アクセスできるようにしたい場合は、静的ファイルサービスを設定できます
// 例: http://localhost:3100/UploadFiles/yourfile.pdf
app.use('/UploadFiles', express.static(uploadDir, {
  setHeaders: (res, path, stat) => {
    // 静的ファイルに対してもContent-TypeでUTF-8を指定することを試みる（通常はmimeタイプから自動だが、ファイル名表示のため）
    // res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(path.basename(path))}`); // これはダウンロード用
  }
  }));

app.listen(port, () => {
  console.log(`アップロードサーバーが http://localhost:${port} で実行中です`);
  console.log(`ファイルは ${uploadDir} にアップロードされます`);
  console.log(`アップロードされたファイルは http://localhost:${port}/UploadFiles/<filename> でアクセス可能です`);
});
