import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { UserProvider } from "./Context/userContext";
import { ModalProvider } from "./Context/modalContext";
import { BackHandlerProvider } from "./Context/BackHandlerContext";
import { BrowserRouter as Router } from "react-router-dom";
import { BackArrayProvider } from "./Context/backArrayContext";
import { MovieBannerContext } from "./Context/movieBannerContext";
import { NetworkProvider } from "./Context/NetworkContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <NetworkProvider>
        <BackHandlerProvider>
          <BackArrayProvider>
            <UserProvider>
              <MovieBannerContext>
                <ModalProvider>
                  <App />
                </ModalProvider>
              </MovieBannerContext>
            </UserProvider>
          </BackArrayProvider>
        </BackHandlerProvider>
      </NetworkProvider>
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
