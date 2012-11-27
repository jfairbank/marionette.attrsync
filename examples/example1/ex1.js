(function($, _, Backbone, Marionette) {
  // Helpers
  function dimensionInches(feet, inches) {
    if (arguments.length == 1) {
      inches = feet;
      feet = 0;
    }

    return Number(parseFloat(feet) * 12 + parseFloat(inches)).toFixed(2);
  }

  function dimensionFeetAndInches(inches) {
    var feet = parseFloat(inches) / 12;
    inches = Number(feet % 1 * 12).toFixed(2);
    feet = Math.floor(feet).toFixed(2);

    return {
      feet: feet,
      inches: inches
    };
  }

  // Model
  var DimensionList = Backbone.Model.extend({});

  // View for model
  var DimensionView = Marionette.ItemView.extend({
    template: '#example-template',

    events: {
      'blur input[type="text"]': 'checkSync'
    },

    checkSync: function(e) {
      var input = e.target;
      this.model.set(input.name.trim(), input.value.trim());
      this.render();
    }
  });

  var Region = Marionette.Region.extend({
    el: '#content'
  });

  // run
  var dList = new DimensionList({
    cornerRadius: 5,
    rFt: 0,
    rIn: 0,
    a: 1,
    b: 2
  });

  var attrSync = Marionette.attrSync(dList, [
    ['a', 'b'],

    {
      attr: 'cornerRadius',
      syncsWith: ['rFt', 'rIn'],
      bidirectional: true,

      set: function(attrs) {
        return dimensionInches(attrs.rFt, attrs.rIn);
      },

      setSyncPartners: function(attrs) {
        var data = dimensionFeetAndInches(attrs.cornerRadius);
        return {
          rFt: data.feet,
          rIn: data.inches
        };
      }
    }
  ]);

  var view = new DimensionView({ model: dList });
  var region = new Region();
  region.show(view);

})(jQuery, _, Backbone, Marionette);