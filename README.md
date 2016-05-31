This component don’t have a third part dependency.
Work correct for touch devices.

**Here you can see [DEMO](http://ilkorn.github.io/react-magic-zoom/)**

####Usage:

For use this component you should put inside it node with `<img>` tab with fill `src`:

```
require("!style!css!sass!../src/scss/_react-magic-zoom.scss");

import React from ‘react’;
import ReactDOM from ‘react-com’;
import ReactMagicZoom from ‘react-magic-zoom’;

export class App extends React.Component {
    render() {
        return (
            <MagicZoom>
                <span>
                    <img src={'http://lorempixel.com/520/400/sports/1'} />
                </span>
            </MagicZoom>
	);
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
```
####Option:

```
reflection: {

    // Type 'auto' - autosize cursor and reflection,
    // 'donor' - not render
    type: 'auto',

    // Value:   'left', 'right', 'top', 'bottom' - position of
    //                                              reflection
    //          Object {left: '10px', top: '10%'}
    //
    position: 'left',

    // Value: @flaot - scale coefficient
    scale: 2
}
```
