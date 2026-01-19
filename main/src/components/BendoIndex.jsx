//便當索引標籤 (書籤)組件,就是左邊的快速選單

function BendoIndex({
  orderHistory,
  scrollToBendo,
  session,
  handleLogout,
  setIsLogin,
}) {
  return (
    <div
      className="bendo-index"
      style={{
        position: "sticky",
        width: "200px",
        flexShrink: 0, //不讓這個區塊縮小(防止右邊東西太多時被擠扁)
        top: "0px",
        maxHeight: "80vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        gap: "5px",
      }}
    >
      {/* 會員資訊 */}
      <div
        style={{
          background: "white",
          padding: "5px",
          marginBottom: "10px",
          fontSize: "16px",
        }}
      >
        {session ? (
          <>
            <span>會員: {session.user.email} </span>
            <button onClick={handleLogout} style={{ width: "100%" }}>
              登出
            </button>
          </>
        ) : (
          <>
            <span>現在是訪客模式(無法同步資料)</span>
            <button onClick={() => setIsLogin(false)} style={{ width: "100%" }}>
              登入 / 註冊
            </button>
          </>
        )}
      </div>
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
