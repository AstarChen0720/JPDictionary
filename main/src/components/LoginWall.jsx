//登入牆元件,處理用戶要登入和註冊的那個蓋住整個螢幕的畫面

//引入已經準備好的supabase倉儲駐點服務人員,讓我們可以直接用他來處理登入和註冊
import supabase from "../supabaseClient.js";

//後面機構的部分(齒輪盒)
function LoginWall({ setIsLogin }) {
  //登入的魔法:將要登入的人的email和password傳給supabase讓他幫我登入
  const handleLogin = async (email, password) => {
    //{error}是簡寫法,意思是等號右邊的回傳值中的error取出來把他叫做error變數
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    //如果失敗就傳出通知
    if (error) alert("登入失敗: " + error.message);
  };

  //註冊的魔法:將要註冊的人的email和password傳給supabase讓他幫我註冊
  const handleSignUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("註冊失敗: " + error.message);
    else alert("註冊成功！請去信箱收信驗證 (如果沒開驗證則直接登入)");
  };

  //顯示出來的部分(錶面)
  return (
    <div
      className="Login-Wall"
      style={{ padding: "50px", textAlign: "center" }}
    >
      <h1>歡迎來到單字便當店 LV5</h1>
      <p>請先出示會員證（登入）以開始點餐</p>

      <div
        style={{
          maxWidth: "300px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* 這裡簡單做，實際可以用 form */}
        <input id="email" type="email" placeholder="Email" />
        <input id="password" type="password" placeholder="Password" />

        <button
          onClick={() => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            handleLogin(email, password);
          }}
        >
          登入
        </button>

        <button
          onClick={() => {
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            handleSignUp(email, password);
          }}
        >
          註冊新會員
        </button>

        {/* ★ 新增：訪客模式按鈕 */}
        {/* 按下這個按鈕，isLogin 變成 true，外面的 if (!isLogin) 就會失效，牆就會消失 */}
        <button
          onClick={() => setIsLogin(true)}
          style={{ backgroundColor: "#888", color: "white" }}
        >
          用訪客模式繼續
        </button>
      </div>
    </div>
  );
}

export default LoginWall;
