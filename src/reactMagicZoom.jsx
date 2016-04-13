/*jshint esnext: true */

import React from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';

class MagicZoom extends React.Component {
    constructor(props) {
        super(props);

        this.$image = undefined;
        this.$imageFrame = undefined;
        this.$imageReflection = undefined;
        this.$imageWrapper = undefined;

        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleMouseMoveOnImage = this.handleMouseMoveOnImage.bind(this);
        this.handleMouseLeaveFromImage = this.handleMouseLeaveFromImage.bind(this);
        this.handleMouseEnterOnImage = this.handleMouseEnterOnImage.bind(this);

        this.state = {

            elementsState: {
                imageWrapper: {
                    style: {}
                },

                reflection: {
                    size: {
                        height: 0,
                        width: 0
                    },

                    position: {
                    },

                    background: {
                        position: {
                            x: 0,
                            y: 0
                        }
                    },

                    disabled: true
                },

                cursorFrame: {
                    //default
                    type: 'default',

                    overflow: false,

                    size: {
                        height: 0,
                        width: 0
                    },

                    position: {
                        x: 0,
                        y: 0,
                        offsetX: 0,
                        offsetY: 0
                    }
                }
            }
        };
    }

    componentDidMount() {
        this.initializeComponentState();

        this.setState(this.state);
    }

    componentWillUnmount() {

    }

    // Initialization methods
    initializeComponentState() {
        // ToDo move changable props to state
        // preset default option by component type
        var state = this.state;
        this.setState(state);
    }

    initializeReflection() {
        if (this.props.reflection.size === 'auto' && this.$image) {
            let state = this.state;

            state.elementsState.reflection.size.height = this.$image.height;
            state.elementsState.reflection.size.width = this.$image.width;
            state.elementsState.imageWrapper.style = {
                heigth: this.$image.height,
                width: this.$image.width
            };
            this.setState(state);
        }
    }

    initializeCursorFrame() {
        var state = this.state,
            cursorFrameProps = this.props.cursorFrame,
            cursorFrameState = state.elementsState.cursorFrame;

        if (cursorFrameProps) {
            if (cursorFrameProps.type) {
                cursorFrameState.type = cursorFrameProps.type;
            }
        }

        if (cursorFrameState.type === 'default') {
            cursorFrameState.position = {
                x: 0,
                y: 0,
                offsetX: -80,
                offsetY: -80
            };

            cursorFrameState.size = {
                height: 160,
                width: 160
            };
        } else if (cursorFrameState.type === 'auto') {
            cursorFrameState.size = {
                height: this.$image.height / this.props.reflection.scale,
                width: this.$image.width / this.props.reflection.scale
            };

            cursorFrameState.position = {
                x: 0,
                y: 0,
                offsetX: cursorFrameState.size.width / 2,
                offsetY: cursorFrameState.size.height / 2
            };
        }

        state.elementsState.cursorFrame = cursorFrameState;
        this.setState(state);
    }

    preInitializeElement(element, elementName, options) {

        let capitalizedName = elementName.charAt(0).toUpperCase() + elementName.slice(1);
        if (!element) {
            if (options && options.show) {
                let state = this.state;
                state.elementsState.reflection.disabled = false;
                this.setState(state);
            }

            this['initialize' + capitalizedName]();
            return this['get' + capitalizedName]();
        } else {
            return element;
        }
    }

    // Handler methids
    handleImageLoad(event) {
        if (event.target.tagName.toLowerCase() === 'img') {
            let state = this.state;

            this.$image = event.target;
            this.preInitializeElement(null, 'cursorFrame');

            // ToDo: fix issue
            // if (userAgent.isDesktopAgent())
            this.preInitializeElement(null, 'reflection');
            this.setState(state);
        }
    }

    handleMouseMoveOnImage(event) {
        var state = this.state,
            nativeEvent = event.nativeEvent,
            reflectionElement = this.getDomElement('reflection'),
            cursorFrame = this.getDomElement('cursorFrame');

        if (event.target === this.$image) {
            this.calculateMouseAndCursorPositionByImage(state, nativeEvent, reflectionElement, cursorFrame);
        } else if (cursorFrame === event.target) {
            this.calculateMouseAndCursorPositionByCursorFrame(state, nativeEvent, cursorFrame);
        }

        this.setState(state);
    }

