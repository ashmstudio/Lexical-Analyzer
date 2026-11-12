"use strict";

// Field rules and token types
const FIELDS = [
  {
    label: "ID",
    type: "STUDENT_ID",
    pattern: /^[0-9]{7}$/,
    help: "Exactly 7 digits.",
    example: "2026003"
  },
  {
    label: "COURSE",
    type: "COURSE_CODE",
    pattern: /^[A-Z]{2,6}$/,
    help: "2–6 uppercase letters only.",
    example: "BSCS"
  },
  {
    label: "SUBJECT",
    type: "SUBJECT_CODE",
    pattern: /^[A-Z]{2,4}[0-9]{1,3}$/,
    help: "2–4 uppercase letters, then 1–3 digits.",
    example: "CS101"
  },
  {
    label: "GRADES",
    type: "GRADE_VALUE",
    pattern: /^(100|[1-9]?[0-9])$/,
    help: "Whole number 0–100; no leading zeros.",
    example: "95"
  },
  {
    label: "EMAIL",
    type: "EMAIL_ADDRESS",
    pattern: /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/,
    help: "Use name@domain.com format.",
    example: "student@school.edu"
  }
];

// Fictional sample records
const SAMPLES = {
  esguerra:
    "ID 2026003\n" +
    "COURSE BSCS\n" +
    "SUBJECT CS101\n" +
    "GRADES 95\n" +
    "EMAIL esguerra@school.edu",

  muso:
    "ID 2026004\n" +
    "COURSE BSCS\n" +
    "SUBJECT CS201\n" +
    "GRADES 98\n" +
    "EMAIL muso@school.edu",

  maria:
    "ID 2026005\n" +
    "COURSE b2cs\n" +
    "SUBJECT CS101\n" +
    "GRADES 92\n" +
    "EMAIL maria@school.edu",

  judex:
    "ID 20263\n" +
    "COURSE BSCS\n" +
    "SUBJECT CS302\n" +
    "GRADES 105\n" +
    "EMAIL judex@school"
};

// Student ID DFA: accepts exactly seven digits.
function acceptsStudentId(value) {
  let state = 0;

  for (const character of value) {
    if (character < "0" || character > "9" || state === 7) {
      return false;
    }

    state++;
  }

  return state === 7;
}

// Read the record and check each field.
function analyzeRecord(source) {
  const parts = Array.from(
    source.matchAll(/[^\s:]+|:/g),
    function (match) {
      return {
        value: match[0],
        position: match.index
      };
    }
  );

  // Invalid entries are displayed but are not accepted tokens.
  const entries = [];
  let cursor = 0;
  let errorCount = 0;

  function addEntry(part, type, reason) {
    entries.push({
      position: part.position,
      value: part.value,
      type: type,
      valid: reason === "",
      reason: reason
    });

    if (reason !== "") {
      errorCount++;
    }
  }

  function finish() {
    return {
      entries: entries,
      errorCount: errorCount,
      valid: errorCount === 0
    };
  }

  if (parts.length === 0) {
    addEntry(
      { value: "", position: 0 },
      "MISSING",
      "Enter a student record."
    );

    return finish();
  }

  for (const field of FIELDS) {
    const label = parts[cursor];

    // Check the required field order.
    if (!label || label.value !== field.label) {
      const found = label || {
        value: "",
        position: source.length
      };

      const knownLabel = FIELDS.some(function (item) {
        return item.label === found.value;
      });

      addEntry(
        found,
        knownLabel ? "KEYWORD" : "UNRECOGNIZED",
        "Expected " + field.label + " here."
      );

      return finish();
    }

    addEntry(label, "KEYWORD", "");
    cursor++;

    // Also accept colon-style records from the proposal.
    if (parts[cursor] && parts[cursor].value === ":") {
      addEntry(parts[cursor], "SEPARATOR", "");
      cursor++;
    }

    const value = parts[cursor];

    const nextIsLabel = value && FIELDS.some(function (item) {
      return item.label === value.value;
    });

    // Report a missing value without consuming the next field label.
    if (!value || nextIsLabel) {
      addEntry(
        {
          value: "",
          position: value ? value.position : source.length
        },
        field.type,
        "Missing " + field.label + " value."
      );

      continue;
    }

    const accepted = field.label === "ID"
      ? acceptsStudentId(value.value)
      : field.pattern.test(value.value);

    addEntry(
      value,
      field.type,
      accepted ? "" : field.help
    );

    cursor++;
  }

  // Report any content after the five required fields.
  while (cursor < parts.length) {
    addEntry(
      parts[cursor],
      "UNEXPECTED",
      "Remove extra content."
    );

    cursor++;
  }

  return finish();
}

// Page elements
const input = document.querySelector("#source-input");
const sampleSelect = document.querySelector("#sample-select");
const badge = document.querySelector("#result-badge");
const message = document.querySelector("#result-message");
const rows = document.querySelector("#token-rows");

let customDraft = "";

// Clear previous results when the input changes.
function resetResults() {
  badge.dataset.state = "idle";
  badge.textContent = "Ready";

  message.textContent = "Select Analyze record to view the result.";

  input.removeAttribute("aria-invalid");
  rows.replaceChildren();

  const cell = rows.insertRow().insertCell();

  cell.colSpan = 4;
  cell.className = "empty";
  cell.textContent = "Your results will appear here.";
}

// Select an invalid value in the editor.
function selectError(entry) {
  input.focus();

  input.setSelectionRange(
    entry.position,
    entry.position + entry.value.length
  );

  const line = input.value
    .slice(0, entry.position)
    .split("\n")
    .length - 1;

  const lineHeight = parseFloat(
    getComputedStyle(input).lineHeight
  );

  input.scrollTop = Math.max(
    0,
    line * lineHeight - input.clientHeight / 2
  );
}

// Display the analysis result.
function analyzeInput() {
  const result = analyzeRecord(input.value);

  badge.dataset.state = result.valid ? "valid" : "invalid";
  badge.textContent = result.valid ? "Valid" : "Invalid";

  message.textContent = result.valid
    ? "All 5 fields are valid."
    : result.errorCount +
      (result.errorCount === 1
        ? " error found."
        : " errors found.") +
      " Select a highlighted value to edit.";

  input.setAttribute("aria-invalid", String(!result.valid));

  rows.replaceChildren();

  for (const entry of result.entries) {
    const row = rows.insertRow();

    const positionCell = row.insertCell();
    const lexemeCell = row.insertCell();
    const typeCell = row.insertCell();
    const resultCell = row.insertCell();

    positionCell.textContent = entry.position;
    typeCell.textContent = entry.type;

    if (entry.valid) {
      lexemeCell.textContent = entry.value;

      const isLabel =
        entry.type === "KEYWORD" ||
        entry.type === "SEPARATOR";

      resultCell.textContent = isLabel ? "—" : "Valid";

      resultCell.className = isLabel
        ? "keyword-result"
        : "valid-text";
    } else {
      row.className = "invalid-row";

      typeCell.title =
        "Expected token type; this value was rejected.";

      const errorButton = document.createElement("button");

      errorButton.type = "button";
      errorButton.className = "error-lexeme";
      errorButton.textContent = entry.value || "(missing)";

      errorButton.setAttribute(
        "aria-label",
        "Edit " +
          (entry.value || "missing value") +
          " at position " +
          entry.position +
          ". " +
          entry.reason
      );

      errorButton.addEventListener("click", function () {
        selectError(entry);
      });

      lexemeCell.append(errorButton);

      const status = document.createElement("span");

      status.className = "invalid-label";
      status.textContent = "Invalid";

      const reason = document.createElement("span");

      reason.className = "reason";
      reason.textContent = entry.reason;

      resultCell.append(status, reason);
    }
  }

  // Scroll to the first error if it is outside the visible table.
  const tableWrap = document.querySelector(".table-wrap");

  tableWrap.scrollTop = 0;

  const firstError = rows.querySelector(".invalid-row");

  if (firstError) {
    const errorBox = firstError.getBoundingClientRect();
    const wrapBox = tableWrap.getBoundingClientRect();

    if (errorBox.bottom > wrapBox.bottom) {
      tableWrap.scrollTop =
        errorBox.top - wrapBox.top - 42;
    }
  }
}

// Analyze button
document.querySelector("#analyze-button").addEventListener(
  "click",
  analyzeInput
);

// Clear button
document.querySelector("#clear-button").addEventListener(
  "click",
  function () {
    input.value = "";
    customDraft = "";
    sampleSelect.value = "";

    resetResults();
    input.focus();
  }
);

// Sample selection
sampleSelect.addEventListener("change", function () {
  if (sampleSelect.value === "") {
    input.value = customDraft;

    resetResults();
    input.focus();
  } else {
    input.value = SAMPLES[sampleSelect.value];
    analyzeInput();
  }
});

// Editing changes the selection to Custom record.
input.addEventListener("input", function () {
  customDraft = input.value;
  sampleSelect.value = "";

  resetResults();
});

// Keyboard shortcut
input.addEventListener("keydown", function (event) {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === "Enter"
  ) {
    event.preventDefault();
    analyzeInput();
  }
});

// Field rules dialog
const dialog = document.querySelector("#rules-dialog");

document.querySelector("#rules-button").addEventListener(
  "click",
  function () {
    dialog.showModal();
  }
);

document.querySelector("#close-rules").addEventListener(
  "click",
  function () {
    dialog.close();
  }
);

// Fill the rules table using the same field definitions.
for (const field of FIELDS) {
  const row = document.querySelector("#rules-rows").insertRow();

  for (const text of [
    field.label,
    field.help,
    field.example
  ]) {
    row.insertCell().textContent = text;
  }
}

// Load the first example when the page opens.
input.value = SAMPLES.esguerra;
sampleSelect.value = "esguerra";

analyzeInput();