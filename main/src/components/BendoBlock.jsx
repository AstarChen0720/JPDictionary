//便當塊組件,用來在管理歷史儲藏室顯示的每個便當塊


//負責顯示便當塊bendo(你要顯示的便當標題), onClick(有沒有被選到)
function BendoBlock({ bendo, onClick }) {
  return (
    <div
      onClick={() => onClick(bendo)} // 按下時把便當標記起來
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        cursor: "pointer",
        backgroundColor: "#f9f9f9",
        textAlign: "center",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        fontSize: "1.2rem",
        fontWeight: "bold",
        transition: "transform 0.1s", // 讓按下去有彈性效果
        display: "flex", // 這裡用 Flex 是為了讓文字垂直置中
        alignItems: "center", // 垂直置中
        justifyContent: "center", // 水平置中
        minHeight: "80px", // 固定最小高度，才不會有些字太短變得扁扁的不好看
      }}
      // 滑鼠移上去的小特效 (簡單用 hover 模擬，React inline style 比較難做 hover，先省略或用 CSS class)
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e6f7ff")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f9f9f9")}
    >
      {bendo.bendoName}
    </div>
  );
}
export default BendoBlock;