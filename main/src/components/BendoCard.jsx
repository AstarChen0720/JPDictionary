//負責顯示便當卡片的元件,他負責展示便當卡上的所有東西
import { useState } from "react";
//便當們(單字卡)本身,因為有一堆功能(例如刪除),要有資料和功能當作參數傳進來才能用,(當函式當作參數傳進來時不是整個複製過來,而是代表你可以去呼叫它)
//就像是需要某人剪東西,跟他說筆筒裡的剪刀可以拿一樣,
//他需要
// bendo:便當資料
// deleteSupabaseItem:刪除便當的功能
// updateSupabaseItem:更新便當的功能
// howToSpeech:唸出來的功能
//先拿掉updateSupabaseItem這參數,因為目前不需要編輯便當名稱功能
function BendoCard({ bendo, deleteSupabaseItem, howToSpeech }) {
  //拿一本筆記本紀錄現在正在顯示哪個讀音
  const [activeReadingIndex, setActiveReadingIndex] = useState(0);
  //拿一本筆記本紀錄現在正在顯示哪個意思
  const [activeMeaningIndex, setActiveMeaningIndex] = useState(0);
  //檢查這個便當是否有variations,且裡面有東西(長度大於0)
  const hasVariations = bendo.variations && bendo.variations.length > 0;
  return (
    <div
      key={bendo.id}
      id={`display-bendo-${bendo.id}`} //給每個便當一個獨特的id,加上display-bendo-前綴方便辨識
      className="bendo-card"
      style={{
        flex: 1,
        height: "80vh",
        position: "relative",
        border: "2px dashed #ccc",
        padding: "20px",
        margin: "10px 0px",
      }}
    >
      <button
        onClick={() => deleteSupabaseItem(bendo.id)} // 呼叫我們寫好的刪除處理函式
        style={{
          position: "absolute", // 【關鍵】絕對定位
          top: "10px", // 距離上方 10 像素
          right: "10px", // 距離右方 10 像素
          background: "#ff4d4f", // 警示紅色
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          padding: "5px 10px",
          fontSize: "14px",
        }}
      >
        🗑️ 刪除
      </button>
      {/* 如果有variations就顯示新單字卡 */}
      {!hasVariations ? (
        <>
          {/* 單字標題行 */}
          <div
            style={{
              display: "flex", // 開啟 Flex 排版
              flexWrap: "wrap", // 如果螢幕太小，允許換行
              alignItems: "flex-end", // 讓底部對齊(這樣假名會對齊漢字的底部)
              gap: "15px", // 漢字跟假名中間空 15px
              marginBottom: "10px", // 跟下面的內容保持距離
              borderBottom: "1px solid #eee", // 加條底線讓標題區更明顯
              paddingBottom: "10px",
            }}
          >
            {/* 左邊：單字 */}
            <div
              style={{
                fontSize: "2.5rem", // 字放大
                fontWeight: "bold",
                lineHeight: "1.5", // 避免行高影響對齊
                marginRight: "5px",
              }}
            >
              {/* 如果有標好假名的單字就精確顯示,沒有就顯示一般排版的假名 */}
              {bendo.wordMapping ? (
                bendo.wordMapping.map((item, index) => (
                  <ruby key={index} style={{ rubyPosition: "over" }}>
                    {item.text}
                    <rt
                      style={{
                        fontSize: "0.4em",
                        fontWeight: "normal",
                        lineHeight: "1",
                        userSelect: "none", // 防止假名被選取
                      }}
                    >
                      {item.reading}
                    </rt>
                  </ruby>
                ))
              ) : (
                // 舊資料的保底顯示
                <ruby style={{ rubyPosition: "over" }}>
                  {bendo.bendoName}
                  <rt
                    style={{
                      fontSize: "0.4em",
                      fontWeight: "normal",
                      lineHeight: "1",
                      userSelect: "none", // 防止假名被選取
                    }}
                  >
                    {bendo.reading}
                  </rt>
                </ruby>
              )}
            </div>

            {/* 右邊：假名與重音標記 */}
            {bendo.moraDetails ? (
              <div
                className="mora-container"
                onClick={() => howToSpeech(bendo.bendoName)}
                style={{ marginBottom: "2px", cursor: "pointer" }}
              >
                {/* marginBottom微調，讓假名稍微浮起來一點點或對齊視線 */}
                {bendo.moraDetails.map((mora, index) => (
                  <span
                    key={index}
                    //第一個樣式:如果高音上邊框不是就下邊框
                    //第二個樣式:如果下個音有上升或下降就右邊框
                    className={`mora-char ${mora.isHigh ? "pitch-high" : "pitch-low"} ${
                      mora.hasDrop ? "pitch-drop" : ""
                    }`}
                  >
                    {mora.char}
                  </span>
                ))}
                {/* 重音數字 (縮小一點放旁邊) */}
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "1rem",
                    color: "#999",
                    border: "1px solid #ddd",
                    borderRadius: "50%",
                    padding: "0 6px",
                  }}
                >
                  {bendo.accent}
                </span>
              </div>
            ) : (
              // 如果沒有重音資料(舊便當)，就顯示一般讀音和重音數字
              <div
                onClick={() => howToSpeech(bendo.bendoName)}
                style={{
                  fontSize: "1.2rem",
                  color: "#555",
                  cursor: "pointer",
                }}
              >
                {bendo.reading}
                <span
                  style={{
                    marginLeft: "8px",
                    fontSize: "1rem",
                    color: "#999",
                    border: "1px solid #ddd",
                    borderRadius: "50%",
                    padding: "0 6px",
                  }}
                >
                  {bendo.accent}
                </span>
              </div>
            )}
            {/* 最右邊詞性 */}
            <div
              style={{
                marginLeft: "10px",
                fontSize: "1rem",
              }}
            >
              {bendo.partOfSpeech}
            </div>
          </div>
          <ul>
            <li>中文意思：{bendo.chtMeaning}</li>
            <li
              onClick={() => howToSpeech(bendo.example_ja)}
              style={{ cursor: "pointer", border: "2px dashed #ccc" }}
            >
              日文例句：{bendo.example_ja}
            </li>
            <li>中文例句：{bendo.example_cht}</li>
          </ul>
        </>
      ) : (
        /* ================ 樣式 B：新單字卡 (連動選單) ================ */
        (() => {
          //根據目前選到的讀音和意思索引，取得對應的資料
          const currentRead = bendo.variations[activeReadingIndex];
          const currentMean = currentRead?.meanings[activeMeaningIndex];
          //安全檢查:如果沒有讀音或意思就不顯示內容
          if (!currentRead || !currentMean) return null;

          return (
            <>
              {/* 1. 頂部讀音切換橫列 */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  borderBottom: "2px solid #eee",
                  marginBottom: "15px",
                  overflowX: "auto",
                }}
              >
                {bendo.variations.map((Read, index) => (
                  <button
                    key={index}
                    //點選切換讀音，並將意思回到第一個
                    onClick={() => {
                      setActiveReadingIndex(index);
                      setActiveMeaningIndex(0);
                    }}
                    style={{
                      padding: "8px 15px",
                      border: "none",
                      backgroundColor:
                        activeReadingIndex === index
                          ? "#1890ff"
                          : "transparent",
                      color: activeReadingIndex === index ? "white" : "#666",
                      borderRadius: "5px 5px 0 0",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {Read.reading}
                  </button>
                ))}
              </div>

              {/* 2. 連動的標題區 (字會隨讀音變換) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ fontSize: "2.8rem", fontWeight: "bold", cursor: "pointer", }} onClick={() => howToSpeech(currentRead.word || bendo.bendoName)}>
                  {/* 如果有標好假名的單字就精確顯示,沒有就顯示一般排版的假名  */}
                  {currentRead.wordMapping ? (
                    currentRead.wordMapping.map((item, index) => (
                      <ruby key={index} style={{ rubyPosition: "over" }}>
                        {item.text}
                        <rt
                          style={{
                            fontSize: "0.4em",
                            fontWeight: "normal",
                            userSelect: "none",
                          }}
                        >
                          {item.reading}
                        </rt>
                      </ruby>
                    ))
                  ) : (
                    <ruby style={{ rubyPosition: "over" }}>
                      {bendo.bendoName}
                      <rt
                        style={{
                          fontSize: "0.4em",
                          fontWeight: "normal",
                          userSelect: "none",
                        }}
                      >
                        {currentRead.reading}
                      </rt>
                    </ruby>
                  )}
                </div>
                {/* 讀音與重音數字 */}
                <div
                  className="mora-container"
                  onClick={() =>
                    //為保險如果沒有單字就用便當名稱唸
                    howToSpeech(currentRead.word || bendo.bendoName)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {currentRead.moraDetails?.map((mora, index) => (
                    <span
                      key={index}
                      //第一個樣式:如果高音上邊框不是就下邊框
                      //第二個樣式:如果下個音有上升或下降就右邊框
                      className={`mora-char ${mora.isHigh ? "pitch-high" : "pitch-low"} ${mora.hasDrop ? "pitch-drop" : ""}`}
                    >
                      {mora.char}
                    </span>
                  ))}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "1rem",
                      color: "#999",
                      border: "1px solid #ddd",
                      borderRadius: "50%",
                      padding: "0 6px",
                    }}
                  >
                    {currentRead.accent}
                  </span>
                </div>
                {/* 最右邊詞性 */}
                <div
                  style={{
                    marginLeft: "10px",
                    fontSize: "1rem",
                  }}
                >
                  {bendo.partOfSpeech}
                </div>
              </div>

              {/* 3. 詳解區 (左選單/右內容) */}
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  gap: "20px",
                  overflow: "hidden",
                }}
              >
                {/* 左側：意思索引列 */}
                <div
                  style={{
                    width: "160px",
                    borderRight: "1px solid #eee",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    overflowY: "auto",
                  }}
                >
                  {currentRead.meanings.map((mean, index) => (
                    <button
                      key={index} //用index來排列
                      onClick={() => setActiveMeaningIndex(index)} //點選就顯示對應意思
                      style={{
                        textAlign: "left",
                        padding: "10px",
                        border: "none",
                        borderRadius: "4px",
                        backgroundColor:
                          activeMeaningIndex === index
                            ? "#e6f7ff"
                            : "transparent",
                        color:
                          activeMeaningIndex === index ? "#1890ff" : "#555",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                      }}
                    >
                      {/* 如果有意思(默認是中文的意思)就顯示出來,沒有就"未命名"
                        如果意思長度超過8個字就顯示前7個字加上... */}
                      {mean.meaning
                        ? mean.meaning.length > 8
                          ? mean.meaning.slice(0, 7) + "..."
                          : mean.meaning
                        : "未命名"}
                    </button>
                  ))}
                </div>

                {/* 右側：詳細解釋內容 */}
                <div
                  style={{ flex: 1, overflowY: "auto", paddingRight: "10px" }}
                >
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: "bold",
                      marginBottom: "20px",
                      color: "#333",
                    }}
                  >
                    {currentMean.meaning}
                  </div>

                  {/* 例句區 */}
                  <div
                    style={{
                      borderLeft: "4px solid #ddd",
                      paddingLeft: "20px",
                      backgroundColor: "#fafafa",
                      padding: "15px",
                      borderRadius: "0 8px 8px 0",
                    }}
                  >
                    <div
                      onClick={() => howToSpeech(currentMean.example_ja)}
                      style={{
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        marginBottom: "8px",
                        color: "#444",
                      }}
                    >
                      {currentMean.example_ja} (點擊聽發音)
                    </div>
                    <div style={{ color: "#888", fontSize: "1rem" }}>
                      {currentMean.example_cht}
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
}

//匯出這個便當卡顯示元件讓別的地方可以用
export default BendoCard;
