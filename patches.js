const PATCHES = [
    {
        name: 'grow auxiliary bar into former editor width',
        old: 'const i=this.H.getViewSize(this.P).width;this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE,i),e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0),this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY,e)',
        new: 'const i=this.H.getViewSize(this.P),n=e.editorVisible?this.H.getViewSize(this.Q).width:0;this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE,i.width),e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0),this.H.resizeView(this.P,{width:i.width+n,height:i.height}),this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY,e)',
    },
    {
        name: 'skip hiding sidebar during maximize',
        old: 'e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0)',
        new: 'e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0)',
    },
    {
        name: 'sidebar toggle no longer triggers de-maximize',
        old: 'ac(t){if(!(!t&&this.setAuxiliaryBarMaximized(!1)&&this.isVisible("workbench.parts.sidebar"))){if(',
        new: 'ac(t){if(!0){if(',
    },
    {
        name: 'skip sidebar restore on un-maximize',
        old: 'this.$b(!e?.editorVisible),this.dc(!e?.panelVisible),this.ac(!e?.sideBarVisible)',
        new: 'this.$b(!e?.editorVisible),this.dc(!e?.panelVisible)',
    },
    {
        name: 'hide Open Agent Manager button',
        old: 'se(this.ub,this.nb),this.kb',
        new: 'this.kb',
    },
];

function needsPatching(content) {
    return PATCHES.some(patch => content.includes(patch.old));
}

function applyPatches(content) {
    let patched = content;
    const applied = [];

    for (const patch of PATCHES) {
        if (patched.includes(patch.old)) {
            patched = patched.replace(patch.old, patch.new);
            applied.push(patch.name);
        }
    }

    return { content: patched, applied };
}

module.exports = {
    PATCHES,
    applyPatches,
    needsPatching,
};
