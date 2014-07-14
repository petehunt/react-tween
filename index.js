/** @jsx React.DOM */
var React = require('react');
var ReactTween = require('./ReactTween');
var Sprite = require('./Sprite');
var Tween = require('./Tween');

var App = React.createClass({
  getInitialState: function() {
    return {
      left: new ReactTween(this, new Tween.TweenedValue(0, [new Tween.TweenedValueStep(100, 1, Tween.Ease.easeOut), new Tween.TweenedValueStep(50, 2, Tween.Ease.easeIn)])),
      top: new ReactTween(this, new Tween.TweenedValue(0, [new Tween.TweenedValueStep(100, 1, Tween.Ease.easeOut), new Tween.TweenedValueStep(50, 2, Tween.Ease.easeIn)])),
    };
  },

  render: function() {
    return (
      <Sprite
        paddingLeft={this.state.left}
        paddingTop={this.state.top.get() * 2}
        color="red">
        <h1>Hello React!</h1>
      </Sprite>
    );
  }
});

React.renderComponent(<App />, document.body);
