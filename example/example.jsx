require("!style!css!sass!../src/scss/_react-magic-zoom.scss");

import MagicZoom from '../src/reactMagicZoom.jsx';
import ReactDOM from 'react-dom';
import React from 'react';

export class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            reflectoinItem: null,
            reflectionChanged: null
        };

        this.handleRefreshReflection = this.handleRefreshReflection.bind(this);
    }

    handleRefreshReflection(item) {
        this.setState({
            reflectoinItem: item,
            reflectionChanged: new Date(),
        });
    };

    getReflectoinItem() {
        return this.refs.id && this.refs.id.getReflection();
    }

    render() {
        let reflectoinItem1 = this.getReflectoinItem(),
            reflectionOpt = {
                type: 'donor',
                position: {
                    left: '100%',
                    top: '10%'
                },
                size: {
                    height: 100,
                    width: 300
                }

            };

        return (
            <div>
                <div>
                    <h2>Original use case:</h2>
                    <MagicZoom>
                        <span>
                            <img src={'http://lorempixel.com/520/400/sports/1'} />
                        </span>
                    </MagicZoom>
                </div>

                <div >
                    <MagicZoom
                        reflection={reflectionOpt}
                        subscribeOnReflection={this.handleRefreshReflection}
                    >
                        <span>
                            <img src={'http://lorempixel.com/520/400/sports/2'} />
                        </span>
                    </MagicZoom>

                    <div>
                        {reflectoinItem1}
                    </div>
                </div>
            </div>);
    }
}

ReactDOM.render(<App/>, document.getElementById('app'));
