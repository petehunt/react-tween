/** @jsx React.DOM */
var React = require('react');
var ReactTween = require('./ReactTween');
var Sprite = require('./Sprite');
var Tween = require('./Tween');

var App = React.createClass({
  mixins: [ReactTween.Mixin],

  getInitialState: function() {
    return {
      left: this.tween(0)
        .to(100, 1, Tween.Ease.easeOut)
        .to(50, 2, Tween.Ease.easeIn),
      top: this.tween(0)
        .to(100, 1, Tween.Ease.easeOut)
        .to(50, 2, Tween.Ease.easeIn),
      size: this.tween(16)
        .to(32, 3, Tween.Ease.linear.chain(null, function(time) {
          // custom JS with no css equivalent placeholder
          if (time < .5) {
            return time;
          } else {
            return 1.0 - time;
          }
        }))
    };
  },

  componentDidMount: function() {
    this.setState({
      left: this.state.left.start(),
      top: this.state.top.start(),
      size: this.state.size.start()
    });
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
