Marionette.attrSync = (function(Marionette) {

  var isArray = _.isArray;

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

      var attrLists = this._attrLists;
      var attrList = null;

      for (var i = 0, l = attrLists.length; i < l; i++) {
        attrList = attrLists[i];

        // if we have a simple string array with attribute names
        if (isArray(attrList)) {
          this._setUpList(attrList);
          continue;
        }

        // if we have an object
        attrList = this._setUpSyncObject(attrList);

        var doBirectional = attrList && attrList.hasOwnProperty('bidirectional') &&
                            attrList.bidirectional === true &&
                            attrList.hasOwnProperty('setSyncPartners');

        if (doBirectional) {
          this._setUpSyncObject({
            attrs: attrList.syncsWith,
            syncsWith: attrList.attrs,
            set: attrList.setSyncPartners
          });
        }
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
      this._setUpSyncObject({
        attr: attr,
        syncsWith: otherAttr,
        set: function(attrs) {
          return attrs[otherAttr];
        }
      });
    },

    _extractRealAttrsArray: function(attrs) {
      var model = this._model;
      var ret = [];
      var attr = '';

      for (var i = 0, l = attrs.length; i < l; i++) {
        attr = attrs[i];
        if (model.has(attr)) {
          ret.push(attr);
        }
      }

      return ret;
    },

    _setUpSyncObject: function(obj) {
      var hasAttr = obj.hasOwnProperty('attr');

      if (hasAttr) {
        obj.attrs = [obj.attr];
      }
      
      var hasAttrs = obj.hasOwnProperty('attrs');
      var hasSyncs = obj.hasOwnProperty('syncsWith');

      if (!hasAttrs || !hasSyncs) {
        return;
      }

      if (!isArray(obj.syncsWith)) {
        obj.syncsWith = [obj.syncsWith];
      }

      obj.attrs = this._extractRealAttrsArray(obj.attrs);
      obj.syncsWith = this._extractRealAttrsArray(obj.syncsWith);

      var cb = this._createSyncCallback(obj.attrs, obj.syncsWith, obj.set);
      this._bindSyncCallback(obj.attrs, obj.syncsWith, cb);

      return obj;
    },

    _currentValuesForAttrs: function(attrs) {
      var hash = {};
      var model = this._model;
      var attr = '';

      for (var i = 0, l = attrs.length; i < l; i++) {
        attr = attrs[i];
        hash[attr] = model.get(attr);
      }

      return hash;
    },

    _extractRealAttrs: function(attrsHash) {
      var model = this._model;
      var ret = {};

      for (var attr in attrsHash) {
        if (attrsHash.hasOwnProperty(attr) && model.has(attr)) {
          ret[attr] = attrsHash[attr];
        }
      }

      return ret;
    },

    _createSyncCallback: function(depAttrs, syncAttrs, setFn) {
      var self = this;
      var model = this._model;

      return function() {
        var attrs = self._currentValuesForAttrs(syncAttrs);
        var data = setFn.call(null, attrs);

        if (depAttrs.length == 1) {
          var hash = {};
          hash[depAttrs[0]] = data;
          data = hash;
        }

        data = self._extractRealAttrs(data);
        model.set(data, { silent: true });
      };
    },

    _bindSyncCallback: function(depAttrs, syncAttrs, cb) {
      var binder = this._binder;
      var model = this._model;

      for (var i = 0, l = syncAttrs.length; i < l; i++) {
        binder.bindTo(model, 'change:' + syncAttrs[i], cb);
      }
    }
  });


  // Public API
  // ----------
  return function(model, attrLists) {
    var sync = new AttrSync(model, attrLists);
    return sync;
  };

})(Marionette);
