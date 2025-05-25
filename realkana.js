// ==UserScript==
// @name         RealKana Definition Helper (Local Kana Glosses)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Show kana definitions from local dictionary (hiragana + katakana)
// @match        https://realkana.com/*
// @grant        GM_xmlhttpRequest
// @connect      jisho.org
// ==/UserScript==

(function () {
  'use strict';

  console.log("RealKana Definitions Loaded");

  function showDefinition(input) {
      console.log("🔍 Searching for:", input);
      const url = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(input)}`;

      GM_xmlhttpRequest({
          method: "GET",
          url: url,
          onload: function (response) {
              let gloss = 'No definition found.';
              try {
                  const data = JSON.parse(response.responseText);
                  if (data && data.data && data.data.length > 0) {
                      const entry = data.data[0];
                      const japanese = entry.japanese[0]?.word || entry.japanese[0]?.reading;
                      const english = entry.senses[0]?.english_definitions?.join(', ');
                      gloss = `${japanese}: ${english}`;
                  }
              } catch (err) {
                  gloss = 'Error parsing response.';
                  console.error("Parsing Error:", err);
              }

              console.log("Definition:", gloss);
              updateDefinitionBox(gloss);
          },
          onerror: function (err) {
              console.error("Request failed", err);
          }
      });
  }

  function updateDefinitionBox(text) {
    let box = document.getElementById("definition-box");
    if (!box) {
      const inputBox = document.querySelector('input.MuiInputBase-input');
      if (!inputBox) return;

      box = document.createElement("div");
      box.id = "definition-box";
      box.style.marginTop = "8px";
      box.style.padding = "6px 10px";
      box.style.border = "1px solid #ccc";
      box.style.borderRadius = "4px";
      box.style.backgroundColor = "#f9f9f9";
      box.style.fontSize = "14px";
      box.style.maxWidth = "300px";

      inputBox.parentElement.parentElement.appendChild(box);
    }
    box.textContent = text;
  }


  function waitForInput() {
    const inputBox = document.querySelector('#«r0»');
    if (!inputBox) {
      setTimeout(waitForInput, 500);
      return;
    }

    inputBox.addEventListener('keyup', function (e) {
      if (e.key === 'Enter') {
      setTimeout(showDefinition, 500, inputBox.value);
      }
    });

  }

  waitForInput();
})();