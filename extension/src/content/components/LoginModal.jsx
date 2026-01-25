//負責處理所有登入視窗的元件

import { useState } from "react";
import supabase from "../../lib/supabaseClient";

//寫在jsx裡面的css樣式
// 使用 inline style 避免被網頁原本的 CSS 污染，或污染網頁
const styles = {
  overlay: {
    // 改用 vw/vh 確保在 Shadow DOM 也能佔滿視窗
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.85)",
    zIndex: 2147483647,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box", // 確保 padding 不會讓它爆掉
  },
  modal: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "12px",
    width: "320px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    color: "#333",
    fontFamily: "sans-serif",
    position: "relative", // 確保裡面的叉叉可以定位
    border: "1px solid #ccc",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box", // 避免寬度跑版
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  closeBtn: {
    float: "right",
    cursor: "pointer",
    border: "none",
    background: "none",
    fontSize: "1.2rem",
  },
};

//登入視窗元件,接收兩個參數onClose和onLoginSuccess
const LoginModal = ({ onClose, onLoginSuccess }) => {

  console.log("正在渲染登入視窗...");
  //拿四筆記本放email,密碼,狀態,message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    //因為瀏覽器預設如果你點擊按鍵他會重新整理頁面,所以用preventDefault來阻止這個行為(不然跑一半就跳掉)
    e.preventDefault();
    //將狀態設為載入中,訊息清空
    setLoading(true);
    setMessage("");

    // 呼叫supabase的登入功能
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    //登入完成後,將載入狀態設為false
    setLoading(false);

    //如果有錯誤發生,將錯誤訊息存起來
    //如果沒有錯誤(登入成功)呼叫onLoginSuccess並傳入session
    if (error) {
      setMessage(error.message);
    } else {
      // 登入成功！
      onLoginSuccess(data.session);
    }
  };

  return (
  //地基
  <div style={styles.overlay}>
    {/* 登入牆 */}
    <div style={styles.modal}>
      {/* 取消的叉叉,按下就會呼叫onClose */}
      <button style={styles.closeBtn} onClick={onClose}>
        ✕
      </button>
      {/* 標題 */}
      <h2 style={{ marginTop: 0, textAlign: "center" }}>請先登入</h2>
      <p
        style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}
      >
        登入後即可將查詢結果同步至您的單字庫。
      </p>
      {/* 讓你輸入email和密碼的地方 */}
      {/* form他會自動偵測裡面的input當按下enter或有人submit時觸發onSubmit,且他會自動檢查是不是都有填寫了,就是一個方便的表單元素 */}
      <form onSubmit={handleLogin}>
        <input
          style={styles.input}
          type="email"
          placeholder="電子郵件"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {/* 按下送出(submit),且當loading時按鈕會變成不可點擊 */}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "驗證中..." : "登入 / 註冊"}
        </button>
      </form>

      {/*(jsx不能在html裡寫if)如果有message(錯誤訊息)就顯示出來 */}
      {message && (
        <p style={{ color: "red", marginTop: "10px", fontSize: "0.9rem" }}>
          {message}
        </p>
      )}
    </div>
  </div>
);
};

export default LoginModal;
