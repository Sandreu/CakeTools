/* ============================================================
 * bootstrap-dropdown.js v2.0.2
 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
 * ============================================================
 * Copyright 2012 Twitter, Inc.
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
 * ============================================================ */


!function( $ ){

  "use strict"

 /* DROPDOWN CLASS DEFINITION
  * ========================= */

  var toggle = '[data-toggle="dropdown"]'
    , Dropdown = function ( $element ) {
        this.$el = $element;
        this.isOpened = this.$el.hasClass('open');

        if (this.$el.attr('data-append')=='body' || this.$el.parents('.modal').length) {
          this.$dropdown = this.$el.find('.dropdown-menu');
          this.$dropdown_container = $('<div>');
          this.$dropdown_container.addClass(this.$el.attr('class')).appendTo('body').append(this.$dropdown);
        }
      }

  Dropdown.prototype = {

    constructor: Dropdown,

    toggle: function ( ) {
      var isOpened = this.isOpened;
      clearMenus();

      if (!isOpened) this.open();
    },
    open : function () {
      if (this.isOpened) return;
      this.$el.addClass('open');
      if (isset(this.$dropdown_container)) {
        var p_off = this.$el.offset();

        this.$dropdown_container.addClass('open')
          .offset({
            top:p_off.top,
            left:p_off.left
          })
          .width(this.$el.width())
          .height(this.$el.height())
          .addClass('open');
      }
      this.isOpened = true;
      this.$el.trigger('opened');
    },
    close : function () {
      if (!this.isOpened) return;
      this.$el.removeClass('open');
      if (isset(this.$dropdown_container)) {
        this.$dropdown_container.removeClass('open');
      }
      this.isOpened = false;
      this.$el.trigger('closed');
    }


  }

  function clearMenus() {
    $('.dropdown').dropdown('close')
  }

  function toggleEvt ( e ) {
      var $this = $(this);

      e.preventDefault();

      $this.dropdown('toggle');

      return false
    }

  /* DROPDOWN PLUGIN DEFINITION
   * ========================== */

  $.fn.dropdown = function ( option ) {
    return this.each(function () {
      var $this = $(this);

      if (!$this.hasClass('dropdown')) {
        var selector = $this.attr('data-target');

        if (!selector) {
          selector = $this.attr('href')
          selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
        }

        var $parent = $(selector)
        $parent.length || ($parent = $this.parent())

        $this = $parent;
      }

      var data = $this.data('dropdown');
      if (!data) $this.data('dropdown', (data = new Dropdown($this)))
      if (typeof option == 'string') data[option].call(data)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  /* APPLY TO STANDARD DROPDOWN ELEMENTS
   * =================================== */

  $(function () {
    $('html').off('click.dropdown.data-api')
    $('body').off('click.dropdown.data-api')
    $('html').on('click.dropdown.data-api', clearMenus)
    $('body').on('click.dropdown.data-api', toggle, toggleEvt)
  })

}( window.jQuery );