//負責顯示便當卡片的元件,他負責展示便當卡上的所有東西

//便當們(單字卡)本身,因為有一堆功能(例如刪除),要有資料和功能當作參數傳進來才能用,(當函式當作參數傳進來時不是整個複製過來,而是代表你可以去呼叫它)
//就像是需要某人剪東西,跟他說筆筒裡的剪刀可以拿一樣,
//他需要
// bendo:便當資料
// deleteSupabaseItem:刪除便當的功能
// updateSupabaseItem:更新便當的功能
// howToSpeech:唸出來的功能
//先拿掉updateSupabaseItem這參數,因為目前不需要編輯便當名稱功能
function BendoCard({bendo,deleteSupabaseItem,howToSpeech}) {

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
              fontSize: "2rem", // 字放大
              fontWeight: "bold",

              lineHeight: "1", // 避免行高影響對齊
            }}
          >
            {bendo.bendoName}
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
              style={{ fontSize: "1.2rem", color: "#555", cursor: "pointer" }}
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
        </div>
        <ul>
          <li>中文意思：{bendo.chtMeaning}</li>
          <li>讀音：{bendo.reading}</li>
          <li>重音：{bendo.accent}</li>
          <li
            onClick={() => howToSpeech(bendo.example_ja)}
            style={{ cursor: "pointer", border: "2px dashed #ccc" }}
          >
            日文例句：{bendo.example_ja}
          </li>
          <li>中文例句：{bendo.example_cht}</li>
        </ul>
      </div>
    );
}

//匯出這個便當卡顯示元件讓別的地方可以用
export default BendoCard;