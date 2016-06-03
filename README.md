This component doesn't have any third part dependencies, and works with touch events.

**You can see a [DEMO here](http://ilkorn.github.io/react-magic-zoom/)**

#### Usage:

For use this component you should put inside it node with `<img>` tab with fill `src`:

```js
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
#### Options:

```js
// Type 'auto' - autosize cursor and reflection,
// 'donor' - not render
type: 'auto',

// Method for add subscriber
subscribeOnReflection= function(reflection){}

reflection: {
    // Value:   'left', 'right', 'top', 'bottom' - position of
    //                                              reflection
    //          Object {left: '10px', top: '10%'}
    //
    position: 'left',

    // Value: @flaot - scale coefficient
    scale: 2,

    // reflection size in pixel, as default will be setter size of pictures
    size: {
        height: 100,
        width: 300
    }
}
```
