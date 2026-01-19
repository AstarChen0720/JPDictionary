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
    //背景灰色
    <div
      className="Login-Wall"
      style={{
        position: "fixed", // 讓它蓋在最上面
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // 半透明黑色背景，這就是懸浮感的來源
        display: "flex", // 使用 flex 讓內容居中
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999, // 確保在最上層
      }}
    > 
      {/*前景:中間白色登入部分*/}
      <div
        style={{
          backgroundColor: "white", // 給內容一個白底，才不會被後面的遮罩透過去
          padding: "40px",
          borderRadius: "15px", // 圓角感
          boxShadow: "0 8px 30px rgba(0,0,0,0.3)", // 加入陰影，讓它真的「浮」起來
          maxWidth: "500px",
          width: "90%", // 在小螢幕時自動縮小
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          textAlign: "center",
        }}
      >
        <h1>歡迎來到單字便當店</h1>
        <p><b>請問您要登入還是註冊？</b></p>

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
          返回繼續使用訪客模式
        </button>
      </div>
    </div>
  );
}

export default LoginWall;
