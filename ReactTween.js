var CSSPropertyOperations = require('react/lib/CSSPropertyOperations');
var Tween = require('./Tween');

// Operates in 3 modes:
// 1. CSS tween mode
// 2. CSS every-keyframe mode
// 3. Software rendering (reconcile every frame)

var animationPrefixSeed = 0;

function ReactTween(component, tweenedValue) {
  this.component = component;
  this.tweenedValue = tweenedValue;

  this._tick = this._tick.bind(this);

  // STATE:
  this.startTime = null;
}

ReactTween.prototype.get = function() {
  if (!this.startTime) {
    this._start();
  }

  return Tween.getValue(this.tweenedValue, (Date.now() - this.startTime) / 1000);
};

ReactTween.prototype._start = function() {
  this.startTime = Date.now();
  requestAnimationFrame(this._tick);
};

ReactTween.prototype._tick = function() {
  // TODO: cancel raf when done animating!
  // TODO: do this with setState() and no mutation?
  this.component.forceUpdate();
  requestAnimationFrame(this._tick);
};

ReactTween.prototype.canUseCSS = function() {
  return this.startTime === null;
};

ReactTween.getCSS = function(tweens) {
  // TODO: this is pretty much react-agnostic and could go away.
  var tweenedValues = {};

  for (var key in tweens) {
    tweenedValues[key] = tweens[key].tweenedValue;
  }

  var cssAnimation = Tween.getCSSAnimation(tweenedValues, 'reacttween-' + (animationPrefixSeed++) + '-');
  var keyframeString = '';

  for (var animationName in cssAnimation.keyframes) {
    keyframeString += '@-webkit-keyframes ' + animationName + ' {\n';
    for (var keyframe in cssAnimation.keyframes[animationName]) {
      keyframeString += '  ' + (keyframe * 100) + '% {\n';
      keyframeString += '    ' + CSSPropertyOperations.createMarkupForStyles(cssAnimation.keyframes[animationName][keyframe]) + '\n';
      keyframeString += '  }\n';
    }
    keyframeString += '}\n\n';
  }

  return {style: cssAnimation.css, keyframes: keyframeString};
};

ReactTween.Mixin = {
  tween: function(tweenedValue) {
    return new ReactTween(this, tweenedValue);
  }
};

module.exports = ReactTween;
