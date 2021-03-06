(function ($) {
  var _nus = function (data) {
    this._api_ = window.namespace + '/api/v1/shorten/';
    this._form_ = '#nus';
    this._errormsg_ = 'An error occurred shortening that link';
  };

  _nus.prototype.init = function () {
    this.$urlInput = $(this._form_).find('#link');
    this.$aliasInput = $(this._form_).find('#nus-alias');

    if (!this.check(this.$urlInput.val())) {
      return this.alert(this._errormsg_, true);
    }

    this.request(this.$urlInput.val(), this.$aliasInput.val());
  };

  _nus.prototype.check = function (s) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  };

  _nus.prototype.alert = function (message, error) {
    var t = error === true ? 'alert-danger' : 'alert-success';

    $('.alert').alert('close');
    $('<div class="alert ' + t + ' alert-dismissible" role=alert>'
      + '<button type=button class=close data-dismiss=alert aria-label=Close><span aria-hidden=true>&times;</span></button>'
      + message
      + '</div>').insertBefore(this._form_);
  };

  _nus.prototype.request = function (url, alias) {
    var self = this;
    $.post(self._api_, { long_url: url, alias: alias }, function (data) {
      if (data.hasOwnProperty('status_code') && data.hasOwnProperty('status_txt')) {
        if (parseInt(data.status_code) === 200) {
          var shortUrl = window.location.origin + window.namespace + '/' + data.hash;
          self.$urlInput.val(shortUrl).select();
          return self.alert('Copy your shortened url');
        } else {
          self._errormsg_ = data.status_txt;
        }
      }
      return self.alert(self._errormsg_, true);
    }).error(function () {
      return self.alert(self._errormsg_, true);
    });
  };

  $(function () {
    var n = new _nus();
    var clipboard = new Clipboard('.btn');

    $(n._form_).on('submit', function (e) {
      e && e.preventDefault();
      n.init();

      clipboard.on('success', function(e) {
        n.alert('Copied to clipboard!');
      });

      clipboard.on('error', function(e) {
        n.alert('Error copying to clipboard', true);
      });
    });
  });

})(window.jQuery);
