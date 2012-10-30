_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    evaluate: /<%([\s\S]+?)%>/g
}

function message(type, content, persist) {
  if (type=='valid') type='success';
    var elt = $('<div class="alert fade in alert-'+type+'" style="display:none;"><a class="close" href="#">&times;</a></div>'),
      close = function() { $(this).slideUp('slow'); };
    elt.append(content);
    elt.appendTo('#message_contain').slideDown('slow');
    if (!isset(persist) || !persist) elt.oneTime(10000, close);
    elt.click(close);
}

function isset(variable) {
    return (typeof(variable) != 'undefined');
}

function redirect(url) {
    if (url.indexOf('#', 0)!=-1) {
        if (document.location.href==url) {
            var tabs = $('.left_tabs>ul').data('tabs');
            if (tabs) {
                var pane = $(tabs.getCurrentPane());
                var tab = $(tabs.getCurrentTab());

                pane.load(tab.attr('href'));
                visible_overlay.close();
            } else {
                refresh();
            }
        } else {
            document.location.href=url;
            if (document.location.hash) {
                refresh();
            }
        }
    } else {
        if (document.location.href==url) refresh();
        else document.location.href=url;
    }
}

function refresh() {
    document.location.reload(true);
}

function fullscreen(target) {
  var pfx = ["webkit", "moz", "ms", "o", ""];

  function RunPrefixMethod(obj, method) {
    
    var p = 0, m, t;
    while (p < pfx.length && !obj[m]) {
      m = method;
      if (pfx[p] == "") {
        m = m.substr(0,1).toLowerCase() + m.substr(1);
      }
      m = pfx[p] + m;
      t = typeof obj[m];
      if (t != "undefined") {
        pfx = [pfx[p]];
        return (t == "function" ? obj[m]() : obj[m]);
      }
      p++;
    }
    return false;
  }

  if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
    RunPrefixMethod(document, "CancelFullScreen");
  }
  else {
    if (RunPrefixMethod($(target).get(0), "RequestFullScreen")===false) {
      message('error', '<center><p>Votre navigateur n\'est pas compatible avec cette fonctionnalité</p><p><a href="https://www.google.com/chrome?hl=fr" target="_blank" class="btn btn-primary">Essayez Google Chrome</a></p></center>');
    }
    $(window).trigger('resize');
  }
}

/******************************************************************************
 *
 * Backbone
 * 
 ******************************************************************************/
