Marionette.attrSync = (function(Marionette) {

  // AttrSync Object
  // ---------------

  var AttrSync = function(model, attrLists) {
    this._model = model;
    this._attrLists = attrLists;
    this._isInitialized = false;
    this._binder = new Marionette.EventBinder();
    this._init();
  };

  // AttrSync Members
  // ----------------
  
  _.extend(AttrSync.prototype, {
    destroy: function() {
      this._binder.unbindAll();
      this._isInitialized = false;
    },

    _init: function() {
      if (this._isInitialized) {
        return;
      }

      for (var i = 0, l = this._attrLists.length; i < l; i++) {
        this._setUpList(this._attrLists[i]);
      }

      this._isInitialized = true;
    },

    _setUpList: function(attrList) {
      var model = this._model;
      var l = attrList.length;
      var attr = null, otherAttr = null;

      for (var i = 0; i < l; i++) {
        attr = attrList[i];
        for (var j = 0; j < l; j++) {
          otherAttr = attrList[j];
          if (attr != otherAttr && model.has(attr) && model.has(otherAttr)) {
            this._syncPair(attr, otherAttr);
          }
        }
      }
    },
    
    _syncPair: function(attr, otherAttr) {
      var e = 'change:' + attr;
      var fn = this._syncFn(otherAttr);
      this._binder.bindTo(this._model, e, fn);
    },

    _syncFn: function(attr) {
      return function(model, value) {
        var hash = {};
        hash[attr] = value;
        model.set(hash, { silent: true });
      };
    }
  });


  // Public API
  // ----------
  return function(model, attrLists) {
    var sync = new AttrSync(model, attrLists);
    return sync;
  };

})(Marionette);
