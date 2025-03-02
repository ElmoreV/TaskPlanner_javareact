import React from "react";
import ReactDOM from "react-dom";
import App from "../App";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App />, div);
});

// Smoke test
// Shallow rendering
// Testing output
// Full renderingtesting component lifecycle/state changes
