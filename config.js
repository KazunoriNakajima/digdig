// 設定を記載しておくクラス
class Config {
}
Config.digImgWidth = 40; // でぃぐ画像の幅
Config.digImgHeight = 40; // でぃぐ画像の高さ

Config.fontHeight = 33;

Config.stageCols = 6; // ステージの横の個数
Config.stageRows = 12; // ステージの縦の個数

// フィールドサイズ追加
// 高さが全部入るように調整
Config.digImgHeight = (window.innerHeight-Config.fontHeight)/Config.stageRows
Config.digImgWidth = Config.digImgHeight;

Config.stageBackgroundColor = '#ffffff'; // ステージの背景色
Config.scoreBackgroundColor = '#24c0bb'; // スコアの背景色

Config.freeFallingSpeed = 16; // 自由落下のスピード
Config.eraseDigCount = 4; // 何個以上揃ったら消えるか
Config.eraseDigCountForUrara = 5; // Uraraさんが何個以上揃ったら消えるか
Config.eraseAnimationDuration = 30; // 何フレームででぃぐを消すか

Config.digColors = 5; // 何色のでぃぐを使うか
Config.playerFallingSpeed = 0.9; // プレイ中の自然落下のスピード
Config.playerFallingSpeedForTsubasa = 5; // Tsubasaさんのプレイ中の自然落下のスピード
Config.playerDownSpeed = 15; // プレイ中の下キー押下時の落下スピード
Config.playerGroundFrame = 20; // 何フレーム接地したらでぃぐを固定するか
Config.playerMoveFrame = 10; // 左右移動に消費するフレーム数
Config.playerRotateFrame = 10; // 回転に消費するフレーム数

Config.zenkeshiDuration = 150; // 全消し時のアニメーションミリセカンド
Config.gameOverFrame = 3000; // ゲームオーバー演出のサイクルフレーム
