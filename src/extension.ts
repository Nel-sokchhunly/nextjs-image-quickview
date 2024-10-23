/* eslint-disable curly */
import * as vscode from "vscode";
import { getHoverSrc, pullValueFromSrcAttribute } from "./utils";
import { assert } from "console";

export function activate(context: vscode.ExtensionContext) {
  const revealAssetFileInExplorer = vscode.commands.registerCommand(
    "revealAssetFileInExplorer",
    async (encodedUri: string) => {
      try {
        // Parse the decoded string back to the original path if it's passed as JSON
        let decodedUri = decodeURIComponent(encodedUri);

        const file = vscode.workspace.asRelativePath(decodedUri);

        if (!file || !vscode.workspace.workspaceFolders) {
          return;
        }

        let wf = vscode.workspace.workspaceFolders[0].uri.path;

        const fullPath = wf + "/" + file;
        const uri = vscode.Uri.file(fullPath);

        vscode.commands.executeCommand("revealInExplorer", uri);
      } catch (error) {
        console.error("Error revealing file in VSCode explorer:", error);
      }
    }
  );

  const disposableTSXImageHover = vscode.languages.registerHoverProvider(
    "typescriptreact",
    {
      provideHover(document, position, token) {
        let src = getHoverSrc(document, position);
        if (!src) return;
        let data = pullValueFromSrcAttribute(src, document);
        if (!data) return;

        const srcUri = vscode.Uri.parse(data.path);

        const isHttpsImage = srcUri.scheme === "https";
        const isFileImage = srcUri.scheme === "file";

        if (isFileImage && vscode.workspace.workspaceFolders) {
          // construct full path of the images
          // get current dir of folder
          let imgPath;

          if (data.type === "path") {
            let wf = vscode.workspace.workspaceFolders[0].uri.path;
            imgPath = wf + "/public" + data.path;
          }
          if (data.type === "variable") {
            // get the path to the focused file
            let wf = document.uri.path;
            // remove the file name from the path
            wf = wf.substring(0, wf.lastIndexOf("/") + 1);

            imgPath = wf + data.path;
          }

          if (!imgPath) return;

          const reveal = vscode.Uri.parse(
            `command:revealAssetFileInExplorer?${encodeURIComponent(
              JSON.stringify(imgPath)
            )}`
          );

          const preview = new vscode.MarkdownString(
            `Open [File](${imgPath}) | Reveal [File](${reveal})` +
              "\n\n" +
              `<img src="${imgPath}" alt="preview-image" width="200px" height="auto" style="object-fit: contain;"/>`,
            true
          );

          preview.supportHtml = true;
          preview.isTrusted = true;
          preview.baseUri = vscode.Uri.file(imgPath);

          return new vscode.Hover(
            preview,
            new vscode.Range(position, position)
          );
        }

        if (isHttpsImage) {
          const preview = new vscode.MarkdownString(
            `Open in [browser](${data.path})\n\n<img src="${data.path}" alt="preview-image" width="200px" height="auto" style="object-fit: contain;"/>
            `,
            true
          );

          preview.supportHtml = true;
          preview.isTrusted = true;
          preview.baseUri = vscode.Uri.file(data.path);

          return new vscode.Hover(
            preview,
            new vscode.Range(position, position)
          );
        }

        return new vscode.Hover("testing");
      },
    }
  );

  context.subscriptions.push(
    disposableTSXImageHover,
    revealAssetFileInExplorer
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
