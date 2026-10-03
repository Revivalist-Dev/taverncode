import * as vscode from "vscode"

export class TavernCodeActionProvider implements vscode.CodeActionProvider {
  static readonly metadata: vscode.CodeActionProviderMetadata = {
    providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.RefactorRewrite],
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
  ): vscode.CodeAction[] {
    if (range.isEmpty) return []

    const actions: vscode.CodeAction[] = []

    const add = new vscode.CodeAction("Add to Tavern Code", vscode.CodeActionKind.RefactorRewrite)
    add.command = { command: "tavern-code.new.addToContext", title: "Add to Tavern Code" }
    actions.push(add)

    const hasDiagnostics = context.diagnostics.length > 0

    if (hasDiagnostics) {
      const fix = new vscode.CodeAction("Fix with Tavern Code", vscode.CodeActionKind.QuickFix)
      fix.command = { command: "tavern-code.new.fixCode", title: "Fix with Tavern Code" }
      fix.isPreferred = true
      actions.push(fix)
    }

    if (!hasDiagnostics) {
      const explain = new vscode.CodeAction("Explain with Tavern Code", vscode.CodeActionKind.RefactorRewrite)
      explain.command = { command: "tavern-code.new.explainCode", title: "Explain with Tavern Code" }
      actions.push(explain)

      const improve = new vscode.CodeAction("Improve with Tavern Code", vscode.CodeActionKind.RefactorRewrite)
      improve.command = { command: "tavern-code.new.improveCode", title: "Improve with Tavern Code" }
      actions.push(improve)
    }

    return actions
  }
}