( function( undefined ) {
    "use strict";

    /**
     * CommonJS shim
     **/
    var _ = window._,
        Backbone = window.Backbone,
        $ = window.$,
        exports = window;

    if (isset(Backbone) && !isset(Backbone.CakeModel)) {
        Backbone.CakeModel = Backbone.RelationalModel.extend({
            cakeModel: false,
            rest : true,
            sync: function () {
                if (!this.rest) return true;
                return Backbone.sync.apply(this, arguments);
            },
            set: function( key, value, options ) {

                // Duplicate backbone's behavior to allow separate key/value parameters, instead of a single 'attributes' object
                var attributes;
                if (_.isObject( key ) || key == null) {
                    attributes = key;
                    options = value;
                }
                else {
                    attributes = {};
                    attributes[ key ] = value;
                }

                var new_attributes = {};
                if (this.cakeModel && isset(attributes[this.cakeModel])) { 
                    _.each(attributes, function (val, key) { if (key != this.cakeModel) new_attributes[key] = val; }, this);
                    _.extend(new_attributes, attributes[this.cakeModel]);
                } else {
                    new_attributes = attributes;
                }
                return Backbone.RelationalModel.prototype.set.call(this, new_attributes, options);
            },
            save: function () {
              var ajax = Backbone.RelationalModel.prototype.save.apply(this, arguments);
              if (!ajax) return ajax;
              else return ajax.success($.proxy(function (data) { this.trigger('saved'); }, this));
            },
            parse: function (response) {
              if (isset(response.data)) return response.data;
              else return response;
            }
        });

        Backbone.CakeView = Backbone.View.extend({
            setFromForm: function (form, model) {
                var data = form.serializeArray(),
                    error = false;

                if (!isset(model)) model = this.model;

                $.each(data, function () {
                    if (!model.set(this.name, this.value)) {
                        fields.filter('[name='+this.name+']').parent().addClass('error');
                        error = true;
                    }
                });
                return !error;
            },
            fill: function () {
                this.$(':input').each($.proxy(function (i, elt) {
                    var $elt = $(elt);
                    if ($elt.attr('type')=='hidden') {
                        if (this.$(':input[name='+$elt.attr('name')+'][type=checkbox]').length) return;
                    }
                    $elt.val(this.model.get($elt.attr('name')));
                }, this));
            },
            loading: function (btn) {
                this.$el.loading();
                if (!isset(btn)) btn = this.$('[type=submit]');
                if (isset(btn) && btn.hasClass('btn')) {
                    if (!btn.data('loading-text')) btn.data('loading-text', 'En cours...');
                    btn.button('loading');
                }
            },
            loaded: function (btn) {
                this.$el.loaded();
                if (!isset(btn)) btn = this.$('[type=submit]');
                if (isset(btn) && btn.hasClass('btn')) btn.button('reset');
            },
            save: function (e) {
                if (isset(e)) e.preventDefault();

                if (this.setFromForm(this.$('form'), this.model)) {
                  this.simple_save();
                }
                return true;
            },
            simple_save: function () {
                var opts  = {};

                this.loading();
                opts.success = $.proxy(function () {
                    if (isset(this.saved))  this.saved();
                    this.loaded();
                    //this.model.trigger('saved', this.model);
                }, this);
                opts.error = $.proxy(function () {
                    this.loaded();
                }, this);
                
                this.model.save({}, opts);
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.$el.trigger('beautifier');

                return this;
            }
        });

        Backbone.ModalForm = Backbone.CakeView.extend({
            title : 'Titre',
            okText : 'Sauvegarder',
            cancelText : 'Retour',
            extraButtons : {},
            _modal : false,
            _form : false,
            originalDatas : {},
            loadModal : function () {
                var modal = new Backbone.BootstrapModal({
                    title : this.title,
                    okText : this.okText,
                    cancelText: this.cancelText,
                    content:this._form
                });
                modal.render();

                if (!_.isEmpty(this.extraButtons)) {
                  var tmpl = _.template('<a href="javascript:void(0);" class="btn btn-{{type}}">{{title}}</a>'),
                    self = this;
                  _.each(this.extraButtons, function (props) {
                    var btn = $(tmpl(props));
                    btn.on('click', $.proxy(self[props.click], self));
                    if (isset(props.pos) && props.pos == 'after') modal.$('.modal-footer').append(btn);
                    else if (isset(props.pos) && props.pos == 'between') modal.$('.ok').before(btn);
                    else modal.$('.modal-footer').prepend(btn);
                  });
                }

                modal.on('shown', this.setFocus, this);
                modal.on('cancel', this.canceled, this);
                modal.on('ok', this.commit, this);

                this._modal = modal;
            },
            setFocus : function () {
                var input = this.$('input:first');
                input.focus();
                if (this.model.isNew()) input.select();
            },
            initialize : function () {
                this.loadModal();
                this.$el = this._modal.$el;
                this.$el.on('hidden', $.proxy(function () { this.model.off('destroy', this.destroyed, this); }, this));
                _.bindAll(this);
            },
            loadForm : function () {
                var form = new Backbone.Form({
                    model : this.model
                });
                form.render();

                this.$('.modal-body').html(form.$el);

                this._form = form;
            },
            render : function () {
                this.originalDatas = this.model.toJSON();
                this.model.on('destroy', this.destroyed, this);

                if (this._form) {
                    this._form.remove();
                    delete this._form;
                }
                this.loadForm();

                this.$el.appendTo('body');
                this._form.$el.trigger('beautifier');

                this.initForm();
                
                this._modal.open();
                
                return this;
            },
            initForm : function () {},
            commit : function () {
                var a = this._form.commit(),
                    self = this;
                if (!isset(a)) {
                    this.model.save({}, {
                        success : function () { self._modal.close(); },
                        error : function (model, xhr) {
                            var data = eval('(' + xhr.responseText + ')');
                            if (isset(data)) {
                                if (isset(data.val_errors)) {
                                    var msg_errors = '';
                                    _.each(data.val_errors, function (val, key) {
                                        if (isset(self._form.fields[key])) self._form.fields[key].setError(val[0]);
                                        else msg_errors += val[0] + '<br />';
                                    });
                                    if (msg_errors!=='') message('error', 'Erreur lors de la sauvegarde');
                                }
                            } else {
                                message('error', 'Erreur lors de la requette')
                            }
                        }
                    });
                }
            },
            canceled : function () {
                if (this.model.isNew()) {
                    this.model.destroy();
                } else {
                    this.model.set(this.originalDatas);
                }
            },
            destroyed : function () {
                this._modal.close();
            }
        });

        //TWITTER BOOTSTRAP TEMPLATES
        //Requires Bootstrap 2.x
        Backbone.Form.setTemplates({

          //HTML
          form: '\
            <form class="form-horizontal">{{fieldsets}}</form>\
          ',

          fieldset: '\
            <fieldset>\
              <legend>{{legend}}</legend>\
              {{fields}}\
            </fieldset>\
          ',

          field: '\
            <div class="control-group field-{{key}}">\
              <label class="control-label" for="{{id}}">{{title}}</label>\
              <div class="controls">\
                {{editor}}\
                <div class="help-inline">{{error}}</div>\
              </div>\
            </div>\
          ',

          naked: '\
            <span class="field-{{key}}">\
              <label for="{{id}}">{{title}}</label>\
              {{editor}}\
              <div class="help-inline">{{error}}</div>\
            </span>\
          ',
          
          checkbox : '\
            <div class="control-group field-{{key}}">\
              <div class="controls">\
                <input type="hidden" name="{{key}}" value="0" />\
                <label class="checkbox" for="{{id}}">\
                  {{editor}}\
                  {{title}}\
                  <div class="help-inline">{{error}}</div>\
                </label>\
              </div>\
            </div>\
          ',

          nestedField: '\
            <div class="field-{{key}}">\
              <div title="{{title}}" class="input-xlarge">{{editor}}\
                <div class="help-inline">{{error}}</div>\
              </div>\
            </div>\
          ',

          list: '\
            <div class="bbf-list">\
              <ul class="unstyled clearfix">{{items}}</ul>\
              <button class="btn bbf-add" data-action="add">Add</button>\
            </div>\
          ',

          listItem: '\
            <li class="clearfix">\
              <div class="pull-left">{{editor}}</div>\
              <button type="button" class="btn bbf-del" data-action="remove">&times;</button>\
            </li>\
          ',

          'list.Modal': '\
            <div class="bbf-list-modal">\
              {{summary}}\
            </div>\
          '
        }, {
        
          //CLASSNAMES
          error: 'error' //Set on the field tag when validation fails
        });

        Backbone.Form.editors.Date = Backbone.Form.editors.Text.extend({
            picker : 'date',
            render: function() {
              this.setValue(this.value);
              this.$el.attr('data-picker', this.picker);
              return this;
            }
        });
        Backbone.Form.editors.DateTime = Backbone.Form.editors.Date.extend({
            picker : 'datetime'
        });
        Backbone.Form.editors.Radio = Backbone.Form.editors.Radio.extend({
          tagName : 'div',
          events: {
            'change input[type=radio]:checked': function() {
              this.trigger('change', this);
            },
            'focus input[type=radio]': function() {
              if (this.hasFocus) return;
              this.trigger('focus', this);
            },
            'blur input[type=radio]': function() {
              if (!this.hasFocus) return;
              var self = this;
              setTimeout(function() {
                if (self.$('input[type=radio]:focus')[0]) return;
                self.trigger('blur', self);
              }, 0);
            }
          },
          _arrayToHtml: function(array) {
            var html = [];
            var self = this;

            //Generate HTML
            _.each(array, function(option, index) {
              if (!_.isObject(option)) {
                option = {
                  val: option,
                  label: option
                }
              }
              option.val = (option.val || option.val === 0) ? option.val : '';
              var item = '<label class="radio">';
              item += '<input type="radio" name="'+self.id+'" id="'+self.id+'-'+index+'" value="'+option.val+'">'
              item += '<span class="label-'+index+'">' + option.label + '</span>';
              item += '</label>';
              html.push(item);
            });

            return html.join('');
          }
        });


        Backbone.Form.editors.RadioBtns = Backbone.Form.editors.Select.extend({
          tagName : 'div',

          events: {
            'change input': function(event) {
              this.trigger('change', this);
            },
            'focus button':  function(event) {
              this.trigger('focus', this);
            },
            'blur button':   function(event) {
              this.trigger('blur', this);
            }
          },

          initialize: function(options) {
            Backbone.Form.editors.Select.prototype.initialize.call(this, options);

            this.$el.removeAttr('name');
            //this.$el.removeAttr('id');
          },

          getValue: function() {
            return this.$('input').val();
          },

          setValue: function(value) {
            return this.$('input').val(value);
          },

          focus: function() {
            if (this.hasFocus) return;

            this.$('button:first').focus();
          },
          
          blur: function() {
            if (!this.hasFocus) return;

            this.$('button:focus').blur();
          },

          _arrayToHtml: function(array) {
            var html = ['<input type="hidden" name="'+this.getName()+'" id="'+this.id+'-f">'];
            var self = this;

            html.push('<div class="btn-group" data-toggle="buttons-radio" data-target="#'+this.id+'-f">');
            //Generate HTML
            _.each(array, function(option, index) {
              if (!_.isObject(option)) {
                option = {
                  val: option,
                  label: option
                }
              }
              option.val = (option.val || option.val === 0) ? option.val : '';
              var item = '<button id="'+self.id+'-'+index+'" class="btn label-'+index+'" data-value="'+option.val+'" type="button">'+option.label+'</button>';
              html.push(item);
            });

            html.push('</div>');

            return html.join('');
          }
        });
    }
})();
/******************************************************************************
 *
 * Tooltips
 * 
 ******************************************************************************/

