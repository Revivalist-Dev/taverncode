package ai.taverncode.client.ui.md

import ai.taverncode.client.session.ui.selection.SessionSelection
import ai.taverncode.client.session.ui.style.SessionEditorStyle

internal class MdViewHybrid(
    style: SessionEditorStyle = SessionEditorStyle.current(),
    selection: SessionSelection? = null,
    code: MdCodeBlockFactory = MdCodeBlockFactory.default(),
) : ai.taverncode.client.ui.md.hybrid.MdViewHybrid(style, selection, code)
