import React from "react";
import ReactDOM from "react-dom/client";
import TeamPreview from "../components/TeamPreview";

const container = document.getElementById("react-team-root");
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <TeamPreview />
    </React.StrictMode>
  );
}
