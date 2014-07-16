var LiveTween = require('./LiveTween');
var ReactUpdates = require('react/lib/ReactUpdates');
var Tween = require('./Tween');

var rafCallbacks = [];

LiveTween.injection.injectRequestAnimationFrame(function(cb) {
  rafCallbacks.push(cb);
});

function _cbIter(cb) {
  return cb();
}

function _tick(prevRafCallbacks) {
  prevRafCallbacks.forEach(_cbIter);
}

function tick() {
  var prevRafCallbacks = rafCallbacks;
  rafCallbacks = [];
  ReactUpdates.batchedUpdates(_tick, prevRafCallbacks);
  window.requestAnimationFrame(tick);
}

tick();

var ReactTween = {
  Mixin: {
    tween: function(initialValue) {
      return new LiveTween(
        new Tween.TweenedValue(initialValue, []),
        false,
        this.forceUpdate.bind(this)
      );
    },

    readableTween: function(initialValue) {
      return new LiveTween(
        new Tween.TweenedValue(initialValue, []),
        true,
        this.forceUpdate.bind(this)
      );
    }
  }
};

module.exports = ReactTween;
