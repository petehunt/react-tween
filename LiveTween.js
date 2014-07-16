var CSSPropertyOperations = require('react/lib/CSSPropertyOperations');
var invariant = require('react/lib/invariant');
var Tween = require('./Tween');

// Operates in 3 modes:
// 1. CSS tween mode
// 2. CSS every-keyframe mode
// 3. Software rendering (reconcile every frame)

var animationPrefixSeed = 0;

function LiveTween(tweenedValue, jsTickCallback, startTime) {
  this.tweenedValue = tweenedValue;
  this.jsTickCallback = jsTickCallback;
  this.startTime = startTime || null;

  // STATE:
  this.unboxed = false;

  if (startTime) {
    this._tick = this._tick.bind(this);
    LiveTween.injection._requestAnimationFrame(this._tick);
  }
}

LiveTween.prototype.to = function(value, duration, easingFunction) {
  invariant(!this.startTime && !this.unboxed, 'LiveTween already started');

  easingFunction = easingFunction || Tween.Ease.linear;

  return new LiveTween(
    this.tweenedValue.cloneWithStep(
      new Tween.TweenedValueStep(value, duration, easingFunction)
    ),
    this.jsTickCallback
  );
};

LiveTween.prototype.get = function() {
  this.unboxed = true;

  if (!this.startTime) {
    return Tween.getValue(this.tweenedValue, 0);
  }

  return Tween.getValue(this.tweenedValue, (Date.now() - this.startTime) / 1000);
};

LiveTween.prototype.start = function() {
  return new LiveTween(
    this.tweenedValue,
    this.jsTickCallback,
    Date.now()
  );
};

LiveTween.prototype._tick = function() {
  // TODO: do this with setState() and no mutation?
  this.jsTickCallback();
  if ((Date.now() - this.startTime) / 1000 <= Tween.getDuration(this.tweenedValue)) {
    LiveTween.injection._requestAnimationFrame(this._tick);
  }
};

LiveTween.prototype.canUseCSS = function() {
  return !this.unboxed;
};

LiveTween.getCSS = function(tweens) {
  var tweenedValues = {};

  for (var key in tweens) {
    if (tweens[key].startTime) {
      tweenedValues[key] = tweens[key].tweenedValue;
    }
  }

  var cssAnimation = Tween.getCSSAnimation(tweenedValues, 'livetween-' + (animationPrefixSeed++) + '-');
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

LiveTween.injection = {
  _requestAnimationFrame: null,
  injectRequestAnimationFrame: function(_requestAnimationFrame) {
    LiveTween.injection._requestAnimationFrame = _requestAnimationFrame;
  }
};

module.exports = LiveTween;
