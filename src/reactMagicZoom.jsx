/*jshint esnext: true */

import React from 'react';
import ReactDom from 'react-dom';
import classNames from 'classnames';
import _ from 'lodash';

class MagicZoom extends React.Component {
    constructor(props) {
        super(props);

        this.$image = undefined;
        this.$cursorFrame = undefined;
        this.$reflection = undefined;
        this.$imageWrapper = undefined;

        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleMouseMoveOnImage = this.handleMouseMoveOnImage.bind(this);
        this.handleMouseLeaveFromImage = this.handleMouseLeaveFromImage.bind(this);
        this.handleMouseEnterOnImage = this.handleMouseEnterOnImage.bind(this);

        this.delayedReflectionHandler = _.debounce(this.reflectionSubscribersCall, 10);

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
        let state = this.state;

        state.elementsState.reflection.scale = this.props.reflection.scale || 2;
        if (this.props.reflection.type && this.props.reflection.type !== 'auto') {
            state.elementsState.reflection.type = this.props.reflection.type;
        }

        if (this.$image) {
            state.elementsState.imageWrapper.style = {
                heigth: this.$image.height,
                width: this.$image.width
            };
        }

        // auto calculation
        if (!this.props.reflection.size && this.$image) {
            state.elementsState.reflection.size.height = this.$image.height;
            state.elementsState.reflection.size.width = this.$image.width;
        } else {
            state.elementsState.reflection.size.height = this.props.reflection.size.height;
            state.elementsState.reflection.size.width = this.props.reflection.size.width;
        }
        if (this.props.reflection.position === 'right'  ||
             this.props.reflection.position === 'left'  ||
             this.props.reflection.position === 'top'   ||
             this.props.reflection.position === 'bottom') {

            state.elementsState.reflection.position['left'] = '0';
            state.elementsState.reflection.position['top'] = '0';

            state.elementsState.reflection.position[this.props.reflection.position] = '110%';
        } else {
            state.elementsState.reflection.position = this.props.reflection.position;
        }

        this.setState(state);
    }

