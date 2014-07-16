/** @jsx React.DOM */

var React = require('react');
var LiveTween = require('./LiveTween');

var insertCSS = require('insert-css');

var Sprite = React.createClass({
  ensureCSSInserted: function(prevTweens, nextTweens) {
    // TODO: remove old css!

    for (var key in nextTweens) {
      if (nextTweens[key] !== prevTweens[key]) {
        this._cssAnimation = LiveTween.getCSS(nextTweens);
        insertCSS(this._cssAnimation.keyframes);
        return;
      }
    }
  },

  _getLiveTweens: function(props) {
    // TODO: remove this?
    var tweens = {};
    for (var key in props) {
      if (!props.hasOwnProperty(key)) {
        continue;
      }

      if (props[key] instanceof LiveTween) {
        tweens[key] = props[key];
      }
    }
    return tweens;
  },

  componentWillMount: function() {
    this.ensureCSSInserted({}, this._getLiveTweens(this.props));
  },

  componentWillReceiveProps: function(nextProps) {
    this.ensureCSSInserted(
      this._getLiveTweens(this.props),
      this._getLiveTweens(nextProps)
    );
  },

  render: function() {
    var style = {};
    for (var key in this.props) {
      var prop = this.props[key];
      if (prop instanceof LiveTween) {
        if (!prop.canUseCSS()) {
          style[key] = prop.get();
        }
      } else {
        style[key] = prop;
      }
    }
    for (key in this._cssAnimation.style) {
      style[key] = this._cssAnimation.style[key];
    }
    return <div style={style}>{this.props.children}</div>;
  }
});

module.exports = Sprite;
