/*! Pick-a-Color v1.1.8 | Copyright 2013 Lauren Sperber and Broadstreet Ads https://github.com/lauren/pick-a-color/blob/master/LICENSE | pick-a-color 2013-10-19 */
!function (a) {
    "use strict";
    a.fn.pickAColor = function (b) {
        var c = "ontouchstart"in window, d = (parseInt(a(window).width(), 10) < 767 ? !0 : !1, "localStorage"in window && null !== window.localStorage && "object" == typeof JSON), e = document.all && !window.atob, f = c ? "touchstart.pickAColor" : "mousedown.pickAColor", g = c ? "touchmove.pickAColor" : "mousemove.pickAColor", h = c ? "touchend.pickAColor" : "mouseup.pickAColor", i = c ? "touchend.pickAColor" : "click.pickAColor", j = "dragging.pickAColor", k = "endDrag.pickAColor", l = a.extend({showSpectrum: !0, showSavedColors: !0, saveColorsPerElement: !1, fadeMenuToggle: !0, showAdvanced: !0, showBasicColors: !0, showHexInput: !0, allowBlank: !1, basicColors: {white: "fff", red: "f00", orange: "f60", yellow: "ff0", green: "008000", blue: "00f", purple: "800080", black: "000"}}, b);
        l.showAdvanced || l.showBasicColors || (l.showBasicColors = !0);
        var m = l.showSavedColors && l.showAdvanced || l.showBasicColors && l.showSavedColors || l.showBasicColors && l.showAdvanced, n = function () {
            var b = a("<div>").addClass("btn-group"), c = a("<button type='button'>").addClass("btn color-dropdown dropdown-toggle"), d = a("<span>").addClass("color-preview current-color"), f = a("<span>").addClass("caret"), g = a("<div>").addClass("color-menu dropdown-menu");
            if (l.showHexInput || (c.addClass("no-hex"), g.addClass("no-hex")), b.append(c.append(d).append(f)), m || l.showSpectrum || g.addClass("small"), m) {
                var h = a("<div>").addClass("color-menu-tabs"), i = l.showBasicColors ? "savedColors-tab tab" : "savedColors-tab tab tab-active";
                l.showBasicColors && h.append(a("<span>").addClass("basicColors-tab tab tab-active").append(a("<a>").text("Basic Colors"))), l.showSavedColors && h.append(a("<span>").addClass(i).append(a("<a>").text("Saved Colors"))), l.showAdvanced && h.append(a("<span>").addClass("advanced-tab tab").append(a("<a>").text("Advanced"))), g.append(h)
            }
            if (l.showBasicColors) {
                var j = a("<div>").addClass("basicColors-content active-content");
                l.showSpectrum && j.append(a("<h6>").addClass("color-menu-instructions").text("Tap spectrum or drag band to change color"));
                var tab = a("<table>").addClass("basic-colors-table");
                tab.append("<tr>");
                var count = 1;
                var k = a("<ul>").addClass("basic-colors-list");
                var k2 = a("<ul>").addClass("basic-colors-list");
                a.each(l.basicColors, function (b, c) {
                    var d = a("<li>").addClass("color-item"), f = a("<a>").addClass(b + " color-link"), g = a("<span>").addClass("color-preview " + b), h = a("<span>").addClass("color-label").text(b);
                    if (f.append(g, h), g.append(), "#" !== c[0] && (c = "#" + c), g.css("background-color", c), l.showSpectrum) {
                        var i = a("<span>").addClass("color-box spectrum-" + b);
                        e && a.each([0, 1], function (d) {
                            "fff" !== c && "000" !== b && i.append(a("<span>").addClass(b + "-spectrum-" + d + " ie-spectrum"))
                        });
                        var j = a("<span>").addClass("highlight-band");
                        a.each([0, 1, 2], function () {
                            j.append(a("<span>").addClass("highlight-band-stripe"))
                        }), f.append(i.append(j))
                    }
                    if(count % 2 === 0)
                    {
                        k2.append(d.append(f));
                    }
                    else
                    {
                        k.append(d.append(f));a
                    }
                    count++;
                });
                tab.append(a("<td>").append(k).append(a("</td>")));
                tab.append(a("<td>").append(k2).append(a("</td>")));
                tab.append(a("</tr></table>"));
                g.append(tab);
            }
            if (l.showSavedColors) {
                var n = l.showBasicColors ? "inactive-content" : "active-content", o = a("<div>").addClass("savedColors-content").addClass(n);
                o.append(a("<p>").addClass("saved-colors-instructions").text("Type in a color or use the spectrums to lighten or darken an existing color.")), g.append(o)
            }
            if (l.showAdvanced) {
                var p = l.showBasicColors || l.showSavedColors ? "inactive-content" : "active-content", q = a("<div>").addClass("advanced-content").addClass(p).append(a("<h6>").addClass("advanced-instructions").text("Tap spectrum or drag band to change color")), r = a("<ul>").addClass("advanced-list"), s = a("<li>").addClass("hue-item"), t = a("<span>").addClass("hue-text").text("Hue: ").append(a("<span>").addClass("hue-value").text("0")), u = a("<span>").addClass("color-box spectrum-hue");
                e && a.each([0, 1, 2, 3, 4, 5, 6], function (b) {
                    u.append(a("<span>").addClass("hue-spectrum-" + b + " ie-spectrum hue"))
                });
                var v = a("<span>").addClass("highlight-band");
                a.each([0, 1, 2], function () {
                    v.append(a("<span>").addClass("highlight-band-stripe"))
                }), r.append(s.append(t).append(u.append(v)));
                var w = a("<li>").addClass("lightness-item"), x = a("<span>").addClass("color-box spectrum-lightness"), y = a("<span>").addClass("lightness-text").text("Lightness: ").append(a("<span>").addClass("lightness-value").text("50%"));
                e && a.each([0, 1], function (b) {
                    x.append(a("<span>").addClass("lightness-spectrum-" + b + " ie-spectrum"))
                });
                var z = a("<span>").addClass("highlight-band");
                a.each([0, 1, 2], function () {
                    z.append(a("<span>").addClass("highlight-band-stripe"))
                }), r.append(w.append(y).append(x.append(z)));
                var A = a("<li>").addClass("saturation-item"), B = a("<span>").addClass("color-box spectrum-saturation");
                e && a.each([0, 1], function (b) {
                    B.append(a("<span>").addClass("saturation-spectrum-" + b + " ie-spectrum"))
                });
                var C = a("<span>").addClass("highlight-band");
                a.each([0, 1, 2], function () {
                    C.append(a("<span>").addClass("highlight-band-stripe"))
                });
                var D = a("<span>").addClass("saturation-text").text("Saturation: ").append(a("<span>").addClass("saturation-value").text("100%"));
                r.append(A.append(D).append(B.append(C)));
                var E = a("<li>").addClass("preview-item").append(a("<span>").addClass("preview-text").text("Preview")), F = a("<span>").addClass("color-preview advanced").append("<button class='color-select btn btn-mini advanced' type='button'>Select</button>");
                r.append(E.append(F)), g.append(q.append(r))
            }
            return b.append(g), b
        }, o = {}, p = {rowsInDropdown: 8, maxColsInDropdown: 2};
        if (l.showSavedColors) {
            var q = [];
            if (d && localStorage.allSavedColors)q = JSON.parse(localStorage.allSavedColors); else if (document.cookie.match("pickAColorSavedColors-allSavedColors=")) {
                var r = document.cookie.split(";");
                a.each(r, function (a) {
                    r[a].match("pickAColorSavedColors-allSavedColors=") && (q = r[a].split("=")[1].split(","))
                })
            }
        }
        var s = {initialize: function (b) {
            var c, d, e = a(this);
            e.attr("name") || e.attr("name", "pick-a-color-" + b), d = e.attr("name"), e.addClass("pick-a-color"), l.allowBlank ? e.val().match(/^\s+$|^$/) || (o.defaultColor = tinycolor(e.val()).toHex(), o.typedColor = o.defaultColor, e.val(o.defaultColor)) : (o.defaultColor = tinycolor(e.val()).toHex(), o.typedColor = o.defaultColor, e.val(o.defaultColor)), a(e).wrap('<div class="input-prepend input-append pick-a-color-markup" id="' + d + '">'), c = a(e.parent()), l.showHexInput ? c.prepend('<span class="hex-pound add-on">#</span>').append(n()) : c.append(n()), l.showHexInput || e.attr("type", "hidden")
        }, updatePreview: function (a) {
            l.allowBlank ? (o.typedColor = a.val().match(/^\s+$|^$/) ? "" : tinycolor(a.val()).toHex(), "" === o.typedColor ? a.siblings(".btn-group").find(".current-color").css("background", "none") : a.siblings(".btn-group").find(".current-color").css("background-color", "#" + o.typedColor)) : (o.typedColor = tinycolor(a.val()).toHex(), a.siblings(".btn-group").find(".current-color").css("background-color", "#" + o.typedColor))
        }, pressPreviewButton: function () {
            var a = arguments[0].thisEvent;
            a.stopPropagation(), s.toggleDropdown(a.target)
        }, openDropdown: function (b, d) {
            a(".color-menu").each(function () {
                var b = a(this);
                if ("block" === b.css("display")) {
                    var c = b.parents(".btn-group");
                    s.closeDropdown(c, b)
                }
            }), l.fadeMenuToggle && !c ? a(d).fadeIn("fast") : a(d).show(), a(b).addClass("open")
        }, closeDropdown: function (b, d) {
            l.fadeMenuToggle && !c ? a(d).fadeOut("fast") : a(d).css("display", "none"), a(b).removeClass("open")
        }, closeDropdownIfOpen: function () {
            var a = arguments[0].button, b = arguments[0].menu;
            "block" === b.css("display") && s.closeDropdown(a, b)
        }, toggleDropdown: function (b) {
            var c = a(b).parents(".pick-a-color-markup"), d = c.find(".btn-group"), e = c.find(".color-menu");
            "none" === e.css("display") ? s.openDropdown(d, e) : s.closeDropdown(d, e)
        }, tabbable: function () {
            var b = a(this), c = b.parents(".pick-a-color-markup");
            b.click(function () {
                var b = a(this), d = b.attr("class").split(" ")[0].split("-")[0] + "-content", e = b.parents(".dropdown-menu").find("." + d);
                b.hasClass("tab-active") || (c.find(".tab-active").removeClass("tab-active"), c.find(".active-content").removeClass("active-content").addClass("inactive-content"), b.addClass("tab-active"), a(e).addClass("active-content").removeClass("inactive-content"))
            })
        }, getColorMultiplier: function (b, d, e) {
            var f = "basic" === e ? parseInt(a(".color-box").first().width(), 10) : parseInt(a(".advanced-list").find(".color-box").first().width(), 10);
            0 === f && (f = "basic" === e ? c ? 160 : 200 : c ? 160 : 300);
            var g = f / 2, h = d / f;
            return"bidirectional" === b ? .5 >= h ? (1 - d / g) / 2 : -((d - g) / g) / 2 : "darkenRight" === b ? -(h / 2) : h / 2
        }, modifyHSLLightness: function (a, b) {
            var c = a;
            return c.l += b, c.l = Math.min(Math.max(0, c.l), 1), tinycolor(c).toHslString()
        }, getMoveableArea: function (a) {
            var b = {}, c = a.parent(), d = a.outerWidth(), e = c.width(), f = c.offset();
            return b.minX = f.left, b.maxX = e - d, b
        }, moveHighlightBand: function (b, d, e) {
            var f = a(".highlight-band").first().outerWidth(), g = .75 * f, h = c ? e.originalEvent.pageX : e.pageX, i = h - d.minX - g;
            i = Math.max(0, Math.min(i, d.maxX)), b.css("position", "absolute"), b.css("left", i)
        }, horizontallyDraggable: function () {
            a(this).on(f, function (b) {
                b.preventDefault();
                var c = a(b.delegateTarget);
                c.css("cursor", "-webkit-grabbing"), c.css("cursor", "-moz-grabbing");
                var d = s.getMoveableArea(c);
                a(document).on(g, function (a) {
                    c.trigger(j), s.moveHighlightBand(c, d, a)
                }).on(h, function () {
                    a(document).off(g), a(document).off(j), c.css("cursor", "-webkit-grab"), c.css("cursor", "-moz-grab"), c.trigger(k), a(document).off(h)
                })
            }).on(h, function (b) {
                b.stopPropagation(), a(document).off(g), a(document).off(j)
            })
        }, modifyHighlightBand: function (a, b, c) {
            var d = {h: 0, s: 0, l: .05}, e = {h: 0, s: 0, l: .5}, f = -b, g = a.find(".highlight-band-stripe"), h = "lightenRight" === c ? s.modifyHSLLightness(e, f) : s.modifyHSLLightness(d, f);
            a.css("border-color", h), g.css("background-color", h)
        }, calculateHighlightedColor: function () {
            var b, c, d, e, f, g, h, i, j = a(this), k = j.parent(), m = a(".highlight-band").first().outerWidth(), n = m / 2, o = arguments[0].type;
            if ("basic" === o) {
                var p = k.attr("class").split("-")[2], q = l.basicColors[p];
                switch (c = tinycolor(q).toHsl(), q) {
                    case"fff":
                        b = "darkenRight";
                        break;
                    case"000":
                        b = "lightenRight";
                        break;
                    default:
                        b = "bidirectional"
                }
            } else {
                var r = j.parents(".advanced-list");
                e = arguments[0].hsl.s, h = r.find(".spectrum-hue"), d = arguments[0].hsl.h, g = r.find(".spectrum-saturation"), i = r.find(".lightness-value"), f = r.find(".color-preview"), c = {h: arguments[0].hsl.h, l: .5, s: arguments[0].hsl.s}, b = "bidirectional"
            }
            var t = parseInt(j.css("left"), 10) + n, u = s.getColorMultiplier(b, t, o), v = s.modifyHSLLightness(c, u), w = "#" + tinycolor(v).toHex(), x = v.split("(")[1].split(")")[0].split(",")[2], y = parseInt(x.split("%")[0], 10) / 100;
            return"basic" === o ? (k.siblings(".color-preview").css("background-color", w), k.prev(".color-label").replaceWith('<button class="color-select btn btn-mini" type="button">Select</button>'), "darkenRight" !== b && s.modifyHighlightBand(j, u, b)) : (f.css("background-color", w), i.text(x), s.updateSaturationStyles(g, d, y), s.updateHueStyles(h, e, y), s.modifyHighlightBand(a(".advanced-content .highlight-band"), u, b)), "basic" === o ? tinycolor(v).toHex() : y
        }, updateSavedColorPreview: function (b) {
            a.each(b, function (c) {
                var d = a(b[c]), e = d.attr("class");
                d.find(".color-preview").css("background-color", e)
            })
        }, updateSavedColorMarkup: function (b, c) {
            if (c = c ? c : q, l.showSavedColors && c.length > 0) {
                l.saveColorsPerElement || (b = a(".savedColors-content"), c = q);
                var d = p.rowsInDropdown * p.maxColsInDropdown;
                c = c.slice(0, d);
                var e = a("<ul>").addClass("saved-color-col 0"), f = a("<ul>").addClass("saved-color-col 1");
                a.each(c, function (b, c) {
                    var d = a("<li>").addClass("color-item"), g = a("<a>").addClass(c);
                    g.append(a("<span>").addClass("color-preview")), g.append(a("<span>").addClass("color-label").text(c)), d.append(g), 0 === b % 2 ? e.append(d) : f.append(d)
                }), b.html(e), b.append(f);
                var g = a(b).find("a");
                s.updateSavedColorPreview(g)
            }
        }, setSavedColorsCookie: function (a, b) {
            var c = new Date, d = 31536e7, e = new Date(c.getTime() + d);
            e = e.toGMTString(), document.cookie = "undefined" == typeof b ? "pickAColorSavedColors-allSavedColors=" + a + ";expires=" + e : "pickAColorSavedColors-" + b + "=" + a + "; expires=" + e
        }, saveColorsToLocalStorage: function (a, b) {
            if (d)if ("undefined" == typeof b)try {
                localStorage.allSavedColors = JSON.stringify(a)
            } catch (c) {
                localStorage.clear()
            } else try {
                localStorage["pickAColorSavedColors-" + b] = JSON.stringify(a)
            } catch (c) {
                localStorage.clear()
            } else s.setSavedColorsCookie(a, b)
        }, removeFromArray: function (b, c) {
            -1 !== a.inArray(c, b) && b.splice(a.inArray(c, b), 1)
        }, updateSavedColors: function (a, b, c) {
            s.removeFromArray(b, a), b.unshift(a), s.saveColorsToLocalStorage(b, c)
        }, addToSavedColors: function (a, b, c) {
            if (l.showSavedColors && void 0 !== a)if ("#" != a[0] && (a = "#" + a), s.updateSavedColors(a, q), l.saveColorsPerElement) {
                var d = b.colors, e = b.dataAttr;
                s.updateSavedColors(a, d, e), s.updateSavedColorMarkup(c, d)
            } else s.updateSavedColorMarkup(c, q)
        }, selectFromBasicColors: function () {
            var b = a(this).find("span:first").css("background-color"), c = arguments[0].els, d = arguments[0].savedColorsInfo;
            b = tinycolor(b).toHex(), a(c.thisEl).val(b), a(c.thisEl).trigger("change"), s.updatePreview(c.thisEl), s.addToSavedColors(b, d, c.savedColorsContent), s.closeDropdown(c.colorPreviewButton, c.colorMenu)
        }, tapSpectrum: function () {
            var b = arguments[0].thisEvent, d = arguments[0].savedColorsInfo, e = arguments[0].els, f = arguments[0].mostRecentClick;
            b.stopPropagation();
            var g = a(this).find(".highlight-band"), h = s.getMoveableArea(g);
            c ? s.moveHighlightBand(g, h, f) : s.moveHighlightBand(g, h, b);
            var i = s.calculateHighlightedColor.apply(g, [
                {type: "basic"}
            ]);
            s.addToSavedColors(i, d, e.savedColorsContent), e.touchInstructions.html("Press 'select' to choose this color")
        }, executeUnlessScrolled: function () {
            var b, d, e = arguments[0].thisFunction, g = arguments[0].theseArguments;
            a(this).on(f, function (c) {
                b = a(window).scrollTop(), d = c
            }).on(i, function (f) {
                var h = b - a(window).scrollTop();
                return c && Math.abs(h) > 0 ? !1 : (g.thisEvent = f, g.mostRecentClick = d, e.apply(a(this), [g]), void 0)
            })
        }, updateSaturationStyles: function (b, c, d) {
            var f = (100 * d).toString() + "%", g = "#" + tinycolor("hsl(" + c + ",0%," + f).toHex(), h = "#" + tinycolor("hsl(" + c + ",50%," + f).toHex(), i = "#" + tinycolor("hsl(" + c + ",100%," + f).toHex(), j = "", k = (a.each(["-webkit-linear-gradient", "-o-linear-gradient"], function (a, b) {
                j += "background-image: " + b + "(left, " + g + " 0%, " + h + " 50%, " + i + " 100%);"
            }), "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + g + "', endColorstr='" + h + "', GradientType=1)"), l = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + h + "', endColorstr='" + i + "', GradientType=1)";
            if (j = "background-image: -moz-linear-gradient(left center, " + g + " 0%, " + h + " 50%, " + i + " 100%);" + "background-image: linear-gradient(to right, " + g + " 0%, " + h + " 50%, " + i + " 100%); " + "background-image: -webkit-gradient(linear, left top, right top," + "color-stop(0, " + g + ")," + "color-stop(0.5, " + h + ")," + "color-stop(1, " + i + "));" + j, e) {
                var m = a(b).find(".saturation-spectrum-0"), n = a(b).find(".saturation-spectrum-1");
                m.css("filter", k), n.css("filter", l)
            } else b.attr("style", j)
        }, updateLightnessStyles: function (b, c, d) {
            var f = (100 * d).toString() + "%", g = "#" + tinycolor("hsl(" + c + "," + f + ",100%)").toHex(), h = "#" + tinycolor("hsl(" + c + "," + f + ",50%)").toHex(), i = "#" + tinycolor("hsl(" + c + "," + f + ",0%)").toHex(), j = "", k = (a.each(["-webkit-linear-gradient", "-o-linear-gradient"], function (a, b) {
                j += "background-image: " + b + "(left, " + g + " 0%, " + h + " 50%, " + i + " 100%);"
            }), "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + g + "', endColorstr='" + h + "', GradientType=1)"), l = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + h + "', endColorstr='" + i + "', GradientType=1)";
            if (j = "background-image: -moz-linear-gradient(left center, " + g + " 0%, " + h + " 50%, " + i + " 100%); " + "background-image: linear-gradient(to right, " + g + " 0%, " + h + " 50%, " + i + " 100%); " + "background-image: -webkit-gradient(linear, left top, right top," + " color-stop(0, " + g + ")," + " color-stop(0.5, " + h + ")," + " color-stop(1, " + i + ")); " + j, e) {
                var m = a(b).find(".lightness-spectrum-0"), n = a(b).find(".lightness-spectrum-1");
                m.css("filter", k), n.css("filter", l)
            } else b.attr("style", j)
        }, updateHueStyles: function (b, c, d) {
            var f = (100 * c).toString() + "%", g = (100 * d).toString() + "%", h = "#" + tinycolor("hsl(0," + f + "," + g + ")").toHex(), i = "#" + tinycolor("hsl(60," + f + "," + g + ")").toHex(), j = "#" + tinycolor("hsl(120," + f + "," + g + ")").toHex(), k = "#" + tinycolor("hsl(180," + f + "," + g + ")").toHex(), l = "#" + tinycolor("hsl(240," + f + "," + g + ")").toHex(), m = "#" + tinycolor("hsl(300," + f + "," + g + ")").toHex(), n = "#" + tinycolor("hsl(0," + f + "," + g + ")").toHex(), o = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + h + "', endColorstr='" + i + "', GradientType=1)", p = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + i + "', endColorstr='" + j + "', GradientType=1)", q = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + j + "', endColorstr='" + k + "', GradientType=1)", r = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + k + "', endColorstr='" + l + "', GradientType=1)", s = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + l + "', endColorstr='" + m + "', GradientType=1)", t = "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + m + "', endColorstr='" + n + "', GradientType=1)", u = "";
            if (a.each(["-webkit-linear-gradient", "-o-linear-gradient"], function (a, b) {
                u += "background-image: " + b + "(left, " + h + " 0%, " + i + " 17%, " + j + " 24%, " + k + " 51%, " + l + " 68%, " + m + " 85%, " + n + " 100%);"
            }), u += "background-image: -webkit-gradient(linear, left top, right top,color-stop(0%, " + h + ")," + "color-stop(17%, " + i + ")," + "color-stop(34%, " + j + ")," + "color-stop(51%, " + k + ")," + "color-stop(68%, " + l + ")," + "color-stop(85%, " + m + ")," + "color-stop(100%, " + n + "));" + "background-image: linear-gradient(to right, " + h + " 0%, " + i + " 17%, " + j + " 24%," + k + " 51%," + l + " 68%," + m + " 85%," + n + " 100%); " + "background-image: -moz-linear-gradient(left center, " + h + " 0%, " + i + " 17%, " + j + " 24%, " + k + " 51%, " + l + " 68%, " + m + " 85%, " + n + " 100%);", e) {
                var v = a(b).find(".hue-spectrum-0"), w = a(b).find(".hue-spectrum-1"), x = a(b).find(".hue-spectrum-2"), y = a(b).find(".hue-spectrum-3"), z = a(b).find(".hue-spectrum-4"), A = a(b).find(".hue-spectrum-5");
                v.css("filter", o), w.css("filter", p), x.css("filter", q), y.css("filter", r), z.css("filter", s), A.css("filter", t)
            } else b.attr("style", u)
        }, getHighlightedHue: function () {
            var b = a(this), d = b.outerWidth(), e = d / 2, f = parseInt(b.css("left"), 10) + e, g = b.parents(".advanced-list"), h = g.find(".color-preview"), i = g.find(".spectrum-lightness"), j = g.find(".spectrum-saturation"), k = parseInt(g.find(".color-box").first().width(), 10), l = g.find(".hue-value"), m = arguments[0].l, n = arguments[0].s, o = (100 * n).toString() + "%", p = (100 * m).toString() + "%";
            0 === k && (k = c ? 160 : 300);
            var q = Math.floor(360 * (f / k)), r = "hsl(" + q + "," + o + "," + p + ")";
            return r = "#" + tinycolor(r).toHex(), h.css("background-color", r), l.text(q), s.updateLightnessStyles(i, q, n), s.updateSaturationStyles(j, q, m), q
        }, getHighlightedSaturation: function () {
            var b = a(this), d = b.outerWidth(), e = d / 2, f = parseInt(b.css("left"), 10) + e, g = b.parents(".advanced-list"), h = g.find(".color-preview"), i = g.find(".spectrum-lightness"), j = g.find(".spectrum-hue"), k = g.find(".saturation-value"), l = parseInt(g.find(".color-box").first().width(), 10), m = arguments[0].l, n = (100 * m).toString() + "%", o = arguments[0].h;
            0 === l && (l = c ? 160 : 300);
            var p = f / l, q = Math.round(100 * p).toString() + "%", r = "hsl(" + o + "," + q + "," + n + ")";
            return r = "#" + tinycolor(r).toHex(), h.css("background-color", r), k.text(q), s.updateLightnessStyles(i, o, p), s.updateHueStyles(j, p, m), p
        }, updateAdvancedInstructions: function (a) {
            a.html("Press the color preview to choose this color")
        }};
        return this.each(function (b) {
            s.initialize.apply(this, [b]);
            var c, e, f = {thisEl: a(this), thisWrapper: a(this).parent(), colorTextInput: a(this).find("input"), colorMenuLinks: a(this).parent().find(".color-menu li a"), colorPreviewButton: a(this).parent().find(".btn-group"), colorMenu: a(this).parent().find(".color-menu"), colorSpectrums: a(this).parent().find(".color-box"), basicSpectrums: a(this).parent().find(".basicColors-content .color-box"), touchInstructions: a(this).parent().find(".color-menu-instructions"), advancedInstructions: a(this).parent().find(".advanced-instructions"), highlightBands: a(this).parent().find(".highlight-band"), basicHighlightBands: a(this).parent().find(".basicColors-content .highlight-band")};
            if (m && (f.tabs = f.thisWrapper.find(".tab")), l.showSavedColors && (f.savedColorsContent = f.thisWrapper.find(".savedColors-content"), l.saveColorsPerElement))if (e = {colors: [], dataObj: a(this).data()}, a.each(e.dataObj, function (a) {
                e.dataAttr = a
            }), d && localStorage["pickAColorSavedColors-" + e.dataAttr])e.colors = JSON.parse(localStorage["pickAColorSavedColors-" + e.dataAttr]); else if (document.cookie.match("pickAColorSavedColors-" + e.dataAttr))for (var g = document.cookie.split(";"), n = 0; n < g.length; n++)g[n].match(e.dataAttr) && (e.colors = g[n].split("=")[1].split(",")); else e.colors = q;
            l.showAdvanced && (c = {h: 0, s: 1, l: .5}, f.advancedSpectrums = f.thisWrapper.find(".advanced-list").find(".color-box"), f.advancedHighlightBands = f.thisWrapper.find(".advanced-list").find(".highlight-band"), f.hueSpectrum = f.thisWrapper.find(".spectrum-hue"), f.lightnessSpectrum = f.thisWrapper.find(".spectrum-lightness"), f.saturationSpectrum = f.thisWrapper.find(".spectrum-saturation"), f.hueHighlightBand = f.thisWrapper.find(".spectrum-hue .highlight-band"), f.lightnessHighlightBand = f.thisWrapper.find(".spectrum-lightness .highlight-band"), f.saturationHighlightBand = f.thisWrapper.find(".spectrum-saturation .highlight-band"), f.advancedPreview = f.thisWrapper.find(".advanced-content .color-preview")), s.addToSavedColors(o.defaultColor, e, f.savedColorsContent), s.updatePreview(f.thisEl), f.thisEl.focus(function () {
                var b = a(this);
                o.typedColor = b.val(), l.allowBlank || b.val(""), s.toggleDropdown(f.colorPreviewButton, f.ColorMenu)
            }).blur(function () {
                var b = a(this);
                o.newValue = b.val(), o.newValue.match(/^\s+$|^$/) ? l.allowBlank || b.val(o.typedColor) : (o.newValue = tinycolor(o.newValue).toHex(), b.val(o.newValue), s.addToSavedColors(o.newValue, e, f.savedColorsContent)), s.updatePreview(b)
            }), s.executeUnlessScrolled.apply(f.colorPreviewButton, [
                {thisFunction: s.pressPreviewButton, theseArguments: {}}
            ]), s.executeUnlessScrolled.apply(a(document), [
                {thisFunction: s.closeDropdownIfOpen, theseArguments: {button: f.colorPreviewButton, menu: f.colorMenu}}
            ]), f.colorMenu.on(i, function (a) {
                a.stopPropagation()
            }), f.thisEl.on(i, function (a) {
                a.stopPropagation()
            }), s.executeUnlessScrolled.apply(f.colorMenuLinks, [
                {thisFunction: s.selectFromBasicColors, theseArguments: {els: f, savedColorsInfo: e}}
            ]), m && s.tabbable.apply(f.tabs), (l.showSpectrum || l.showAdvanced) && s.horizontallyDraggable.apply(f.highlightBands), l.showSpectrum && (s.executeUnlessScrolled.apply(f.basicSpectrums, [
                {thisFunction: s.tapSpectrum, theseArguments: {savedColorsInfo: e, els: f}}
            ]), a(f.basicHighlightBands).on(j, function (a) {
                a.target, s.calculateHighlightedColor.apply(this, [
                    {type: "basic"}
                ])
            }).on(k, function (a) {
                var b = a.delegateTarget, c = s.calculateHighlightedColor.apply(b, [
                    {type: "basic"}
                ]);
                s.addToSavedColors(c, e, f.savedColorsContent)
            })), l.showAdvanced && (a(f.hueHighlightBand).on(j, function () {
                c.h = s.getHighlightedHue.apply(this, [c])
            }), a(f.lightnessHighlightBand).on(j, function () {
                s.calculateHighlightedColor.apply(this, [
                    {type: "advanced", hsl: c}
                ])
            }).on(h, function () {
                c.l = s.calculateHighlightedColor.apply(this, [
                    {type: "advanced", hsl: c}
                ])
            }), a(f.saturationHighlightBand).on(j, function () {
                s.getHighlightedSaturation.apply(this, [c])
            }).on(k, function () {
                c.s = s.getHighlightedSaturation.apply(this, [c])
            }), a(f.advancedHighlightBand).on(k, function () {
                s.updateAdvancedInstructions(f.advancedInstructions)
            }), a(f.lightnessSpectrum).click(function (b) {
                b.stopPropagation();
                var d = a(this).find(".highlight-band"), e = s.getMoveableArea(d);
                s.moveHighlightBand(d, e, b), c.l = s.calculateHighlightedColor.apply(d, [
                    {type: "advanced", hsl: c}
                ])
            }), a(f.hueSpectrum).click(function (b) {
                b.stopPropagation();
                var d = a(this).find(".highlight-band"), e = s.getMoveableArea(d);
                s.moveHighlightBand(d, e, b), c.h = s.getHighlightedHue.apply(d, [c])
            }), a(f.saturationSpectrum).click(function (b) {
                b.stopPropagation();
                var d = a(this).find(".highlight-band"), e = s.getMoveableArea(d);
                s.moveHighlightBand(d, e, b), c.s = s.getHighlightedSaturation.apply(d, [c])
            }), a(f.advancedSpectrums).click(function () {
                s.updateAdvancedInstructions(f.advancedInstructions)
            }), a(f.advancedPreview).click(function () {
                var b = tinycolor(a(this).css("background-color")).toHex();
                a(f.thisEl).val(b), a(f.thisEl).trigger("change"), s.updatePreview(f.thisEl), s.addToSavedColors(b, e, f.savedColorsContent), s.closeDropdown(f.colorPreviewButton, f.colorMenu)
            })), l.showSavedColors && (a(f.savedColorsContent).click(function (b) {
                var c = a(b.target);
                if (c.is("SPAN") || c.is("A")) {
                    var d = c.is("SPAN") ? c.parent().attr("class").split("#")[1] : c.attr("class").split("#")[1];
                    a(f.thisEl).val(d), a(f.thisEl).trigger("change"), s.updatePreview(f.thisEl), s.closeDropdown(f.colorPreviewButton, f.colorMenu), s.addToSavedColors(d, e, f.savedColorsContent)
                }
            }), l.saveColorsPerElement ? l.saveColorsPerElement && s.updateSavedColorMarkup(f.savedColorsContent, e.colors) : s.updateSavedColorMarkup(f.savedColorsContent, q))
        })
    }
}(jQuery);