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

    return content;
  } else if (word === "src") {
    const rowIdx = position.line;

    // get the content of the line
    const line = document.lineAt(rowIdx).text;

    return line;
  } else {
    return null;
  }
}

const findPathFromVariable = (
  variable: string,
  document: vscode.TextDocument
) => {
  // find the line of the variable imported
  // regex to find the import statement
  // retrive the path string of the import
  const findImportValueRegex = new RegExp(
    "^(?:import " + variable + ` from ['"])(.+)(?:['"];{0,1}$)`,
    "gm"
  );

  const path = document.getText().match(findImportValueRegex);

  if (!path) {
    return null;
  }

  const pathString = path[0].replace(findImportValueRegex, "$1");

  return pathString;
};

export const pullValueFromSrcAttribute = (
  content: string,
  document: vscode.TextDocument
): {
  path: string;
  type: "path" | "variable";
} | null => {
  // regex to find src attribute
  const pathStringRegex = /src="([^"]*)"/; // for validate if a src take in a path string
  const variableRegex = /src={([^"]*)}/; // for validate if a src take in variable instead of string

  // remove all line breaks
  content = content.replace(/\n/g, "");
  // remove all white-spaces
  content = content.replace(/\s/g, "");

  const isPathString = content.match(pathStringRegex);
  const isVariable = content.match(variableRegex);

  if (!isPathString && !isVariable) {
    return null;
  }

  if (isPathString) {
    return {
      path: isPathString[1],
      type: "path",
    };
  }

  if (isVariable) {
    const path = findPathFromVariable(isVariable[1], document);
    if (!path) {
      return null;
    }
    return {
      path: path,
      type: "variable",
    };
  }

  return null;
};