    handleMouseLeaveFromImage(event) {
        var state = this.state;
        state.elementsState.reflection.disabled = true;
        this.setState(state);
    }

    handleMouseEnterOnImage(event) {
        var state = this.state;
        state.elementsState.reflection.disabled = false;

        // should update cursor postion

        this.setState(state);
    }

    // Calculators
    calculateMouseAndCursorPositionByImage(state, nativeEvent, reflectionElement, cursorFrame) {
        state.elementsState.reflection.background.position.x = -(nativeEvent.offsetX * this.props.reflection.scale -
                                                                (reflectionElement.offsetWidth / 2));
        state.elementsState.reflection.background.position.y = -(nativeEvent.offsetY * this.props.reflection.scale -
                                                                (reflectionElement.offsetHeight / 2));

        // frame
        if (!state.elementsState.cursorFrame.overflow) {
            this.calculateCursorPositionByClosestBorder(
                state,
                nativeEvent,
                {
                    x: nativeEvent.offsetX,
                    y: nativeEvent.offsetY
                },
                {
                    width: this.$image ? this.$image.width : 0,
                    height: this.$image ? this.$image.height : 0
                });
        } else if (cursorFrame) {
            state.elementsState.cursorFrame.position.y = nativeEvent.offsetY;
            state.elementsState.cursorFrame.position.x = nativeEvent.offsetX;
        }
    }

    calculateMouseAndCursorPositionByCursorFrame(state, nativeEvent, cursorFrame) {
        var cursorRelatedPosition = {},
            imageSize = {};

        // check if cursor out of $image
        cursorRelatedPosition.x = nativeEvent.target.offsetLeft + nativeEvent.offsetX;
        cursorRelatedPosition.y = nativeEvent.target.offsetTop + nativeEvent.offsetY;

        imageSize = {
            width: this.$image ? this.$image.width : 0,
            height: this.$image ? this.$image.height : 0
        };

        if (cursorRelatedPosition.x > imageSize.width ||
            cursorRelatedPosition.x < 0 ||
            cursorRelatedPosition.y > imageSize.height ||
            cursorRelatedPosition.y < 0) {
            state.elementsState.reflection.disabled = true;
        } else {

            if (!state.elementsState.cursorFrame.overflow) {
                this.calculateCursorPositionByClosestBorder(state, nativeEvent, cursorRelatedPosition, imageSize);
            } else {
                if (cursorFrame) {
                    state.elementsState.cursorFrame.position.x = nativeEvent.target.offsetLeft + nativeEvent.offsetX;
                    state.elementsState.cursorFrame.position.y = nativeEvent.target.offsetTop + nativeEvent.offsetY;
                }
            }

            state.elementsState.reflection.background.position.x = -((cursorRelatedPosition.x) *
                this.props.reflection.scale - (this.state.elementsState.reflection.size.width / 2));

            state.elementsState.reflection.background.position.y = -((cursorRelatedPosition.y) *
                this.props.reflection.scale - (this.state.elementsState.reflection.size.height / 2));
        }
    }

    calculateCursorPositionByClosestBorder(state, nativeEvent, cursorRelatedPosition, imageSize) {
        if (((cursorRelatedPosition.x + (state.elementsState.cursorFrame.size.width / 2) >= imageSize.width) ||
            (cursorRelatedPosition.x - (state.elementsState.cursorFrame.size.width / 2) <= 0))) {

            if (cursorRelatedPosition.x + (state.elementsState.cursorFrame.size.width / 2) >= imageSize.width) {
                state.elementsState.cursorFrame.position.x = imageSize.width - state.elementsState.cursorFrame.size.width / 2;
            }

            if (cursorRelatedPosition.x - (state.elementsState.cursorFrame.size.width / 2) <= 0) {
                state.elementsState.cursorFrame.position.x = state.elementsState.cursorFrame.size.width / 2;
            }
        } else {
            state.elementsState.cursorFrame.position.x = nativeEvent.target.offsetLeft + nativeEvent.offsetX;
        }

        if (!state.elementsState.cursorFrame.overflow &&
            (cursorRelatedPosition.y + (state.elementsState.cursorFrame.size.height / 2) >= imageSize.height) ||
            (cursorRelatedPosition.y - (state.elementsState.cursorFrame.size.height / 2) <= 0)) {

            if (cursorRelatedPosition.y + (state.elementsState.cursorFrame.size.height / 2) >= imageSize.height) {
                state.elementsState.cursorFrame.position.y = imageSize.height - state.elementsState.cursorFrame.size.height / 2;
            }

            if (cursorRelatedPosition.y - (state.elementsState.cursorFrame.size.height / 2) <= 0) {
                state.elementsState.cursorFrame.position.y = state.elementsState.cursorFrame.size.height / 2;
            }

        } else {
            state.elementsState.cursorFrame.position.y = nativeEvent.target.offsetTop + nativeEvent.offsetY;
        }
    }