!function( $ ){
  function tooltip_inits ( e) {
    var context = $(e.target);
    context.find('[rel="tooltip"]').tooltip();
  }

  $(function () {
    tooltip_inits({target:'body'});
    $('body').bind('beautifier', tooltip_inits);
  });
}( window.jQuery );

/******************************************************************************
 *
 * Selectable rows on tables
 * 
 ******************************************************************************/

!function( $ ){

  "use strict"

 /* SELECTABLE CLASS DEFINITION
  * ======================= */

  var Selectable = function ( el, options ) {
        this.$options = $.extend({}, $.fn.selectable.defaults, options);
        this.$elt = el;
        _init.call(this, el);
      }

  Selectable.prototype = {

    constructor: Selectable
  
  , selectRow: function (num) {
      
    }
    
  , selectAll: function() {
      
    }
    
  , unselectAll: function() {
      
    }
    
  , getSelectedRows: function () {
      return this.$elt.find('>tbody>tr.line_selected');
    }
  
  , selectedRowCount: function () {
      return this.getSelectedRows().length;
    }
  }

 /* SELECTABLE PRIVATE METHODS
  * ===================== */
  
  function _init( el ) {
    el.find('>thead>tr').prepend('<th><div class="line_selector"></div></th>');
    el.find('>tbody>tr').prepend('<td><div class="line_selector"></div></td>');
  }
  
  function rowClick( e ) {
    var target = $(e.target);
    var $table = target.closest('table.selectable');
    var tr = target.closest('table.selectable>tbody>tr');

    if (target.hasClass('line_selector')) {
        if (tr.hasClass('line_selected')) {
            tr.removeClass('line_selected');
        } else {
            tr.addClass('line_selected');
        }
    } else {
        target.closest('table.selectable>tbody').children('.line_selected').removeClass('line_selected');
        tr.addClass('line_selected');
    }
    $table.trigger('rowsel', [$table.selectable('getSelectedRows')]);
  }
  
  function headClick( e ) {
    var self = $(this);
    var $table = self.closest('table.selectable');
    if (self.hasClass('checked')) {
        $table.find('>tbody>tr').removeClass('line_selected');
        self.removeClass('checked');
    } else {
        $table.find('>tbody>tr').addClass('line_selected');
        self.addClass('checked');
    }
    $table.trigger('rowsel', [$table.selectable('getSelectedRows')]);
  }
    
 /* SELECTABLE PLUGIN DEFINITION
  * ======================= */

  $.fn.selectable = function ( option ) {
    var out = false;
    var list = this.each(function () {
      var $this = $(this)
        , data = $this.data('selectable')
        , options = typeof option == 'object' && option
      if (!data) $this.data('selectable', (data = new Selectable($this, options)))
      if (typeof option == 'string') out = data[option].call(data)
    })
    if (out) return out;
    return list;
  }

  $.fn.selectable.Constructor = Selectable

  $.fn.selectable.defaults = {
      colWidth: '60px'
  }

 /* SELECTABLE DATA-API
  * ============== */

  $(function () {
    $('table.selectable').selectable();
    $('body').on('click.selectable.data-api', 'table.selectable>tbody', rowClick)
    $('body').on('click.selectable.data-api', 'table.selectable>thead .line_selector', headClick)
  })

}( window.jQuery );


