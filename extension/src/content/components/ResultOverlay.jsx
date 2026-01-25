//就是照我網站上bendocard的樣式做的

import React from "react";
//把BendoCard元件引進來
import BendoCard from './BendoCard.jsx'; 

//寫在jsx裡面的css樣式
const styles = {
  container: {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "380px", // 稍微縮小一點點比較精緻
    maxHeight: "85vh",
    backgroundColor: "white",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)", // 加深陰影更有浮空感
    borderRadius: "12px",
    zIndex: 2147483647,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontSize: "14px", // ★ 設定基準字體大小，讓卡片內容相對縮小
    border: "1px solid #eaeaea",
  },
  header: {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
  },
  closeBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "20px",
    color: "#999",
    padding: "0 4px",
    lineHeight: "1",
  },
  content: {
    padding: "0",
    overflowY: "auto",
  },
};


const ResultOverlay = ({ bendoData, onClose }) => {

  // 實作朗讀功能 (先用瀏覽器本來就有的 SpeechSynthesis)
  const handleSpeak = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel(); // 先停止之前的發音
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP"; // 設定日文
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={styles.container}>
      {/* 標題列 */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🍱</span>
          <h3 style={styles.title}>查詢結果</h3>
        </div>
        <button style={styles.closeBtn} onClick={onClose} title="關閉">
          ×
        </button>
      </div>

      {/* 內容區 */}
      <div style={styles.content}>
        <BendoCard
          bendo={bendoData}
          // deleteSupabaseItem 已移除，不需要傳功能進去了
          howToSpeech={handleSpeak}
        />
      </div>
    </div>
  );
};

export default ResultOverlay;