Student Record Lexical Analyzer


A browser-based project built with HTML, CSS, and JavaScript. It identifies tokens and checks five student-record fields using a student-ID DFA and regular expressions.


Class: BSCS

#How to Run#

Keep index.html, style.css, and script.js in the same folder, then open index.html in a browser. No installation or internet connection is required.

#How to Use#
1. Choose a sample or Custom record.
2. Enter or edit the text.
3. Click Analyze record to view the result.
4. Click a highlighted invalid value to select and correct it.
   
Samples load without automatic analysis. Custom record starts with an empty editor. Clear resets the editor and results.

Input Rules
Use the fields in this order:
Field	Requirement
ID	Exactly 7 digits
COURSE	2–6 uppercase letters
SUBJECT	2–4 uppercase letters followed by 1–3 digits
GRADES	Whole number 0–100, without leading zeros
EMAIL	Username, @, and a dotted domain with an extension of at least 2 letters


ID 2026003
COURSE BSCS
SUBJECT CS101
GRADES 95
EMAIL esguerra@school.edu

#Results$

The table shows each lexeme, its position starting at 0, token type, and result:
- Recognized: A field label was identified.
- Valid: A value matches its rule.
- Invalid: A value or record structure needs correction; a short reason is shown.
Esguerra and Muso are valid samples. Maria contains an invalid course (b2cs).
Judex contains invalid ID, grade, and email values.

#Scope#
Checks one record at a time. Course, subject, and email checks validate format only. No database or official school-system connection is included.
