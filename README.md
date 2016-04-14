This component don’t have a third part dependency.

**Here you can see [DEMO] (http://ilkorn.github.io/react-magic-zoom/) **:

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

**TBD**
