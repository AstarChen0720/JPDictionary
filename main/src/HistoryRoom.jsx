//歷史變當儲藏室組件,是我網站的第二個頁面,用來顯示所有歷史便當塊,點下去就可以顯示詳細便當卡片





import BendoBlock from "./components/BendoBlock.jsx";
import BendoCard from "./components/BendoCard.jsx";
import { useState } from "react";

function HistoryRoom({ orderHistory, onBack, deleteBendo, howToSpeech }) {
  //拿一個筆記本來紀錄現在點擊的便當
  const [selectedBendo, setSelectedBendo] = useState(null);

  //拿一個筆記本來紀錄現在搜尋的關鍵字
  const [searchword, setSearchword] = useState("");

  return (
    <div
      style={{
        padding: "20px",
        height: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
      }}
    >
      {/* 頂部導覽列 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <button
          onClick={onBack}
          style={{ padding: "10px 20px", cursor: "pointer", fontSize: "16px" }}
        >
          ⬅ 回到櫃檯
        </button>

        {/* 搜尋框 (目前還沒接功能) */}
        <input
          type="text"
          placeholder="搜尋歷史便當..."
          value={searchword}
          onChange={(e) => setSearchword(e.target.value)}
          style={{ flex: 1, padding: "10px", fontSize: "16px" }}
        />
      </div>

      <h1>全歷史紀錄儲藏室</h1>

      {/* 如果有選到便當詳細bendoCard；沒有就便當塊 */}
      {selectedBendo ? (
        // === 顯示詳細大卡片模式 ===
        <div>
          {/* 按下取消選取，回到卡片狀態 */}
          <button
            onClick={() => setSelectedBendo(null)}
            style={{
              marginBottom: "10px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            ❌ 關閉詳情
          </button>
          <BendoCard
            bendo={selectedBendo}
            deleteSupabaseItem={deleteBendo}
            howToSpeech={howToSpeech}
          />
        </div>
      ) : (
        // === 顯示磚塊列表模式 (Grid 佈局) ===
        <div
          style={{
            display: "grid",
            // 魔法咒語: 自動填滿，每個最窄 150px (螢幕寬時一排多個，窄時一排少個)
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "15px",
          }}
        >
          {orderHistory.map((bendo) => (
            <BendoBlock
              key={bendo.id}
              bendo={bendo}
              onClick={(item) => setSelectedBendo(item)} // 點擊後把這個便當標記起來讓顯示詳情的函式
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryRoom;