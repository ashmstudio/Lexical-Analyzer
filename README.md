# Student Record Lexical Analyzer

A browser-based project built with HTML, CSS, and JavaScript. It reads a student record, identifies its tokens, and checks whether the five required fields follow their rules.

## Testing Checklist

- Esguerra and Muso records should display Valid.
- Maria's record should highlight b2cs as an invalid course.
- Judex's record should show errors for ID, GRADES, and EMAIL.
- Clicking an invalid value should select it in the editor.
- Clear should empty the editor and results.

## Features

- Validates student ID, course, subject, grade, and email.
- Displays each lexeme, its position, token type, and result.
- Highlights invalid values with short error messages.
- Selects an invalid value in the editor when clicked.
- Includes Esguerra, Muso, Maria, and Judex sample records.
- Supports custom input and a field-rules reference.
- Runs offline without installation.

## Technologies

| Technology | Purpose |
| --- | --- |
| HTML | Creates the page structure and controls |
| CSS | Styles the layout and validation results |
| JavaScript | Analyzes records and displays tokens and errors |

## Project Files

| File | Description |
| --- | --- |
| `index.html` | Main page |
| `style.css` | Page design and responsive layout |
| `script.js` | Field rules, sample records, and analyzer logic |
| `README.md` | Project information and instructions |

## How to Run

1. Download or clone this repository.
2. Keep `index.html`, `style.css`, and `script.js` in the same folder.
3. Open `index.html` in a browser.

No additional packages or internet connection are required.

## How to Use

1. Choose a sample record or select **Custom record**.
2. Enter or edit the record.
3. Click **Analyze record**.
4. Review the **Valid** or **Invalid** result.
5. Click a highlighted invalid value to select it in the editor.
6. Correct the value and analyze again.

Use **Clear** to empty the editor. Select **Field rules** to view the requirements. You can also press **Ctrl + Enter** to analyze.

## Field Rules

Enter fields in this order: **ID, COURSE, SUBJECT, GRADES, EMAIL**.

| Field | Requirement | Example |
| --- | --- | --- |
| ID | Exactly 7 digits | `2026003` |
| COURSE | 2–6 uppercase letters | `BSCS` |
| SUBJECT | 2–4 uppercase letters followed by 1–3 digits | `CS101` |
| GRADES | Whole number from 0 to 100, without leading zeros | `95` |
| EMAIL | An address with a username, @, and dotted domain | `student@school.edu` |

## Valid Input

```text
ID 2026003
COURSE BSCS
SUBJECT CS101
GRADES 95
EMAIL esguerra@school.edu
```

**Result:** Valid. All five fields meet their rules.

## Invalid Input

```text
ID 2026005
COURSE b2cs
SUBJECT CS101
GRADES 92
EMAIL maria@school.edu
```

**Result:** Invalid. The course contains lowercase letters and a digit.

The analyzer highlights the error:

| Position | Lexeme | Token type | Result |
| --- | --- | --- | --- |
| 18 | b2cs | COURSE_CODE | Invalid: 2–6 uppercase letters only |

Positions are character offsets starting at zero. For invalid values, the token-type column shows the expected type.

## Analyzer Logic

The program separates the source text into lexemes while keeping their original positions. Field labels become `KEYWORD` tokens. Values are checked against their field rules.

The student ID uses an explicit DFA that accepts exactly seven digits. Other values use regular expressions. The analyzer also checks missing values, field order, and extra content.

## Scope and Limitations

The application checks one record at a time. Course and subject checks validate format; they do not verify an approved course-subject list. Email validation checks format and does not confirm whether an address exists.

The project does not include database storage, user accounts, or a connection to an official school system.