const test = require('node:test');
const assert = require('node:assert/strict');

const { applyPatches } = require('../patches');

test('maximize patch grows the auxiliary bar by the editor width', () => {
    const source = [
        'setAuxiliaryBarMaximized(t){if(this.ec||t===this.isAuxiliaryBarMaximized())return!1;if(t){',
        'const e={sideBarVisible:this.isVisible("workbench.parts.sidebar"),editorVisible:this.isVisible("workbench.parts.editor"),panelVisible:this.isVisible("workbench.parts.panel"),auxiliaryBarVisible:this.isVisible("workbench.parts.auxiliarybar")};',
        'this.nb.setRuntimeValue(qs.AUXILIARYBAR_WAS_LAST_MAXIMIZED,!0),this.ec=!0;try{e.auxiliaryBarVisible||this.gc(!1);',
        'const i=this.H.getViewSize(this.P).width;this.nb.setRuntimeValue(qs.AUXILIARYBAR_LAST_NON_MAXIMIZED_SIZE,i),',
        'e.sideBarVisible&&this.ac(!0),e.panelVisible&&this.dc(!0),e.editorVisible&&this.$b(!0),',
        'this.nb.setRuntimeValue(qs.AUXILIARYBAR_LAST_NON_MAXIMIZED_VISIBILITY,e)}finally{this.ec=!1}}}'
    ].join('');

    const result = applyPatches(source);

    assert.match(
        result.content,
        /const i=this\.H\.getViewSize\(this\.P\),n=e\.editorVisible\?this\.H\.getViewSize\(this\.Q\)\.width:0;/
    );
    assert.match(
        result.content,
        /this\.H\.resizeView\(this\.P,\{width:i\.width\+n,height:i\.height\}\)/
    );
});