/******************************************************************************
 *
 * Modal ajax improvements
 * 
 ******************************************************************************/
 
!function( $ ){
  
  $(function () {
    $('body').off('click.modal.data-api', '[data-toggle="modal"]');
    $('body').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
      var $this = $(this), href = $this.attr('href'), $target
        , target = $this.attr('data-target')
        , option;

      if (!target) target = href = href.replace(/.*(?=#[^\s]+$)/, '');  //strip for ie7

      if (href.indexOf('javascript:')==0) eval(href);

      e.preventDefault()
      if (target.charAt(0)!='#') {
          $target = $('<div class="modal hide fade"></div>');
          if ($this.attr('data-modal-class')) $target.addClass($this.attr('data-modal-class'));
          if ($this.attr('title')) $target.append('<div class="modal-header"><a class="close" data-dismiss="modal">×</a><h3>'+$this.attr('title')+'</h3></div>');
          if ($this.attr('data-modal-class')) $target.addClass($this.attr('data-modal-class'));
          $target.append('<div class="modal-body" style="height:50px; position:relative;"><div class="loading_window"><div class="loading"></div></div></div>');
          $target.load(target, {modal:true}, null, false).success(function () {
            $target.css({
              'margin-left' : - $target.width() / 2 
            });
          });
          $target.appendTo('body');
          $target.bind('hidden', function () {$(this).remove();})
      } else {
          $target = $(target);
      }
      if ($target.hasClass('absolute')) {
        $target.css({
          'margin-left' : - $target.width() / 2 
        });
      }

      option = $target.data('modal') ? 'toggle' : $.extend({}, $target.data(), $this.data());
      $target.modal(option);
    });
    
    $('body').on('show.modal.data-api', '.modal', function() {
        var existing = $('.modal:visible');

        if (existing.length && existing.get(0)!=this) {
            existing.modal('hide');
        }

        var $this = $(this);
        if ($this.hasClass('absolute')) {
          $this.css({
            'top' : 70 + $this.offsetParent().scrollTop(),
            'margin-left' : - $this.width() / 2 
          });
        }
    });
  })
}( window.jQuery );

