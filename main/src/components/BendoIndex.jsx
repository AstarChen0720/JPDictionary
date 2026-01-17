//便當索引標籤 (書籤)組件,就是左邊的快速選單

function BendoIndex({ orderHistory, scrollToBendo }) {
  return (
    <div
      className="bendo-index"
      style={{
        position: "sticky",
        width: "200px",
        flexShrink: 0, //不讓這個區塊縮小(防止右邊東西太多時被擠扁)
        top: "20vh",
        maxHeight: "60vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}
    >
      <p>歷史便當快速選單</p>
      {orderHistory.map((bendo) => {
        return (
          <button
            key={bendo.id}
            onClick={() => scrollToBendo(bendo.id)}
            style={{ padding: "5px", fontSize: "12px", cursor: "pointer" }}
          >
            {bendo.bendoName}
            {/* 用主菜名當標籤 */}
          </button>
        );
      })}
    </div>
  );
}

export default BendoIndex;
