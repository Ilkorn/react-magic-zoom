import MagicZoom from '../src/reactMagicZoom.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

export class App extends React.Component {
    render() {
        return (<MagicZoom/>);
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
