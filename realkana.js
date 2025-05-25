// ==UserScript==
// @name         RealKana Definition Helper
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Pulls defintiions from Jisho API and displays them.
// @match        https://realkana.com/*
// @grant        GM_xmlhttpRequest
// @connect      jisho.org
// ==/UserScript==

(function () {
  "use strict";

  console.log("RealKana Definitions Loaded");

  function showDefinition(input) {
    console.log("Searching for:", input);
    const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(
      input
    )}`;

    GM_xmlhttpRequest({
      method: "GET",
      url: url,
      onload: function (response) {
        let gloss = "No definition found.";
        try {
          const data = JSON.parse(response.responseText);
          if (data && data.data && data.data.length > 0) {
            const entry = data.data[0];
            const japanese =
              entry.japanese[0]?.word || entry.japanese[0]?.reading;
            const english = entry.senses[0]?.english_definitions?.join(", ");
            gloss = `${japanese}: ${english}`;
          }
        } catch (err) {
          gloss = "Error parsing response.";
          console.error("Parsing Error:", err);
        }

        console.log("Definition:", gloss);
        updateDefinitionBox(gloss);
      },
      onerror: function (err) {
        console.error("Request failed", err);
      },
    });
  }

  function updateDefinitionBox(text) {
    let box = document.getElementById("definition-box");

    // Select the correct input box (note: getElementById was incorrect, changed to querySelector)
    const inputBox = document.querySelector("input.MuiInputBase-input");
    if (!inputBox) return;

    inputBox.style.caretColor = "transparent";

    // If box already exists, update and show it
    if (box) {
      box.textContent = text;
      box.style.display = "block";
      return;
    }

    // Traverse upward to find a stable parent container
    const container = inputBox.closest(".MuiBox-root")?.parentElement;
    if (!container) return;

    // Create the definition box
    box = document.createElement("div");
    box.id = "definition-box";
    box.textContent = text;

    // Style the definition box
    box.style.padding = "10px 15px";
    box.style.border = "1px solid #ccc";
    box.style.borderRadius = "7px";
    box.style.backgroundColor = "rgb(255, 255, 255)";
    box.style.fontSize = "14px";
    box.style.maxWidth = "340px";
    box.style.textAlign = "center";
    box.style.wordBreak = "break-word";
    box.style.alignSelf = "center";

    // Append it below the input container
    container.appendChild(box);

    const hideBox = () => {
      box.style.display = "none";
      inputBox.style.caretColor = "auto";
    };

    inputBox.addEventListener("input", hideBox);
    inputBox.addEventListener("blur", hideBox);
  }

  function waitForInput() {
    const inputBox = document.querySelector("input.MuiInputBase-input");
    if (!inputBox) {
      setTimeout(waitForInput, 500);
      return;
    }

    inputBox.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        setTimeout(showDefinition, 500, inputBox.value);
      }
    });
  }

  waitForInput();
})();
