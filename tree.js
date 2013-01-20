!function(){

function TreeView(data, propMapObservable){
  var treeView = this,
      propMap = ko.utils.unwrapObservable(propMapObservable);
    
  this.data = data;  
  this.selectedNode = ko.observable();  
  this.children = ko.computed(function(){
       propMap = ko.utils.unwrapObservable(propMapObservable); 
       return dataToNodes(ko.utils.unwrapObservable(data));
  });                                       
  setIsLast(this.children());
  this.children.subscribe(function(newVal){
          setIsLast(newVal);
  });   
  
  

  function dataToNodes(dataArray,old){
      var res = [];
    for(var i=0,l=dataArray.length;i<l;i++){
        res.push(dataArray[i]._treeviewNode || new TreeViewNode(dataArray[i]));
    }
    return res;
  }
    
  function setIsLast(children){
   for(var i=0,l=children.length;i<l;i++){
     children[i].isLast(i==(l-1));   
   }
  }

  function TreeViewNode(data){
   var self = this;
   this.data = data;  
   data._treeviewNode = this;   
   var 
       map = (typeof propMap == 'function') ? propMap(data):propMap;
       captionProp = (map && map.caption)||'caption',
       childrenProp = (map && map.children)||'children';
   this.caption = data[captionProp];
   if(data[childrenProp]) this.children = ko.computed(function(){
         return dataToNodes(ko.utils.unwrapObservable(data[childrenProp]));
    });
    else this.children = null; 
   
   this.isOpen = ko.observable();
   this.isClosed = ko.computed(function(){
        return !this.isOpen();
   },this);
  
   this.isLeaf = ko.computed(function(){
         return !(this.children && this.children().length);
   },this);
   this.isLast = ko.observable(false);
      
   if(this.children){
       setIsLast(this.children());
       this.children.subscribe(function(newVal){
          setIsLast(newVal);
       });   
   }
      
   this.toggleOpen = function(){
     self.isOpen(!self.isOpen());
   };
   
   this.isSelected = ko.computed(function(){
         return (treeView.selectedNode()===this)    
   },this);   
   
   this.toggleSelection = function(){
       if(this.isSelected()) treeView.selectedNode(null);
       else treeView.selectedNode(this);
   }
      
  }

}

var ready = false, template = {
    templateReady: function(cb){
        if(!ready){
            $(function(){
              addCss(css);
              var div = document.createElement("div");
              div.innerHTML = HTML;
              document.body.appendChild(div);
              ready = true;
              cb('kc.treeView');
            });
            return;
        }
        cb('kc.treeView'); 
    }
}

kc.component('treeView',template,function(){
   var map = ko.observable();
   vm = new TreeView(ko.observable([]),map);
   vm.map = map;
   return vm; 
});

function hereDoc(f) {
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}

var HTML = hereDoc(function() {/*! 
<script id='kc.treeView' type='text/html'>
<div class='tree'>
  <ul data-bind='template: {name:"treeNode", foreach: children}'>
  </ul>    
</div>  
</script>
<script id='treeNode' type='text/html'>
  <li data-bind='css:{closed:isClosed,open:isOpen, leaf: isLeaf, last: isLast}, click: toggleOpen, clickBubble: false'> 
    <ins></ins>
    <span class='caption' data-bind='text:caption, css: {selected:isSelected},click:toggleSelection, clickBubble: false'></span>
    <ul data-bind='template: {name:"treeNode", foreach: children}'>
    </ul> 
  </li>  
 </script>
*/}),
   css =  hereDoc(function() {/*!
.tree li, 
.tree ins{ background-repeat:no-repeat; background-color:transparent;
           background-image:url(data:image/gif;base64,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); 
         }
.tree li { background-position:-90px 0; background-repeat:repeat-y; }

.tree li { display:block; min-height:18px; line-height:18px; white-space:nowrap; margin-left:18px; min-width:18px; }

.tree ul, .tree li { display:block; margin:0 0 0 0; padding:0 0 0 0; list-style-type:none; }
.tree li { display:block; min-height:18px; line-height:18px; white-space:nowrap; margin-left:18px; min-width:18px; } 
.tree > ul > li { margin-left:0px; }

.tree li.last { background:transparent; }
.tree .open > ins { background-position:-72px 0;}
.tree .closed > ins { background-position:-54px 0;}
.tree .leaf > ins { background-position:-36px 0;}

.tree ins { display:inline-block; text-decoration:none; width:18px; height:18px; margin:0 0 0 0; padding:0; }
.tree li.open > ul { display:block; }
.tree li.closed > ul { display:none; } 
.tree .selected {background-color: #ccc; }
.tree span.caption {cursor: pointer}
*/});       

function addCss(cssCode) {
var styleElement = document.createElement("style");
  styleElement.type = "text/css";
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = cssCode;
  } else {
    styleElement.appendChild(document.createTextNode(cssCode));
  }
  document.getElementsByTagName("head")[0].appendChild(styleElement);
}

}();


