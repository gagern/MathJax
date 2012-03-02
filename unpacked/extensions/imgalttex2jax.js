/*************************************************************
 *
 *  MathJax/extensions/imgalttex2jax.js
 *  
 *  Implements the TeX to Jax preprocessor that locates TeX code
 *  within the ALT attribute of IMG tags and turns it into
 *  SCRIPT tags for processing by MathJax.
 *
 *  ---------------------------------------------------------------------
 *  
 *  Copyright (c) 2012 Martin von Gagern
 * 
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

MathJax.Extension.imgalttex2jax = {
  version: "1.0",
  config: {
    inlineMath: [              // The start/stop pairs for in-line math
      ['$','$'],               //  (comment out any you don't want, or add your own, but
      ['\\(','\\)']            //  be sure that you don't have an extra comma at the end)
    ],

    displayMath: [             // The start/stop pairs for display math
      ['$$','$$'],             //  (comment out any you don't want, or add your own, but
      ['\\[','\\]']            //  be sure that you don't have an extra comma at the end)
    ],

  },
  
  PreProcess: function (element) {
    if (!this.configured) {
      this.config = MathJax.Hub.CombineConfig("imgalttex2jax",this.config);
      if (this.config.Augment) {MathJax.Hub.Insert(this,this.config.Augment)}
      this.configured = true;
    }
    if (typeof(element) === "string") {element = document.getElementById(element)}
    if (!element) {element = document.body}
    if (this.createPairs()) {
      var imgs = element.getElementsByTagName("img"), i, m, todo = [];
      for (i = 0, m = imgs.length; i < m; i++) {
        res = this.scanElement(imgs[i]);
        if (res) { todo.push(res); }
      }
      for (i = 0, m = todo.length; i < m; i++) {
        res = this.handleMath(todo[i].element, todo[i].tex, todo[i].mode);
      }
    }
  },
  
  createPairs: function () {
    var pairs = [], i, m, config = this.config;
    for (i = 0, m = config.inlineMath.length; i < m; i++) {
      pairs.push({
        mode: "",
        start: config.inlineMath[i][0],
        end: config.inlineMath[i][1]
      });
    }
    for (i = 0, m = config.displayMath.length; i < m; i++) {
      pairs.push({
        mode: "; mode=display",
        start: config.displayMath[i][0],
        end: config.displayMath[i][1]
      });
    }
    this.pairs = pairs.sort(this.sortLength);
    return (pairs.length > 0);
  },
  
  sortLength: function (a,b) {
    if (a.start.length !== b.start.length) {return b.start.length - a.start.length}
    return (a.start == b.start ? 0 : (a < b ? -1 : 1));
  },
  
  scanElement: function (element) {
    var alt, i, m, p;
    alt = element.getAttribute("alt");
    for (i = 0, m = this.pairs.length; i < m; i++) {
      p = this.pairs[i];
      if (alt.length > p.start.length + p.end.length &&
          alt.substring(0, p.start.length) == p.start &&
          alt.substring(alt.length - p.end.length, alt.length) == p.end) {
        return {
          element: element,
          tex: alt.substring(p.start.length, alt.length - p.end.length),
          mode: p.mode
        };
      }
    }
    return null;
  },
  
  handleMath: function (element, tex, mode) {
    var parent = element.parentNode, next = element.nextSibling;
    var script = document.createElement("script");
    script.type = "math/tex" + mode;
    MathJax.HTML.setScript(script,tex);
    parent.removeChild(element);
    if (MathJax.Hub.config.preRemoveClass) {
      var preview = MathJax.HTML.Element("span",{className:MathJax.Hub.config.preRemoveClass});
      preview.appendChild(element);
      parent.insertBefore(preview, next);
    }
    parent.insertBefore(script, next);
  },
  
};

MathJax.Hub.Register.PreProcessor(["PreProcess",MathJax.Extension.imgalttex2jax]);
MathJax.Ajax.loadComplete("[MathJax]/extensions/imgalttex2jax.js");

/** For Emacs:
*** Begin:
*** js-indent-level: 2
*** End:
**/
