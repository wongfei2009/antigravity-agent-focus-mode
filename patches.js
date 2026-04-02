const PATCHES = [
    {
        name: 'grow auxiliary bar into former editor width',
        old: 'const i=this.H.getViewSize(this.P).width;this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE,i),e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0),this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY,e)',
        new: 'const i=this.H.getViewSize(this.P),n=e.editorVisible?this.H.getViewSize(this.Q).width:0;this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE,i.width),e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0),this.H.resizeView(this.P,{width:i.width+n,height:i.height}),this.nb.setRuntimeValue(tr.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY,e)',
    },
    {
        name: 'skip hiding sidebar and panel during maximize',
        old: 'e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0)',
        new: 'e.editorVisible&&this.$b(!0)',
    },
    {
        name: 'sidebar toggle no longer triggers de-maximize',
        old: 'ac(t){if(!(!t&&this.setAuxiliaryBarMaximized(!1)&&this.isVisible("workbench.parts.sidebar"))){if(',
        new: 'ac(t){if(!0){if(',
    },
    {
        name: 'skip sidebar and panel restore on un-maximize',
        old: 'this.$b(!e?.editorVisible),this.dc(!e?.panelVisible),this.ac(!e?.sideBarVisible)',
        new: 'this.$b(!e?.editorVisible)',
    },
    {
        name: 'hide Open Agent Manager button',
        old: 'se(this.ub,this.nb),this.kb',
        new: 'this.kb',
    },
    {
        name: 'auto-retry on agent error',
        old: 'y=(E,S)=>({label:E,onClick:()=>{p([Vi(bT,{chunk:{case:"text",value:S}})])}});',
        new: 'y=(E,S)=>{let _act={label:E,onClick:()=>{p([Vi(bT,{chunk:{case:"text",value:S}})])}};if(!window.__agentAutoRetry)window.__agentAutoRetry={count:0,ts:0,nid:""};let _ar=window.__agentAutoRetry;Date.now()-_ar.ts>6e4&&(_ar.count=0);if(_ar.count<30&&_ar.nid!==i){_ar.nid=i;_ar.count++;_ar.ts=Date.now();setTimeout(()=>{_act.onClick()},900+Math.random()*200)}return _act};',
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