/******************************************************************************
 *
 * Ajax Default behavior
 * 
 ******************************************************************************/
 
    $(document).ajaxSuccess(function(e, xhr, options) {
        if (options.dataType!=='json') {
            message('info', 'La réponse n\'est pas reconnue');
            return;
        }
        var data = eval('(' + xhr.responseText + ')');
        if (isset(data)) {
            if (isset(data.redirect)) {
                if (data.redirect.indexOf('#', 0)!=-1) {
                    if (document.location.href==data.redirect) {
                        var overlay = $('.left_tabs>ul').data('tabs');
                        if (overlay) {
                            var pane = $(overlay.getCurrentPane());
                            var tab = $(overlay.getCurrentTab());

                            pane.load(tab.attr('href'));
                            visible_overlay.close();
                        } else {
                            document.location.reload(true);
                        }
                    } else {
                        document.location.href=data.redirect;
                        if (document.location.hash) {
                            document.location.reload(true);
                        }
                    }
                } else {
                    if (document.location.href==data.redirect) document.location.reload(true);
                    else document.location.href=data.redirect;
                }
            }
            if (isset(data.messages)) {
                $.each(data.messages, function (type, msg) {
                    message(type, msg.join('<br />'));
                })
            }
            if (isset(data.html_id)) $('#'+data.html_id).trigger('beautifier');
            if (isset(data.script)) eval(data.script);
        }
    });
    $(document).ajaxError(function(event, jqXHR) {
        if (jqXHR.status != 0 && jqXHR.status != 403) message('error', 'Erreur lors de la requête');
    });

    $.ajaxSetup({
        'dataType' : 'json',
        'cache' : false
    });
    
    $.fn.load = function (url, data, complete, no_loading) {
        // if ((isset(data) && (data===true || data===false)) || isset(complete)) alert('...?');
        var self = $(this);
        if (!isset(no_loading) || !no_loading) self.loading();
        return $.get(url, data, function (data) {
            if (isset(data.html)) {
                self.html(data.html);
            }
        }).complete(function () {
            if (!isset(no_loading) || !no_loading) self.loaded();
            if (typeof complete === 'function') complete.apply(this, arguments);
        });
    };
    
