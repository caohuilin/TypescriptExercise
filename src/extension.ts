'use strict';
/*
*
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "helloword" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        const editor  = vscode.window.activeTextEditor;
        if(!editor) {
            return "create editor wrong";
        }
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        vscode.window.showInformationMessage("selected characters:" + text.length);
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}
*/

import {window, commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument} from 'vscode'

export function activate(context: ExtensionContext) {
    console.log("active");

    const wordCount = new WordCount();
    const controller = new WordCountController(wordCount)

    const disposable = commands.registerCommand('extension.sayHello', ()=>{
        
        wordCount.updateWordCount(); 
    
    })

    context.subscriptions.push(controller);
    context.subscriptions.push(disposable);
}

class WordCount {
    private _statusBarItem: StatusBarItem;

    public updateWordCount() {
        if(!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        }

        const editor = window.activeTextEditor;
        if(!editor) {
            console.log("wrong");
            return;
        }

        const doc = editor.document;
        if(doc.languageId === "markdown") {
        
            const wordCount = this._getWordCount(doc);

            this._statusBarItem.text = wordCount !==1 ? `${wordCount} Words` :'1 word';
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    public _getWordCount(doc: TextDocument): number {
        let docContent = doc.getText();

        docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

        let wordCount = 0;
        if(docContent !="") {
            wordCount = docContent.split(" ").length;
        }

        return wordCount;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class WordCountController {

    private _wordCounter: WordCount;
    private _disposable: Disposable;

    constructor(wordCounter: WordCount) {
        this._wordCounter = wordCounter;
        this._wordCounter.updateWordCount();

        let subscriptions: Disposable[] = []
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose()
    }

    private _onEvent() {
        this._wordCounter.updateWordCount();
    }

}

