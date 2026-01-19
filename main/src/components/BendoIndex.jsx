//便當索引標籤 (書籤)組件,就是左邊的快速選單

import  { useState } from "react";

function BendoIndex({
  orderHistory,
  scrollToBendo,
  session,
  handleLogout,
  setIsLogin,
  deleteBendo,
  setOrderHistory,
}) {
  //刪除所有便當
  const DeleteAllBendo = () => {
    if (window.confirm("確定要刪除所有便當嗎？這個動作無法復原喔！")) {
      //清空本地歷史便當筆記本
      setOrderHistory([]);
      //一一刪除每個便當
      //foreach是代表一一取出每一筆資料,傳到括號內函式的參數並執行
      orderHistory.forEach((bendo) => {
        deleteBendo(bendo.id);
      });
    }
  };
  //拿一個筆記本來紀錄現在滑鼠有沒有在便當索引標籤上方
  const [isHover, setIsHover] = useState({});


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
        zIndex: 1001,
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
      <p style={{ alignSelf: "center" }}>歷史便當快速選單</p>
      {orderHistory.map((bendo) => {
        return (
          //便當索引標籤,改成是div且讓叉叉可以在右邊
          //且用useState實現滑鼠有在上面才顯示叉叉(應該要用css但是先在先不用)
          <div
            key={bendo.id}
            className="index-item"
            style={{ position: "relative", display: "flex" }}
            //精準只改某一個便當的isHover狀態,這樣其他便當就不會一起變
            onMouseEnter={() =>
              setIsHover((prev) => ({ ...prev, [bendo.id]: true }))
            }
            onMouseLeave={() =>
              setIsHover((prev) => ({ ...prev, [bendo.id]: false }))
            }
          >
            <button
              onClick={() => scrollToBendo(bendo.id)}
              style={{
                padding: "5px",
                fontSize: "12px",
                cursor: "pointer",
                flex: 1,
                textAlign: "center",
              }}
            >
              {bendo.bendoName}
            </button>
            {/* 刪除按鈕 */}
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation(); //防止同時點掉下面的scrollToBendo
                deleteBendo(bendo.id);
              }}
              style={{
                position: "absolute",
                right: "2px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: "3px",
                cursor: "pointer",
                padding: "2px 5px",
                fontSize: "10px",
                display: isHover[bendo.id] ? "block" : "none", // 如果滑鼠移入才顯示
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
      {/* 如果便當超過15個就顯示全部刪除按鈕 */}
      {orderHistory.length > 15 && (
        <button
          onClick={DeleteAllBendo}
          style={{
            marginTop: "20px",
            backgroundColor: "#ff4d4f",
            color: "white",
            padding: "10px",
            width: "100%",
            marginBottom: "20px",
          }}
        >
          全部刪除
        </button>
      )}
    </div>
  );
}

export default BendoIndex;
