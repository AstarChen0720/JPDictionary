//歷史變當儲藏室組件,是我網站的第二個頁面,用來顯示所有歷史便當塊,點下去就可以顯示詳細便當卡片





import BendoBlock from "./components/BendoBlock.jsx";
import BendoCard from "./components/BendoCard.jsx";
import { useState } from "react";

function HistoryRoom({ orderHistory, onBack, deleteBendo, howToSpeech, updateBendo }) {
  //拿一個筆記本來紀錄現在點擊的便當
  const [selectedBendo, setSelectedBendo] = useState(null);

  //拿一個筆記本來紀錄現在搜尋的關鍵字
  const [searchword, setSearchword] = useState("");

  //紀錄你要複習幾個字(預設3個)
  const [wantReviewCount, setWantReviewCount] = useState(3);

  //紀錄你是否正在複習模式
  const [isReviewMode, setIsReviewMode] = useState(false);

  //紀錄你要複習的單字列表
  const [reviewList, setReviewList] = useState([]);

  //紀錄你複習到第幾個字了
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  //顯示你已經精通的便當數量
  const masteredBendoCount = orderHistory.filter((bendo) => bendo.isMastered).length||0;

  //顯示你還沒精通的便當數量
  const unmasteredBendoCount = orderHistory.filter((bendo) => !bendo.isMastered).length||0;


  //過濾便當清單,只顯示有包含搜尋關鍵字的便當
  const filiteredOrderHistory = orderHistory?.filter((bendo) => bendo.bendoName.includes(searchword));

  //複習SOP
  const startReviewSOP = () => {
    //取出有沒有精通的便當
    const rawBendo = orderHistory.filter((bendo) => !bendo.isMastered);

    //如果沒有便當就跳出提示
    if (rawBendo.length === 0) {
      alert("你已經複習完所有便當");
      return;
    }

    //洗牌演算法: 將陣列順序打亂
    let shuffled = [...rawBendo];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. 切出你要的數量,slice(起點位置, 終點位置),含頭不含尾,slice(0,2),他會取出第0和第1個元素,共取出兩個
    const readyForReview = shuffled.slice(0, wantReviewCount);

    //將準備好要複習的便當陣列存到筆記本裡
    setReviewList(readyForReview);
    //進入複習模式
    setIsReviewMode(true);
    //從第一個便當開始複習
    setCurrentReviewIndex(0);


  };

  //換下一張便當
  const goNextBendo = () => {
    //如果還有便當就繼續下一個
    if (currentReviewIndex < reviewList.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    }else {
      //如果已經是最後一個便當就結束複習模式
      setIsReviewMode(false);
      setReviewList([]);
      alert("本次複習結束");

    }
  }


  //按下已知道的處理:將狀態更新到supabase後換下一張
  const handleKnown = () => {
    //拿出現在正在看的便當
    const currentBendo = reviewList[currentReviewIndex]
    //把這個便當標記為已精通並更新supabase
    updateBendo(currentBendo.id, { isMastered: true });
    //換下一個便當
    goNextBendo();
  }

  // 按下"不知道"的處裡,就直接換下一張
  const handleUnknown = () => {
    goNextBendo();
  };


  return (
    <div
      style={{
        padding: "20px",
        height: "100vh",
        overflowY: "auto",
        boxSizing: "border-box",
        position: "relative",
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

        {/* 搜尋框  */}
        <input
          type="text"
          placeholder="搜尋歷史便當..."
          value={searchword}
          onChange={(e) => setSearchword(e.target.value)}
          style={{ flex: 1, padding: "10px", fontSize: "16px" }}
        />
      </div>

      {/* 複習介面 */}
      <div style={{ 
        marginBottom: "20px", padding: "15px", backgroundColor: "#e6f7ff", borderRadius: "8px",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px"
      }}>
        {/* 顯示已精通跟待複習單字數量 */}
        <div style={{ fontSize: "16px" }}>
          📊 狀態：
          <span 
          style={{ 
            color: "green", 
            fontWeight: "bold", 
            marginRight: "10px" }}
          >已精通 {masteredBendoCount}
          </span>
          <span 
          style={{ 
            color: "red", 
            fontWeight: "bold"}}
          >待複習 {unmasteredBendoCount}
          </span>
        </div>
        {/* 輸入要複習的數量 */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>我要複習</span>
          <input 
              type="number" 
              value={wantReviewCount} 
              onChange={(e) => setWantReviewCount(Number(e.target.value))}
              style={{ width: "50px", padding: "5px" }}
              min="1"
          />
          <span>個單字</span>
          <button 
                onClick={startReviewSOP}
                style={{ 
                  backgroundColor: "#1890ff",
                  color: "white", 
                  border: "none", 
                  padding: "8px 16px", 
                  borderRadius: "4px", 
                  cursor: "pointer", 
                  fontWeight: "bold"
                }}
            >
                🚀 開始複習
            </button>
        </div>
      </div>

      <h1>全歷史紀錄儲藏室</h1>

      {/* 如果有選到便當詳細bendoCard；沒有就便當塊 */}
      {isReviewMode ? (
        // === 模式A: 複習視窗 (全螢幕遮罩或大區塊) ===
        <div style={{ 
            border: "2px solid #1890ff", borderRadius: "10px", padding: "20px", backgroundColor: "white",
            minHeight: "400px", display: "flex", flexDirection: "column", gap: "20px"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>🔥 複習模式 ({currentReviewIndex + 1} / {reviewList.length})</h2>
                <button onClick={() => setIsReviewMode(false)} style={{ cursor: "pointer" }}>暫停/離開</button>
            </div>
            
            {/* 顯示便當卡 */}
            <BendoCard 
                bendo={reviewList[currentReviewIndex]} 
                deleteSupabaseItem={deleteBendo} 
                howToSpeech={howToSpeech} 
            />

            {/* 是否精通按鈕區 */}
            <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
                <button 
                    onClick={handleUnknown}
                    style={{ flex: 1, padding: "15px", backgroundColor: "#ff4d4f", color: "white", fontSize: "18px", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                    🔴 不知道 / 忘記了
                </button>
                <button 
                    onClick={handleKnown}
                    style={{ flex: 1, padding: "15px", backgroundColor: "#52c41a", color: "white", fontSize: "18px", border: "none", borderRadius: "8px", cursor: "pointer" }}
                >
                    🟢 已知道 / 記得了
                </button>
            </div>
        </div>
      ):selectedBendo ? (
        // === 如果有選到便當詳細bendoCard；沒有就便當塊 ===
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
          {/* 顯示過濾後的便當塊 */}
          {filiteredOrderHistory?.map((bendo) => (
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