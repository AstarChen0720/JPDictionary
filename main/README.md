# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


node_modules是(大型零件倉庫),裡面裝著所有react或vite要用到的所有工具零件(ex:版手或鑽頭,螺絲等),我永遠不需要知道具體是什麼,只要知道他有在那裡就好

src (=Source)是設計工作室,裡面的東西跟我的網站習習相關,要進一步了解

public是像是工地的外圍展示架,裡面放工人不用工頭翻譯也能直接拿來用的東西(ex網頁圖示)

.gitignore.js是垃圾桶,之後如果要把專案傳到網路上,他會告訴電腦node_mpdule太多太重了,讓別人再自己叫貨就好不用整個搬過去

package是施工合約與明細 ex我要請 React、我要請 Vite
package-lock.json是超詳細的施工合約與明細，細到連螺絲釘型號都記錄下來的詳細收據