(function( window ) {
    "use strict";
     if(window['jQuery']) return;
    // Define a local copy of $
    var $ = function( callback ) {
            readyBound = false;
            $.isReady = false;
            if ( typeof callback === "function" ) {
                DOMReadyCallback = callback;
            }
            bindReady();
        },

        // Use the correct document accordingly with window argument (sandbox)
        document = window.document,
        readyBound = false,
        DOMReadyCallback = function() {},

        // The ready event handler
        DOMContentLoaded = function() {
            if ( document.addEventListener ) {
                    document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            } else {
                    // we're here because readyState !== "loading" in oldIE
                    // which is good enough for us to call the dom ready!
                    document.detachEvent( "onreadystatechange", DOMContentLoaded );
            }
            DOMReady();
        },

        // Handle when the DOM is ready
        DOMReady = function() {
            // Make sure that the DOM is not already loaded
            if ( !$.isReady ) {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if ( !document.body ) {
                    return setTimeout( DOMReady, 1 );
                }
                // Remember that the DOM is ready
                $.isReady = true;
                // If there are functions bound, to execute
                DOMReadyCallback();
                // Execute all of them
            }
        }, // /ready()

        bindReady = function() {
            var toplevel = false;

            if ( readyBound ) {
                return;
            }
            readyBound = true;

            // Catch cases where $ is called after the
            // browser event has already occurred.
            if ( document.readyState !== "loading" ) {
                DOMReady();
            }

            // Mozilla, Opera and webkit nightlies currently support this event
            if ( document.addEventListener ) {
                // Use the handy event callback
                document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                // A fallback to window.onload, that will always work
                window.addEventListener( "load", DOMContentLoaded, false );
                // If IE event model is used
            } else if ( document.attachEvent ) {
                // ensure firing before onload,
                // maybe late but safe also for iframes
                document.attachEvent( "onreadystatechange", DOMContentLoaded );
                // A fallback to window.onload, that will always work
                window.attachEvent( "onload", DOMContentLoaded );
                // If IE and not a frame
                // continually check to see if the document is ready
                try {
                    toplevel = window.frameElement == null;
                } catch (e) {}
                if ( document.documentElement.doScroll && toplevel ) {
                    doScrollCheck();
                }
            }
        },

        // The DOM ready check for Internet Explorer
        doScrollCheck = function() {
            if ( $.isReady ) {
                return;
            }
            try {
                // If IE is used, use the trick by Diego Perini
                // http://javascript.nwbox.com/IEContentLoaded/
                document.documentElement.doScroll("left");
            } catch ( error ) {
                setTimeout( doScrollCheck, 1 );
                return;
            }
            // and execute any waiting functions
            DOMReady();
        };

    // Is the DOM ready to be used? Set to true once it occurs.
    $.isReady = false;

    // Expose $ to the global object
    window.$ = $;

})( window );