/******************************************************************************
 *
 * Loading widget
 * 
 ******************************************************************************/

    $.fn.loading = function(message) {
        return this.each(function() {
            var elt = $(this),
              ref;

            if (elt.is('tr, td')) ref = elt.closest('table');
            else ref = elt; ;

            if (!isset(message)) message = '';
            if (!elt.data('loading_cpt')) {
                var overlay = $('<div class="ui-widget-overlay" style="display:none;"></div>'),
                  pos = elt.position(),
                  h = elt.height(),
                  w = elt.width();

                pos.top = pos.top + parseInt(elt.css('margin-top').replace('px', '')) + ref.offsetParent().scrollTop();
                pos.left = pos.left  + parseInt(elt.css('margin-left').replace('px', '')) + ref.offsetParent().scrollLeft();
                overlay.css({
                  top:  pos.top,
                  left: pos.left,
                  width: w,
                  height: h
                });
                var win = $('<div class="loading_window"><span>'+message+'</span><div class="loading"></div></div>');
                win.css({
                  top : pos.top + h / 2 - win.height() / 2,
                  left : pos.left + w / 2 - win.width()
                });
                
                ref.parent().append(overlay);
                overlay.fadeIn(2000);
                win.insertAfter(overlay).fadeIn('fast');
                elt.data('loading_overlay', overlay);
                elt.data('loading_win', win);
            }
            var cpt = parseInt(elt.data('loading_cpt'));
            if (!cpt) elt.data('loading_cpt', 1);
            else elt.data('loading_cpt', cpt+1 );
        });
    };
    $.fn.loaded = function() {
        var elt = $(this);
        var cpt = parseInt(elt.data('loading_cpt'));
        if (cpt==1) {
          elt.data('loading_overlay').stop(true, true).slideUp('fast', function () { $(this).remove(); })
          elt.data('loading_win').stop(true, true).fadeOut('fast', function () { $(this).remove(); })
        }
        elt.data('loading_cpt', cpt-1);
    };
 
/******************************************************************************
 *
 * Improved val
 * 
 ******************************************************************************/

    $.fn.oldVal = $.fn.val;
    $.fn.val = function (val) {
        var jsElt = $(this);

        if (isset(val) && jsElt.length > 1) {
          return this.each(function () {
              $(this).val(val);
          });
        }
        
        if (jsElt.is('select') && typeof(val)!='undefined') {
            jsElt.find('option:selected').removeAttr('selected');
            if (typeof(val)=='object'&&(val instanceof Array)) {
                $.each(val, function() {
                    jsElt.find('option[value="'+this+'"]').attr('selected', 'selected');
                })
            } else {
                var opt = jsElt.find('option[value="'+val+'"]');
                opt.attr('selected', 'selected');
            }
            return val;
        } else if (jsElt.is('input') && jsElt.attr('type')=='checkbox') {
            if (isset(val)) {
                if (typeof(val)==='boolean' && val || val===jsElt.val()) jsElt.attr('checked', 'checked');
                else jsElt.removeAttr('checked');
                return this;
            }
        }

        var out;
        if (isset(val)) {
            out = jsElt.oldVal(val);
        } else {
            out = jsElt.oldVal();
        }
        
        return out;
    }

