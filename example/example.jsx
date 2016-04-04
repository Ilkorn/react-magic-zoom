require("!style!css!sass!../src/scss/_react-magic-zoom.scss");

import MagicZoom from '../src/reactMagicZoom.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

export class App extends React.Component {
    render() {
        return (
            <MagicZoom>
                <span>
                    <img src={'https://placeimg.com/640/480/any'} />
                </span>
            </MagicZoom>);
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
