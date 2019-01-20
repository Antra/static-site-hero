'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const figureTemplate = "<figure class =\"${figOptions.cssWidthClass}\">\n" +
	"![${figOptions.altText}](${figOptions.path}${figOptions.imageName})\n" +
	"<figcaption>\n" +
	"${figOptions.figCaption}\n" +
	"</figcaption>\n" +
	"</figure>";

let insertText = (value: any) => {
	let editor = vscode.window.activeTextEditor;

	if (!editor) {
		vscode.window.showErrorMessage("Can't insert text because no document is open.");
		return;
	}

	let selection = editor.selection;

	let range = new vscode.Range(selection.start, selection.end);

	editor.edit((editBuilder) => {
		editBuilder.replace(range, value);

	});
};

let getImageTemplate = () => {
	return vscode.workspace.getConfiguration("staticSiteHero")["imagePathTemplate"];
};

let getFilesTemplate = () => {
	return vscode.workspace.getConfiguration("staticSiteHero")["filePathTemplate"];
};

let updateTemplateWithDate = (template: any) => {
	let today = new Date();
	let year = today.getFullYear();
	let month = ('0' + (today.getMonth() + 1)).slice(-2);

	template = template.replace("${year}", year);
	template = template.replace("${month}", month);

	return template;
};

exports.updateTemplateWithDate = updateTemplateWithDate;

let fillFigureTemplate = (figOptions: any) => {
	figOptions.cssClass = figOptions.cssWidthClass + ' ' + figOptions.cssAlignmentClass;
	let figure = figureTemplate.replace('${figOptions.imageName}', figOptions.imageName);
	figure = figure.replace("${figOptions.path}", figOptions.path);
	figure = figure.replace("${figOptions.altText}", figOptions.altText);
	figure = figure.replace("${figOptions.figCaption}", figOptions.figCaption);
	figure = figure.replace("${figOptions.cssWidthClass}", figOptions.cssWidthClass);
	return figure;
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "static-site-hero" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let fileLinkDisposable = vscode.commands.registerCommand('extension.insertLink', () => {
		let linkTypeList = ['File', 'Image'];

		vscode.window.showQuickPick(linkTypeList, { placeHolder: 'Link Type' })
			.then(result => {
				//insertText(result);

				if (result === 'File') {
					insertText("[Link Text](" + updateTemplateWithDate(getFilesTemplate())
						+ ")");
				} else if (result === 'Image') {
					insertText("![Alt Text](" + updateTemplateWithDate(getImageTemplate())
						+ ")");
				}

			});
	});
	context.subscriptions.push(fileLinkDisposable);

	let figureDisposable = vscode.commands.registerCommand('extension.insertFigure', () => {
		let template = getImageTemplate();
		template = updateTemplateWithDate(template);

		let cssWidthClass = vscode.workspace.getConfiguration("staticSiteHero")["widthCssClasses"];
		let cssAlignmentClass = vscode.workspace.getConfiguration("staticSiteHero")["AlignmentCssClasses"];

		let figOptions = {
			imageName: '',
			altText: '',
			figCaption: '',
			path: template,
			cssWidthClass: '',
			cssAlignmentClass: ''

		};

		vscode.window.showInputBox({ prompt: "Image File Name" })
			.then(value => {
				figOptions.imageName = value;
			}).then(() => {
				return vscode.window.showInputBox({ prompt: "Figure Caption" })
					.then(result => {
						figOptions.altText = result;
						figOptions.figCaption = result;
					});
			})
			.then(() => {
				return vscode.window.showQuickPick(cssWidthClass, { placeHolder: "Width Class" })
					.then(result => {
						figOptions.cssWidthClass = result;
					});
			})
			.then(() => {
				return vscode.window.showQuickPick(cssAlignmentClass, { placeHolder: "Alignment Class" })
					.then(result => {
						figOptions.cssAlignmentClass = result;
					});
			})

			.then(() => {
				insertText(fillFigureTemplate(figOptions));

			});

		//		insertText(figureTemplate);

	});
	context.subscriptions.push(figureDisposable);
}



// this method is called when your extension is deactivated
export function deactivate() { }