import { h } from "preact";
import { useState, useEffect } from "preact/hooks";
import * as bitaboom from "bitaboom";
import "./app.css"; // This line should be at the top of your file
import packageInfo from "../package.json";
import functionNameToExample from "./functions.json";

export function App() {
  const [activeFunction, setActiveFunction] = useState(
    Object.keys(functionNameToExample)[0]
  );
  const [text, setText] = useState("Type your input text here");

  useEffect(() => {
    if (activeFunction) {
      setText(functionNameToExample[activeFunction] || "");
    }
  }, [activeFunction]);

  const result = activeFunction && bitaboom[activeFunction](text);

  return (
    <div>
      <h1>
        {packageInfo.name} v{packageInfo.dependencies["bitaboom"]}
      </h1>
      <div>
        <textarea
          value={text}
          rows="18"
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the input text to format"
        />
        <br />
        <textarea
          value={typeof result === "string" ? result : JSON.stringify(result)}
          disabled="true"
          style={{ minWidth: "100%" }}
          placeholder="This will be the result of the function"
        />
        <select onChange={(e) => setActiveFunction(e.target.value)}>
          {Object.keys(bitaboom).map((functionName) => (
            <option key={functionName} value={functionName}>
              {functionName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