    initializeCursorFrame() {
        var state = this.state,
            cursorFrameProps = this.props.cursorFrame,
            cursorFrameState = state.elementsState.cursorFrame,
            scale = this.props.reflection.scale || 2;

        if (cursorFrameProps) {
            if (cursorFrameProps.type) {
                cursorFrameState.type = cursorFrameProps.type;
            }
        }

        if (cursorFrameState.type === 'default' || !this.$image) {
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
                height: state.elementsState.reflection.size.height / scale,
                width: state.elementsState.reflection.size.width / scale
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

    // Handler methods
    handleImageLoad(event) {
        if (event.target.tagName.toLowerCase() === 'img') {
            let state = this.state;

            this.$image = event.target;
            this.$reflection = this.preInitializeElement(null, 'reflection');
            this.$cursorFrame = this.preInitializeElement(null, 'cursorFrame');
            this.setState(state);
        }
    }

    handleMouseMoveOnImage(event) {
        var state = this.state,
            nativeEvent = event.nativeEvent,
            reflectionElement = this.getDomElement('reflection'),
            cursorFrame = this.getDomElement('cursorFrame'),
            eventPoint = {};

        if (event.type === 'mousemove') {
            if (event.target === this.$image) {
                eventPoint = {
                    x: nativeEvent.offsetX,
                    y: nativeEvent.offsetY
                };
            } else {
                eventPoint = {
                    x: nativeEvent.target.offsetLeft + nativeEvent.offsetX,
                    y: nativeEvent.target.offsetTop + nativeEvent.offsetY
                };
            }
        } else if (event.type === 'touchmove') {
            eventPoint = {
                x: nativeEvent.touches[0].clientX - this.refs.zoomWrapper.offsetLeft,
                y: nativeEvent.touches[0].clientY - this.refs.zoomWrapper.offsetTop
            };
            event.preventDefault();
        }

        if (event.target === this.$image) {
            this.calculateMouseAndCursorPositionByImage(state, eventPoint, reflectionElement, cursorFrame);
        } else if (cursorFrame === event.target) {
            this.calculateMouseAndCursorPositionByCursorFrame(state, eventPoint, cursorFrame);
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

    reflectionSubscribersCall(element) {
        this.props.subscribeOnReflection && this.props.subscribeOnReflection(element);
    }

    // Calculators
    calculateMouseAndCursorPositionByImage(state, eventPoint, reflectionElement, cursorFrame) {
        state.elementsState.reflection.background.position.x = -(eventPoint.x * this.state.elementsState.reflection.scale -
                                                                (reflectionElement.offsetWidth / 2));
        state.elementsState.reflection.background.position.y = -(eventPoint.y * this.state.elementsState.reflection.scale -
                                                                (reflectionElement.offsetHeight / 2));

        // frame
        if (!state.elementsState.cursorFrame.overflow) {
            this.calculateCursorPositionByClosestBorder(
                state,
                eventPoint,
                {
                    width: this.$image ? this.$image.width : 0,
                    height: this.$image ? this.$image.height : 0
                });
        } else if (cursorFrame) {
            state.elementsState.cursorFrame.position.y = eventPoint.y;
            state.elementsState.cursorFrame.position.x = eventPoint.x;
        }
    }

    calculateMouseAndCursorPositionByCursorFrame(state, eventPoint, cursorFrame) {
        var imageSize = {};

        imageSize = {
            width: this.$image ? this.$image.width : 0,
            height: this.$image ? this.$image.height : 0
        };

        // hide if mouse blur
        if (eventPoint.x > imageSize.width ||
            eventPoint.x < 0 ||
            eventPoint.y > imageSize.height ||
            eventPoint.y < 0) {
            state.elementsState.reflection.disabled = true;
        } else {

            if (!state.elementsState.cursorFrame.overflow) {
                this.calculateCursorPositionByClosestBorder(state, eventPoint, imageSize);
            } else {
                if (cursorFrame) {
                    state.elementsState.cursorFrame.position.x = eventPoint.x;
                    state.elementsState.cursorFrame.position.y = eventPoint.y;
                }
            }

            state.elementsState.reflection.background.position.x = -((eventPoint.x) *
                this.state.elementsState.reflection.scale - (this.state.elementsState.reflection.size.width / 2));

            state.elementsState.reflection.background.position.y = -((eventPoint.y) *
                this.state.elementsState.reflection.scale - (this.state.elementsState.reflection.size.height / 2));
        }
    }

    calculateCursorPositionByClosestBorder(state, eventPoint, imageSize) {
        if (((eventPoint.x + (state.elementsState.cursorFrame.size.width / 2) >= imageSize.width) ||
            (eventPoint.x - (state.elementsState.cursorFrame.size.width / 2) <= 0))) {

            if (eventPoint.x + (state.elementsState.cursorFrame.size.width / 2) >= imageSize.width) {
                state.elementsState.cursorFrame.position.x = imageSize.width - state.elementsState.cursorFrame.size.width / 2;
            }

            if (eventPoint.x - (state.elementsState.cursorFrame.size.width / 2) <= 0) {
                state.elementsState.cursorFrame.position.x = state.elementsState.cursorFrame.size.width / 2;
            }
        } else {
            state.elementsState.cursorFrame.position.x = eventPoint.x;
        }

        if (!state.elementsState.cursorFrame.overflow &&
            (eventPoint.y + (state.elementsState.cursorFrame.size.height / 2) >= imageSize.height) ||
            (eventPoint.y - (state.elementsState.cursorFrame.size.height / 2) <= 0)) {

            if (eventPoint.y + (state.elementsState.cursorFrame.size.height / 2) >= imageSize.height) {
                state.elementsState.cursorFrame.position.y = imageSize.height - state.elementsState.cursorFrame.size.height / 2;
            }

            if (eventPoint.y - (state.elementsState.cursorFrame.size.height / 2) <= 0) {
                state.elementsState.cursorFrame.position.y = state.elementsState.cursorFrame.size.height / 2;
            }

        } else {
            state.elementsState.cursorFrame.position.y = eventPoint.y;
        }
    }

    getDomElement(refName, existReflection) {
        let existElement = ReactDom.findDOMNode(this.refs[refName]);

        return existElement || this.preInitializeElement(existReflection, refName,
            {
                show: true
            });
    }

    // Pre-render methods
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
        var state = this.state,
            reflectionSettings = this.state.elementsState.reflection,
            style = {
                height: reflectionSettings.size.height + 'px',
                width: reflectionSettings.size.width + 'px',
            },
            element;

        style = _.assign(style, reflectionSettings.position);

        if (reflectionSettings.disabled) {
            return null;
        }

        if (this.$image) {

            style.backgroundImage = 'url(' + this.$image.src + ')';
            style.backgroundSize = (state.elementsState.imageWrapper.style.width * reflectionSettings.scale) + 'px ' +
                                   (state.elementsState.imageWrapper.style.heigth * reflectionSettings.scale) + 'px';
            style.backgroundPosition = reflectionSettings.background.position.x + 'px ' +
                                       reflectionSettings.background.position.y + 'px';
        }

        element = (
            <div
                ref="reflection"
                style={style}
                className="magic-zoom__reflection"
            />
        );

        if (this.props.subscribeOnReflection) {
            this.delayedReflectionHandler(element);
        }
        return element;
    }

    render() {
        var cursorFrame = this.getCursorFrame(),
            imageReflection = this.getReflection(),
            wrapperStyle = this.state.elementsState.imageWrapper.style;

        if (this.props.type === 'donor') {
            imageReflection = null;
        }

        return (
            <div
                ref='zoomWrapper'
                className={classNames('magic-zoom__wrapper', this.props.className)}
                onLoad={this.handleImageLoad}
                onMouseMove={this.handleMouseMoveOnImage}
                onMouseEnter={this.handleMouseEnterOnImage}
                onMouseLeave={this.handleMouseLeaveFromImage}

                onTouchMove={this.handleMouseMoveOnImage}
                onTouchStart={this.handleMouseEnterOnImage}
                onTouchEnd={this.handleMouseLeaveFromImage}
                onTouchCancel={this.handleMouseLeaveFromImage}
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

        type: 'auto',

        // Value:   'left', 'right', 'top', 'bottom' - position of
        //                                              reflection
        position: 'left',

        // Value: @flaot - scale coefficient
        scale: 2
    }
};
