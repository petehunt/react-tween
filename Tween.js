var Bezier = require('./Bezier');

function getCubicBezierEasingFunction(p1x, p1y, p2x, p2y) {
  return new TweenedValueStepEasingFunction('cubic-bezier(' + p1x + ',' + p1y + ',' + p2x + ',' + p2y + ')', Bezier.unitBezier(p1x, p1y, p2x, p2y));
}

var Ease = {
  ease: getCubicBezierEasingFunction(0.25, 0.1, 0.25, 1),
  linear: getCubicBezierEasingFunction(0, 0, 1, 1),
  easeIn: getCubicBezierEasingFunction(0.42, 0, 1, 1),
  easeOut: getCubicBezierEasingFunction(0, 0, 0.58, 1),
  easeInOut: getCubicBezierEasingFunction(0.42, 0, 0.58, 1)
};

function TweenedValueStepEasingFunction(cssName, jsFunction) {
  this.cssName = cssName;
  this.jsFunction = jsFunction;
}

TweenedValueStepEasingFunction.prototype.jsTransform = function(transform) {
  return new TweenedValueStepEasingFunction(
    null, // If doing it in JS we can't use this optimization.
    function(value) {
      return transform(this.jsFunction(value));
    }.bind(this)
  )
};

// A representation of a single CSS property as in a keyframe animation
function TweenedValue(initialValue, steps) {
  this.initialValue = initialValue;
  this.steps = steps;
}

TweenedValue.prototype.cloneWithStep = function(step) {
  return new TweenedValue(this.initialValue, this.steps.concat([step]));
};

function TweenedValueStep(finalValue, duration, easingFunction) {
  this.finalValue = finalValue;
  this.duration = duration;
  this.easingFunction = easingFunction;
}

function getValue(tweenedValue, timeIndex) {
  var currentStartValue = tweenedValue.initialValue;
  var currentTime = 0;
  for (var i = 0; i < tweenedValue.steps.length; i++) {
    var step = tweenedValue.steps[i];
    if (currentTime + step.duration > timeIndex) {
      return currentStartValue + step.easingFunction.jsFunction(
        (timeIndex - currentTime) / step.duration,
        step.duration
      ) * (step.finalValue - currentStartValue);
    }
    currentTime += step.duration;
    currentStartValue = step.finalValue;
  }
  return currentStartValue;
}

var FRAME_TIME = .016;

function getStepByStepCSSAnimation(tweenedValues, animationPrefix, durations) {
  var animationCSS = [];
  var animations = {};

  Object.keys(tweenedValues).forEach(function(key) {
    var animationName = animationPrefix + key;
    var keyframes = animations[animationName] = {};
    
    animationCSS.push(animationName + ' ' + durations[key] + 's forwards');

    for (var currentTime = 0; currentTime < durations[key]; currentTime += FRAME_TIME) {
      var percent = currentTime / durations[key];
      keyframes[percent] = {};
      keyframes[percent][key] = getValue(tweenedValues[key], currentTime);
    }
  });

  return {
    keyframes: animations,
    css: {
      '-webkit-animation': animationCSS.join(', ')
    }
  };
}

function getCSSAnimation(tweenedValues, animationPrefix) {
  var durations = {};
  var needsStepByStep = false;
  Object.keys(tweenedValues).forEach(function(key) {
    durations[key] = tweenedValues[key].steps.reduce(function(accum, step) {
      needsStepByStep = needsStepByStep || !step.easingFunction.cssName;
      return accum + step.duration;
    }, 0);
  });

  if (needsStepByStep) {
    return getStepByStepCSSAnimation(tweenedValues, animationPrefix, durations);
  }
  
  var animationCSS = [];
  var animations = {};
  
  Object.keys(tweenedValues).forEach(function(key) {
    var animationName = animationPrefix + key;
    var keyframes = animations[animationName] = {};
    var currentTime = 0;
    
    animationCSS.push(animationName + ' ' + durations[key] + 's forwards');
    
    keyframes[0] = {};
    keyframes[0][key] = tweenedValues[key].initialValue;
    
    tweenedValues[key].steps.forEach(function(step) {
      currentTime += step.duration;
      var percent = currentTime / durations[key];
      keyframes[percent] = {};
      keyframes[percent][key] = step.finalValue;
      // TODO: browser prefixing
      keyframes[percent]['-webkit-animation-timing-function'] = step.easingFunction.cssName;
    });
  });

  // TODO: use react internals to serialize this to a string
  return {
    keyframes: animations,
    css: {
      '-webkit-animation': animationCSS.join(', ')
    }
  };
}

module.exports = {
  Ease: Ease,
  TweenedValueStepEasingFunction: TweenedValueStepEasingFunction,
  TweenedValueStep: TweenedValueStep,
  TweenedValue: TweenedValue,
  getValue: getValue,
  getCSSAnimation: getCSSAnimation
};
