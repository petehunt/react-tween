/** @jsx React.DOM */
var React = require('react');
var ReactTween = require('./ReactTween');
var Sprite = require('./Sprite');
var Tween = require('./Tween');

var App = React.createClass({
  mixins: [ReactTween.Mixin],

  getInitialState: function() {
    return {
      left: this.tween(new Tween.TweenedValue(0, [new Tween.TweenedValueStep(100, 1, Tween.Ease.easeOut), new Tween.TweenedValueStep(50, 2, Tween.Ease.easeIn)])),
      top: this.tween(new Tween.TweenedValue(0, [new Tween.TweenedValueStep(100, 1, Tween.Ease.easeOut), new Tween.TweenedValueStep(50, 2, Tween.Ease.easeIn)])),
      size: this.tween(new Tween.TweenedValue(16, [new Tween.TweenedValueStep(32, 3, new Tween.TweenedValueStepEasingFunction(null, function(time) {
        // custom JS with no css equivalent placeholder
        if (time < .5) {
          return time;
        } else {
          return 1.0 - time;
        }
      }))]))
    };
  },

  render: function() {
    return (
      <Sprite
        paddingLeft={this.state.left}
        paddingTop={this.state.top.get() * 2}
        fontSize={this.state.size}>
        <h1>Hello React!</h1>
      </Sprite>
    );
  }
});

React.renderComponent(<App />, document.body);