/******************************************************************************
 *
 * Button default
 * 
 ******************************************************************************/

    !function( $ ){
      "use strict"

     /* BUTTON PUBLIC CLASS DEFINITION
      * ============================== */
         var Button = $.fn.button.Constructor;
         
         $.extend(Button.prototype, {
            toggle : function () {
                var $radio = this.$element.parent('[data-toggle="buttons-radio"]')
                    , isOn = this.$element.hasClass('active');

                if ($radio) {
                    var $target = $($radio.data('target'));
                    $radio.find('.active').removeClass('active');
                    if (isOn) {
                        $target.val(null);
                    } else {
                        $target.val(this.$element.data('value'));
                        $target.change();
                        this.$element.addClass('active');
                    }
                } else {
                    this.$element.toggleClass('active');
                }
             }
             
           , check : function () {
                this.$element.addClass('active');
             }
           , uncheck : function () {
                this.$element.removeClass('active');
             }
         });
         

     /* BUTTON PRIVATE METHODS
      * ===================== */
     
     function init_input_buttons ( e ) {
         var $context = $(e.target)
            , $btns = $context.find('[data-toggle^=button]');
         
         $btns.each(function() {
             var $this = $(this)
                , $target = $($this.data('target'));
                
             if ($this.is('.btn')) {
                 if ($target && $this.data('value')==$target.val()) {
                     $btn.button('check');
                 }
             } else {
                 $this.children('.btn').each( function () {
                     var $btn = $(this)
                        , $input = $target;
                     if ($input.length==0 && $btn.data('target')) $input = $($btn.data('target'));
                     
                     $input.bind('change', function () {
                         var vval = '' + $btn.data('value');
                         var val = '' + $input.val();

                         if (isset(val) && vval===val) {
                             $btn.button('check');
                         } else {
                             $btn.button('uncheck');
                         }
                       });
                     $input.change();
                 });
             }
         });
     }
     
     /* BUTTON PLUGIN DEFINITION
      * ======================== */
        $.fn.button = function ( option ) {
            return this.each(function () {
              var $this = $(this)
                , data = $this.data('button')
                , options = typeof option == 'object' && option
              if (!data) $this.data('button', (data = new Button(this, options)))
              if (typeof option == 'string') {
                if (isset(data[option])) data[option]();
                else data.setState(option)
              }
            })
          }

        $.fn.button.defaults = {
            loadingText: 'Chargement...'
        }
      
      $(function () {
          init_input_buttons({target:'body'});
          $('body').bind('beautifier', init_input_buttons);
      });
    }( window.jQuery );


/******************************************************************************
 *
 * Tooltip actions
 * 
 ******************************************************************************/

!function( $ ) {
  "use strict"

  function init_tooltip( e ) {
    var context = $(e.target);
    var abs_edit = context.find('.actions.floated');
    abs_edit.hide(0);
    abs_edit.parent().mouseenter(function () {
        var self = $(this);
        var child = self.children('.actions.floated');
        var top;
        var left = self.width()/2 - child.width()/2;
        
        child.stop(true, true).show(0).css('visibility', 'hidden');
        top = 0 - child.height()/2;

        if (child.offsetParent()[0] != self[0]) {
            self.css({position:'relative'})
            /*var pos = self.position();
            var pos_scroll = self.offsetParent();
            top += pos.top + pos_scroll.scrollTop();
            left += pos.left + pos_scroll.scrollLeft();*/
        }
        child.css({
            top     : top+'px',
            left    : left+'px',
            visibility: 'visible'
        });
    })
    abs_edit.parent().mouseleave(function () {
        $(this).find('.actions.floated').stop(true, true).fadeOut();
    });
  }

  $(function () {
    init_tooltip({target:'body'});
    $('body').bind('beautifier', init_tooltip);
  });
}( window.jQuery );


/******************************************************************************
 *
 * Tabs ajax
 * 
 ******************************************************************************/