    // Utils methods Todo: apply widthOffset fix
    getDomElement(refName) {
        let existElement = ReactDom.findDOMNode(this.refs[refName]);

        return existElement || this.preInitializeElement(existReflection, refName,
            {
                show: true
            });
    }

    // Prerender methods
    getCursorFrame() {
        var cursorFrameSettings = this.state.elementsState.cursorFrame,
            classNames = 'magic-zoom__cursor-frame',
            style = {},
            element;

        if (this.state.elementsState.reflection.disabled) {
            return null;
        }

        if (cursorFrameSettings.type === 'default') {
            classNames += ' magic-zoom__cursor-frame--default';
        } else if (cursorFrameSettings.type === 'auto') {
            classNames += ' magic-zoom__cursor-frame--auto';
            style = {
                width: cursorFrameSettings.size.width + 'px',
                height: cursorFrameSettings.size.height + 'px'
            };
        }

        style.top = (cursorFrameSettings.position.y - cursorFrameSettings.position.offsetY) + 'px';
        style.left = (cursorFrameSettings.position.x - cursorFrameSettings.position.offsetX) + 'px';

        element = (
            <div ref='cursorFrame'
                className={classNames}
                style={style}
            />
        );

        return element;
    }

    getReflection() {
        var reflectionSettings = this.state.elementsState.reflection,
            style = {
                height: reflectionSettings.size.height + 'px',
                width: reflectionSettings.size.width + 'px',
                left: '110%',
                top: 0
            },
            element;

        if (reflectionSettings.disabled) {
            return null;
        }

        if (this.$image) {

            style.backgroundImage = 'url(' + this.$image.src + ')';
            style.backgroundSize = (reflectionSettings.size.width * this.props.reflection.scale) + 'px ' +
                                   (reflectionSettings.size.height * this.props.reflection.scale) + 'px';
            style.backgroundPosition = reflectionSettings.background.position.x + 'px ' +
                                       reflectionSettings.background.position.y + 'px';
        }

        element = (
            <div
                style={style}
                className="magic-zoom__reflection"
                ref="reflection"
            />
        );

        return element;
    }

    render() {
        var cursorFrame = this.getCursorFrame(),
            imageReflection = this.getReflection(),
            wrapperStyle = this.state.elementsState.imageWrapper.style;

        return (
            <div
                ref='zoomWrapper'
                className={'magic-zoom__wrapper'}
                onLoad={this.handleImageLoad}
                onMouseMove={this.handleMouseMoveOnImage}
                onMouseEnter={this.handleMouseEnterOnImage}
                onMouseLeave={this.handleMouseLeaveFromImage}
                style={wrapperStyle}
            >
                {this.props.children}
                {cursorFrame}
                {imageReflection}
            </div>
        );
    }
}

export default MagicZoom;

MagicZoom.propTypes = {
    children: React.PropTypes.element.isRequired,
    type: React.PropTypes.oneOf(['auto', 'custom', 'invider', 'donor'])
};

MagicZoom.defaultProps = {
    // temporary for testing

    type: 'auto',

    cursorFrame: {

        type: 'auto',

        // can be {heigth: int, width: int} or auto string
        size: 'auto',

        // ablility of frame moving out of original image
        overflow: true
    },

    reflection: {

        // Value:   'auto' - clone of original image
        //          {heigth: int, width: int} - dimention
        size: 'auto',

        // Value:   'left', 'right', 'top', 'bottom' - position of
        //                                              reflection
        position: 'left',

        // Value: @flaot - scale coefficient
        scale: 2
    }
};
