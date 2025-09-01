// index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import TestApp from "./TestApp";
import { AuthProvider } from "react-oidc-context";

const cognitoAuthConfig = {
  authority: "https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_aDll8F8yq",
  client_id: "6ktcfi5mi15ktlafc0cq562rfj",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "email openid phone",
};

const root = ReactDOM.createRoot(document.getElementById("root"));

// 檢查是否要顯示測試頁面
const showTest = window.location.search.includes('test=true');

if (showTest) {
  // 顯示測試頁面
  root.render(<TestApp />);
} else {
  // 顯示正常應用
  root.render(
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  );
}