import React from "react";

// 精簡版便當卡：只顯示最核心資訊 + 外部連結
function BendoCard({ bendo, howToSpeech }) {
  // 1. 智慧選取資料邏輯
  // 如果有 variations (新格式)，優先取第一組變體的第一個意思
  // 如果是舊格式，直接取根目錄資料
  const isNewFormat = bendo.variations && bendo.variations.length > 0;

  const displayData = isNewFormat
    ? {
        word: bendo.bendoName, // 標題
        reading: bendo.variations[0].reading,
        accent: bendo.variations[0].accent,
        meaning: bendo.variations[0].meanings[0].meaning,
        example_ja: bendo.variations[0].meanings[0].example_ja,
        example_cht: bendo.variations[0].meanings[0].example_cht,
        // 用來判斷是否要顯示 mora (音高)
        moraDetails: bendo.variations[0].moraDetails,
      }
    : {
        word: bendo.bendoName,
        reading: bendo.reading,
        accent: bendo.accent,
        meaning: bendo.chtMeaning,
        example_ja: bendo.example_ja,
        example_cht: bendo.example_cht,
        moraDetails: bendo.moraDetails,
      };

  // 生成主網站連結 (假設您的主網站網址是 localhost:5173，上線後記得改)
  // 如果您有部署網址，請換掉這裡
  const MAIN_SITE_URL = "https://jp-dctionary.vercel.app/";


  return (
    <div
      className="bendo-card-lite"
      style={{
        width: "100%",
        padding: "16px",
        boxSizing: "border-box",
        backgroundColor: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* 1. 頂部：單字 + 讀音 + 發音 */}
      <div style={{ borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 4px 0",
                fontSize: "2rem",
                color: "#1f2937",
                lineHeight: "1.2",
              }}
            >
              {displayData.word}
            </h2>
            <div
              onClick={() => howToSpeech(displayData.reading)}
              style={{
                color: "#6b7280",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              title="點擊發音"
            >
              <span>{displayData.reading}</span>
              {displayData.accent !== undefined && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    border: "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "0 6px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {displayData.accent}
                </span>
              )}
              <span>🔊</span>
            </div>
          </div>
          {/* 詞性標籤 (如果有) */}
          {bendo.partOfSpeech && (
            <span
              style={{
                fontSize: "0.8rem",
                background: "#f3f4f6",
                padding: "4px 8px",
                borderRadius: "6px",
                color: "#4b5563",
              }}
            >
              {bendo.partOfSpeech}
            </span>
          )}
        </div>
      </div>

      {/* 2. 中間：核心意思 */}
      <div>
        <h3
          style={{ margin: "0 0 4px 0", fontSize: "1.2rem", color: "#2563eb" }}
        >
          {displayData.meaning}
        </h3>
      </div>

      {/* 3. 中間：精選例句 */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "12px",
          borderRadius: "8px",
          borderLeft: "3px solid #3b82f6",
        }}
      >
        <p
          onClick={() => howToSpeech(displayData.example_ja)}
          style={{
            margin: "0 0 6px 0",
            fontSize: "1rem",
            color: "#111827",
            lineHeight: "1.5",
            cursor: "pointer",
          }}
          title="點擊朗讀例句"
        >
          {displayData.example_ja}
        </p>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>
          {displayData.example_cht}
        </p>
      </div>

      {/* 4. 底部：前往主網站按鈕 */}
      <a
        href={MAIN_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginTop: "8px",
          display: "block",
          textAlign: "center",
          backgroundColor: "#1a1a1a", // 深色按鈕更有質感
          color: "white",
          textDecoration: "none",
          padding: "10px",
          borderRadius: "6px",
          fontSize: "0.9rem",
          fontWeight: "bold",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#333")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#1a1a1a")}
      >
        查看詳細圖解與變體 ↗
      </a>
    </div>
  );
}

export default BendoCard;
