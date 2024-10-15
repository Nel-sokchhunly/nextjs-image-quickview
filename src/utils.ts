import * as vscode from "vscode";

export function getHoverSrc(
  document: vscode.TextDocument,
  position: vscode.Position
) {
  const range = document.getWordRangeAtPosition(position);
  const word = document.getText(range);

  if (word === "Image") {
    // get row number of the word
    const rowIdx = position.line; // starts from 0

    // find end tag of the Image component
    let endTag = "/>";
    let endRowIdx = rowIdx;

    for (let i = rowIdx; i < document.lineCount; i++) {
      const line = document.lineAt(i).text;
      if (line.includes(endTag)) {
        endRowIdx = i + 1;
        break;
      }
    }

    // get the content of the Image component between the row and endRow
    let content = document.getText(
      new vscode.Range(
        new vscode.Position(rowIdx, 0),
        new vscode.Position(endRowIdx, 0)
      )
    );

    if (!content) {
      return;
    }

    return pullValueFromSrcAttribute(content);
  } else if (word === "src") {
    const rowIdx = position.line;

    // get the content of the line
    const line = document.lineAt(rowIdx).text;

    console.log("line", line);

    return pullValueFromSrcAttribute(line);
  } else {
    return null;
  }
}

const pullValueFromSrcAttribute = (content: string) => {
  // regex to find src attribute
  const srcRegex = /src="([^"]*)"/;

  // remove all line breaks
  content = content.replace(/\n/g, "");
  // remove all white-spaces
  content = content.replace(/\s/g, "");

  const srcMatch = content.match(srcRegex);
  if (!srcMatch) {
    return null;
  }

  return srcMatch[1];
};
