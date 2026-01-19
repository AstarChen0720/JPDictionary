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
        <div
          onClick={() => howToSpeech(bendo.bendoName)}
          style={{
            fontWeight: "bold",
            cursor: "pointer",
            border: "2px dashed #ccc",
          }}
        >
          單字便當：
          <span>{bendo.bendoName}</span>
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