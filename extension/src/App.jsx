import { useState } from 'react'

import './App.css'

function App() {
  const [status, setStatus] = useState("準備就緒");

  return (
    <div style={{ width: "300px", padding: "16px", textAlign: "center" }}>
      <h2>🍱 JPDictionary</h2>
      <p>廚房狀態: {status}</p>
      <button onClick={() => setStatus("正在連線...")}>測試連線</button>
      <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
        在網頁上選取單字來查字典
      </p>
    </div>
  );
}
  

export default App