!function( $ ) {
  "use strict"

/* TABAJAX CLASS DEFINITION
  * ==================== */

  var TabAjax = function ( element, options ) {
    var self = this;
    this.options = options;
    this.$tabs = element;
    this.$panes = element.parent().find(options.panes);
    if (this.$panes.length==0) this.$panes = $(options.panes);

    element.find(this.options.tabs).each(function (i) {
      $(this).bind('click', function (e) {
        self.setTab(i);
        return e.preventDefault();
      })
    })
    if (element.find(this.options.tabs+'.'+options.activeClass).length==0) this.setTab(0);
  }

  TabAjax.prototype = {

    constructor: TabAjax

  , setTab : function (i) {
      if (i==this.current) return;
      this.current = i;
      this.$tabs.find(this.options.tabs).closest('.'+this.options.activeClass).removeClass(this.options.activeClass);
      var $tab = this.$tabs.find(this.options.tabs).eq(i)
        , $pane

      if ($tab.attr('href').charAt(0)=='#') {
        $pane = $($tab.attr('href'));
      } else {
        $pane = this.$panes.children().eq(i)
      }
      $tab.parent().addClass(this.options.activeClass);

      this.$panes.children().hide(0);
      $pane.fadeIn();
      if (!$pane.html()) {
        $pane.load($tab.attr('href'));
      }

    }
  }
 /* TABAJAX PRIVATE METHODS
  * ===================== */
  function init_ajax_tabs(e) {
    var context = $(e.target);

    context.find('[data-toggle="tabajax"]').tabajax();
  }

 /* TABAJAX PLUGIN DEFINITION
  * ======================= */

  $.fn.tabajax = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tabajax')
        , options = $.extend({}, $.fn.tabajax.defaults, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('tabajax', (data = new TabAjax($(this), options)))
      if (typeof option == 'string') {
        if (option == 'setTab') data.setTab(arguments[2]);
        else data[option]()
      }
    })
  }

  $.fn.tabajax.defaults = {
      tabs : '>.nav a',
      panes : '.tab-content',
      activeClass : 'active'
  }

  $.fn.tabajax.Constructor = TabAjax;

 /* TABAJAX DATA-API
  * ============ */

  $(function () {
      init_ajax_tabs({target:'body'});
      $('body').bind('beautifier', init_ajax_tabs);
  })
}( window.jQuery );


/******************************************************************************
 *
 * ajax forms & buttons
 * 
 ******************************************************************************/



!function( $ ) {
  "use strict"

  function ajax_submit( e ) {
    var $parent = $(this).closest('.ajaxrefresh').parent(),
        $target = $(e.target),
        $btn;

    e.preventDefault(); 
    if ($parent.length==0) $parent = $(this).closest('form').parent();
    $parent.loading();
    $btn = $parent.find('[type="submit"]');
    if (!$btn.data('loading-text')) $btn.data('loading-text', 'En cours...');
    $btn.button('loading');
    $.post($target[0].action, $target.serialize(), function (data) {
        if ($target.hasClass('norefresh')) {

        } else {
            if (isset(data.html)) {
                $parent.html(data.html);
            } else if (isset(data.saved)) {
                if ($('.modal:visible')) $('.modal:visible').modal('hide');
            }
        }
    }).complete(function () { $parent.loaded(); $btn.button('reset'); });
    return false;

  }

  function ajax_button( e ) {
    e.preventDefault();
    var $this = $(this);
    if ($this.data('is_ajaxing')) return false;
    $this.data('is_ajaxing', true);

    if ($this.hasClass('btn')) {
      if (!$this.data('loading-text')) $this.data('loading-text', 'En cours...');
      $this.button('loading');
    }

    $.post($this.attr('href'), null, function (data) {
        $this.trigger('btnAjaxSuccess', [data]);
        if ($this.attr('data-ajax-success')) eval($this.attr('data-ajax-success'));
    }).complete(function () { 
        if ($this.hasClass('btn')) $this.button('reset');
        $this.data('is_ajaxing', false);
    });

    return false;
  }

  $(function () {
    $('body').on('submit.forms.data-api', 'form.ajax', ajax_submit)
    $('body').on('click.forms.data-api', 'a.ajax', ajax_button)
  })
}( window.jQuery );

/******************************************************************************
 *
 * ajax forms & buttons
 * 
 ******************************************************************************/

!function( $ ) {
  "use strict"

  function init_ajax_tabs(e) {
    var context = $(e.target);

    context.find('select.chosen, select.select2').select2();
  }

  $(function () {
      if (isset($.fn.select2)) {
        init_ajax_tabs({target:'body'});
        $('body').bind('beautifier', init_ajax_tabs);
      }
  })
}( window.jQuery );