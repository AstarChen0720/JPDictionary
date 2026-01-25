// 這是為了讓 Supabase 可以在 Chrome Extension 環境下運作的「轉接頭」
// 因為 Background Service Worker 沒有 localStorage而supabase是用localStorage存東西的


//chrome的storage.local的存取跟localStorage不太一樣,他存取的東西是物件的形式,所以我們用這個storageAdapter來轉換
//意思是定義一個物件,物件裡面有三個方法getItem,setItem,removeItem
//冒號是ES6之前的寫法,getItem: async (key)等同於 async getItem(key) => {} 
const storageAdapter = {
  getItem: async (key) => {
    // 從 chrome storage 讀取
    const result = await chrome.storage.local.get([key]);
    return result[key] || null;
  },
  setItem: async (key, value) => {
    // 寫入 chrome storage
    await chrome.storage.local.set({ [key]: value });
  },
  removeItem: async (key) => {
    // 移除
    await chrome.storage.local.remove([key]);
  },
};

export default storageAdapter;