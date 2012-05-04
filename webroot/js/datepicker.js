/* ===========================================================
 * bootstrap-datepicker.js v1.3.0
 * http://twitter.github.com/bootstrap/javascript.html#datepicker
 * ===========================================================
 * Copyright 2011 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Contributed by Scott Torborg - github.com/storborg
 * Loosely based on jquery.date_input.js by Jon Leighton, heavily updated and
 * rewritten to match bootstrap javascript approach and add UI features.
 * =========================================================== */


!function ( $ ) { 
  "use strict";

  var selector = {
        'date':'[data-picker=date]',
        'time':'[data-picker=time]',
        'datetime':'[data-picker=datetime]'
      };


  /* DATEPICKER CLASS DEFINITION
   * ============================ */

  function DatePicker( element, options ) {
    this.$el = $(element);

    this.proxy('ahead').proxy('show').proxy('hide').proxy('keyHandler').proxy('selectDate');

    $.extend(this, options);
    this.$el.data('datepicker', this);
    this.init();
  }

  DatePicker.prototype = {

    init: function() {
        var $months = this.nav('months', 1);
        var $years = this.nav('years', 12);

        var $nav = $('<div>').addClass('nav').append($months, $years);

        this.$month = $('.name', $months);
        this.$year = $('.name', $years);

        var $calendar = $("<div>").addClass('calendar');

        // Populate day of week headers, realigned by startOfWeek.
        for (var i = 0; i < moment.weekdaysShort.length; i++) {
          $calendar.append('<div class="dow">' + moment.weekdaysShort[(i + this.startOfWeek) % 7] + '</div>');
        }

        this.$days = $('<div>').addClass('days');
        $calendar.append(this.$days);

        this.$picker = $('<div>')
          .click(function(e) { e.stopPropagation(); })
          // Use this to prevent accidental text selection.
          .mousedown(function(e) { e.preventDefault(); })
          .addClass('datepicker')
          .append($nav, $calendar);

        this.$block = $('<div class="input-append dropdown"></div>');
        this.$block.insertAfter(this.$el);

        this.$el.detach();
        this.$el.attr('placeholder', this.format);
        this.$el.appendTo(this.$block);

        this.$btn = $('<button class="btn dropdown-toggle" type="button" data-toggle="dropdown">&nbsp;'+this.btn_label+'</button>');
        this.$picker.addClass('dropdown-menu');

        this.$block.append(this.$btn).append(this.$picker);
        this.$block.bind('opened', $.proxy(this.shown, this));
        this.$block.bind('closed', $.proxy(this.hidden, this));
        this.$el.addClass('input-small');

        //this.$btn.click(this.show);
        // if (this.appendTo == 'parent') this.$picker.insertAfter(this.$el);
        // else this.$picker.appendTo(this.appendTo);

        this.$el
          .attr('data-toggle', 'dropdown')
          .change($.proxy(function() { this.selectDate(); }, this));

        this.selectDate();
        this.hide();
    },
      nav: function( c, months ) {
        var $subnav = $('<div>' +
                          '<span class="prev button"><i class="icon-arrow-left"></i></span>' +
                          '<span class="name"></span>' +
                          '<span class="next button"><i class="icon-arrow-right"></i></span>' +
                        '</div>').addClass(c);
        $('.prev', $subnav).click($.proxy(function() { this.ahead(-months, 0); }, this));
        $('.next', $subnav).click($.proxy(function() { this.ahead(months, 0); }, this));
        return $subnav;
    },
    updateName: function($area, s) {
        // Update either the month or year field, with a background flash
        // animation.
        var cur = $area.find('.fg').text(),
            $fg = $('<div>').addClass('fg').append(s);
        $area.empty();
        if (cur !== s) {
          var $bg = $('<div>').addClass('bg');
          $area.append($bg, $fg);
          $bg.fadeOut('slow', function() {
            $(this).remove();
          });
        } else {
          $area.append($fg);
        }
    },
    selectMonth: function(date) {
        var newMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        var mdate = moment(date);

        if (!this.curMonth || !(this.curMonth.getFullYear() === newMonth.getFullYear() &&
                                this.curMonth.getMonth() === newMonth.getMonth())) {

          this.curMonth = newMonth;

          var rangeStart = this.rangeStart(date), rangeEnd = this.rangeEnd(date);
          var num_days = this.daysBetween(rangeStart, rangeEnd);
          var thisDay = moment(new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate(), 12, 0));
          this.$days.empty();

          for (var ii = 0; ii <= num_days; ii++) {
            var $day = $('<div>').attr('date', thisDay.format(this.format));
            $day.text(thisDay.date());

            if (thisDay.month() !== mdate.month()) {
              $day.addClass('overlap');
            }

            this.$days.append($day);
            thisDay.add('days', 1);
          }

          this.updateName(this.$month, mdate.format('MMMM'));
          this.updateName(this.$year, this.curMonth.getFullYear());

          $('div', this.$days).click($.proxy(function(e) {
            var $targ = $(e.target);

            // The date= attribute is used here to provide relatively fast
            // selectors for setting certain date cells.
            this.update($targ.attr("date"));

            // Don't consider this selection final if we're just going to an
            // adjacent month.
            if(!$targ.hasClass('overlap')) {
              this.hide();
            }

          }, this));

          $("[date='" + moment().format(this.format) + "']", this.$days).addClass('today');

        }

        $('.selected', this.$days).removeClass('selected');
        $('[date="' + this.selectedDateStr + '"]', this.$days).addClass('selected');
    },
    selectDate: function(date) {
        if (typeof(date) === "undefined") {
          date = this.parse(this.$el.val());
        }
        
        if (!date) { date = new Date(); }

        this.selectedDate = new Date(date);
        this.selectedDate.setHours(0);
        this.selectedDate.setMinutes(0);
        this.selectedDateStr = moment(this.selectedDate).format(this.format);
        this.selectMonth(this.selectedDate);
    },
    getCurrentDate: function () {
      return new Date(this.selectedDate);
    },
    update: function(s) {
        this.$el.val(s).change();
    },
    shown: function() {
        $('html').on('keydown', this.keyHandler);
    },
    hidden: function() {
        $('html').off('keydown', this.keyHandler);
    },
    show: function() {
        if (!this.$block.hasClass('open')) this.$btn.click();
        return false;
    },
    hide: function() {
        if (this.$block.hasClass('open')) this.$btn.click();
        return false;
    },
    keyHandler: function(e) {
        // Keyboard navigation shortcuts.
        switch (e.keyCode)
        {
          case 9: 
          case 27: 
            // Tab or escape hides the datepicker. In this case, just return
            // instead of breaking, so that the e doesn't get stopped.
            this.hide(); return;
          case 13: 
            // Enter selects the currently highlighted date.
            this.update(this.selectedDateStr); this.hide(); break;
          case 38: 
            // Arrow up goes to prev week.
            this.ahead(0, -7); break;
          case 40: 
            // Arrow down goes to next week.
            this.ahead(0, 7); break;
          case 37: 
            // Arrow left goes to prev day.
            this.ahead(0, -1); break;
          case 39: 
            // Arrow right goes to next day.
            this.ahead(0, 1); break;
          default:
            return;
        }
        e.preventDefault();
    },
    parse: function(s) {
        if (s) return moment(s, this.format).toDate();
        return null;
    },
    ahead: function(months, days) {
        // Move ahead ``months`` months and ``days`` days, both integers, can be
        // negative.
        this.selectDate(new Date(this.selectedDate.getFullYear(),
                                 this.selectedDate.getMonth() + months,
                                 this.selectedDate.getDate() + days));
    },
    proxy: function(meth) {
        // Bind a method so that it always gets the datepicker instance for
        // ``this``. Return ``this`` so chaining calls works.
        this[meth] = $.proxy(this[meth], this);
        return this;
    },
    daysBetween: function(start, end) {
        // Return number of days between ``start`` Date object and ``end``.
        start = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        end = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
        return (end - start) / 86400000;
    },
    findClosest: function(dow, date, direction) {
        // From a starting date, find the first day ahead of behind it that is
        // a given day of the week.
        var difference = direction * (Math.abs(date.getDay() - dow - (direction * 7)) % 7);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + difference);
    },
    rangeStart: function(date) {
        // Get the first day to show in the current calendar view.
        return this.findClosest(this.startOfWeek,
                                new Date(date.getFullYear(), date.getMonth()),
                                -1);
    },
    rangeEnd: function(date) {
        // Get the last day to show in the current calendar view.
        return this.findClosest((this.startOfWeek - 1) % 7,
                                new Date(date.getFullYear(), date.getMonth() + 1, 0),
                                1);
    }
  };


  /* TIMEPICKER CLASS DEFINITION
   * ============================ */

  function TimePicker( element, options ) {
    this.$el = $(element);

    //this.proxy('show').proxy('ahead').proxy('hide').proxy('keyHandler').proxy('selectDate');

    $.extend(this, options);
    this.$el.data('timepicker', this);
    this.init();
  }

  TimePicker.prototype = {
    init: function() {
      this.$block = $('<div class="input-append"></div>');
      this.$block.insertAfter(this.$el);

      this.$el.detach();
      this.$el.attr('placeholder', '00:00');
      this.$el.appendTo(this.$block);

      this.$block.append(this.dropdown());
      this.$el.addClass('input-mini');
      this.$block.addClass('timepicker');
    },
    dropdown: function () {
      var span = $('<span class="dropdown"></span>');
      this.$btn = $('<button class="btn" type="button" data-toggle="dropdown">&nbsp;'+this.btn_label+'</button>');
      this.$btn.data('toggle', 'dropdown');
      this.$btn.addClass('dropdown-toggle');
      this.$timeList = $('<ul class="dropdown-menu pull-right right" style="margin-top:10px"></ul>');

      var self = this;
      $.each(this.list, function (i, el) {
        var a = $('<a href="#">'+el+'<span class="details">'+i+'</span></a>');
        var li = $('<li></li>');
        a.data('value', i);
        li.append(a);
        self.$timeList.append(li);
      });
      span.append(this.$btn);
      span.append(this.$timeList);
      this.$timeList.on('click', 'a', $.proxy(this.clickList, this));
      return span;
    },
    getTimeList: function () {
      return this.$timeList;
    },
    hide: function () {
      this.$block.hide();
    },
    show: function () {
      this.$block.show();
    },
    clickList: function ( e ) {
      var data = $(e.currentTarget).data('value');
      this.$el.val(data);
      this.$el.trigger('change');
    }
  };

  /* DATETIMEPICKER CLASS DEFINITION
   * ============================ */

  function DateTimePicker( element, options ) {
    this.$el = $(element);

    $.extend(this, options);
    this.$el.data('datetimepicker', this);
    this.init();
  }

  DateTimePicker.prototype = {
    init: function() {
      var $marker = $('<span>').insertBefore(this.$el);
      this.$el.detach().attr('type', 'hidden').insertAfter($marker);
      $marker.remove();

      this.$date = $('<input type=text data-picker="date" />');
      this.$time = $('<input type=text data-picker="time" />');
      this.$container = $('<span class="datetimepicker"></span>');
      this.$container.append(this.$date).append('&nbsp;').append(this.$time);

      this.$container.insertAfter(this.$el);

      this.$date.datepicker(this.datepicker);
      this.$time.timepicker(this.timepicker);

      this.$date.change($.proxy(this.update, this));
      this.$time.change($.proxy(this.update, this));

      this.$el.change($.proxy(this.updated, this));
      if (this.$el.val()) this.$el.change();
    },
    update: function () {
      var date = moment(this.$date.data('datepicker').getCurrentDate());
      var time_tab = this.$time.val().split(':');

      if (time_tab.length===2) {
        date.add('hours', time_tab[0]);
        date.add('minutes', time_tab[1]);
      }
      this.$el.val(date.format(this.format));
    },
    updated: function () {
      var date = moment(this.$el.val(), this.format),
          dpi = this.$date.data('datepicker'),
          tpi = this.$time.data('timepicker');

      this.$date.val(date.format(dpi.format));
      dpi.selectDate(date.toDate());
      this.$time.val(date.format(tpi.format));
    },
    hideTime : function() {
      this.$time.parent().hide();
    },
    showTime: function() {
      this.$time.parent().show();
    },
    setDateTime: function (date) {
      var mdate = moment(date);
      this.$el.val(mdate.format(this.format));
      this.$el.change();
    }
  };

  /* DATEPICKER PRIVATE FUNCTIONS
   * ============================ */

  function init_datepicker( e ) {
    var $context = $(e.target);
    $context.find(selector.date).datepicker();
    $context.find(selector.time).timepicker();
    $context.find(selector.datetime).datetimepicker();
  }
  
  /* DATEPICKER PLUGIN DEFINITION
   * ============================ */

  $.fn.datepicker = function( option ) {
    return this.each(function() {
      var $this = $(this),
          options = $.extend({}, $.fn.datepicker.defaults, $this.data(), typeof option === 'object' && option );

      if (typeof options.datepicker !== 'object') new DatePicker(this, options);
    });
  };

  $.fn.timepicker = function( option ) {
    return this.each(function() {
      var $this = $(this),
          options = $.extend({}, $.fn.timepicker.defaults, $this.data(), typeof option === 'object' && option );

      if (typeof options.timepicker !== 'object') { new TimePicker(this, options); }
    });
  };

  $.fn.datetimepicker = function( option ) {
    return this.each(function() {
      var $this = $(this),
          options = $.extend({}, $.fn.datetimepicker.defaults, $this.data(), typeof option === 'object' && option );

      if (typeof options.datetimepicker !== 'object') { new DateTimePicker(this, options); }
    });
  };

  $(function() {
    init_datepicker({target:'body'});
    $('body').bind('beautifier', init_datepicker);
  });

  $.fn.datepicker.Constructor = DatePicker;
  $.fn.timepicker.Constructor = TimePicker;
  $.fn.datetimepicker.Constructor = DateTimePicker;

  $.fn.datepicker.defaults = {
    startOfWeek: 1,
    btn_label : '<i class="icon-calendar"></i>',
    appendTo: 'body',
    format: 'YYYY-MM-DD'
  };

  $.fn.timepicker.defaults = {
    btn_label : '<i class="icon-time"></i>',
    list: {
      '09:00': 'Matin',
      '14:00': 'Après-midi',
      '18:00': 'Fin de journée'
    },
    format: 'HH:mm'
  };

  $.fn.datetimepicker.defaults = {
    format: 'YYYY-MM-DD HH:mm',
    datepicker : {format: 'DD MMM YYYY'},
    timepicker : {}
  };
}( window.jQuery || window.ender );
