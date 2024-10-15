import * as vscode from "vscode";
import { getHoverSrc } from "./utils";

export function activate(context: vscode.ExtensionContext) {
  const disposableImageHover = vscode.languages.registerHoverProvider(
    "typescriptreact",
    {
      provideHover(document, position, token) {
        let src = getHoverSrc(document, position);
        if (!src) {
          return;
        }

        const srcUri = vscode.Uri.parse(src);

        const isHttpsImage = srcUri.scheme === "https";
        const isFileImage = srcUri.scheme === "file";

        if (isFileImage && vscode.workspace.workspaceFolders) {
          // construct full path of the images
          // get current dir of folder
          console.log("isFileImage");
          let wf = vscode.workspace.workspaceFolders[0].uri.path;
          const fullPath = wf + "/public" + src;

          const preview = new vscode.MarkdownString(
            `<img src="${fullPath}" alt="preview-image" width="200px" height="auto" style="object-fit: contain;"/>
            `,
            true
          );

          preview.supportHtml = true;
          preview.isTrusted = true;
          preview.baseUri = vscode.Uri.file(fullPath);

          return new vscode.Hover(
            preview,
            new vscode.Range(position, position)
          );
        }

        if (isHttpsImage) {
          const preview = new vscode.MarkdownString(
            `<img src="${src}" alt="preview-image" width="200px" height="auto" style="object-fit: contain;"/>
            `,
            true
          );

          preview.supportHtml = true;
          preview.isTrusted = true;
          preview.baseUri = vscode.Uri.file(src);

          return new vscode.Hover(
            preview,
            new vscode.Range(position, position)
          );
        }

        return new vscode.Hover("testing");
      },
    }
  );

  context.subscriptions.push(disposableImageHover);
}

// This method is called when your extension is deactivated
export function deactivate() {}
