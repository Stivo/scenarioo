/*scenarioo-client
 Copyright (C) 2015, scenarioo.org Development Team

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* global SVG:false */
/* global svgPanZoom:false */
/* eslint no-console:0*/

angular.module('scenarioo.services').service('DrawingPadService', function ($rootScope, $routeParams, $http, ContextService) {

    var drawingPadNodeId = 'drawingPad',
        viewPortGroupId = 'viewPortGroup',
        backgroundImageId = 'sketcher-original-screenshot',
        drawingPad,
        selectedShape,
        isSetup = false,
        panZoom,
        zoomFactor = 1,
        DRAWINGPAD_CLICKED_EVENT = 'drawingPadClicked';


    function setup() {

        if (drawingPad && !isSetup) {
            // tiled background
            var bg = drawingPad.rect().attr({
                width: drawingPad.width(),
                height: drawingPad.height(),
                x: drawingPad.x(),
                y: drawingPad.y(),
                fill: drawingPad.pattern(10, 10, function (add) {
                    add.rect(10, 10).fill('#ddd');
                    add.rect(5, 5).fill('#fff');
                    add.rect(5, 5).move(5, 5).fill('#fff');
                })
            });

            /*
             * to get the select border working in a zoomed svg
             * we need an additional svg element because the
             * select border attaches to the parent svg element
             */
            drawingPad.viewPortGroup = drawingPad.nested().attr({
                id: viewPortGroupId
            });

            /*
             * in order to get svgPanZoom to work we need a group
             * with all the elements that should be zoomed and panned
             */
            drawingPad.group = drawingPad.group().attr({
                class: 'svg-pan-zoom_viewport'
            });

            drawingPad.group.add(drawingPad.viewPortGroup);

            drawingPad.viewPortGroup.image('')
                .attr({
                    id: backgroundImageId,
                    draggable: false,
                    width: '100%',
                    height: '100%'
                })
                .ondragstart = function () {
                return false;
            };

            drawingPad.viewPortGroup.getOffset = function (event) {
                var offset = $(drawingPad.viewPortGroup.node).offset();
                var point = {x: 0, y: 0};

                point.x = Math.max(event.pageX - offset.left, 0);
                point.y = Math.max(event.pageY - offset.top, 0);

                return point;
            };

            loadBackgroundImage();

            drawingPad.on('mouseup', function (event) {
                if (event.target.id === drawingPadNodeId || event.target.id === viewPortGroupId || event.target.id === backgroundImageId || event.target.id === bg.id()) {
                    $rootScope.$broadcast(DRAWINGPAD_CLICKED_EVENT);
                }
            });

            initZoomPan();

            isSetup = true;
        }
    }

    function initZoomPan() {

        panZoom = svgPanZoom('#' + drawingPad.id(), {
            controlIconsEnabled: true
        });
        panZoom.disableDblClickZoom();
        panZoom.setOnZoom(function () {
            zoomFactor = this.getZoom();
        });
        resetZoomPan();
    }

    function resetZoomPan() {
        panZoom.updateBBox();
        panZoom.resize();
        panZoom.fit();
        panZoom.center();
        panZoom.pan({x: panZoom.getPan().x, y: 0});
        panZoom.enableControlIcons();
    }

    function loadBackgroundImage() {
        var bgImg = SVG.get(backgroundImageId);

        if (bgImg && $routeParams.screenshotURL && ContextService.sketchStepIndex == null) {

                convertImgToBase64URL(decodeURIComponent($routeParams.screenshotURL), function (base64Img) {
                    bgImg.load(base64Img).loaded(function (loader) {
                        bgImg.attr({
                            width: loader.width,
                            height: loader.height
                        });

                        resetZoomPan();
                    });
                });

        }
        else if (bgImg && $routeParams.screenshotURL && ContextService.sketchStepIndex !== null) {
            $http.get(decodeURIComponent($routeParams.screenshotURL), {headers: {accept: 'image/svg+xml'}}).
                success(function (data) {
                    // This should strip out the redundant parts: <svg> tags, <defs>, the viewport group...
                    // However, it breaks import of one of the elements, and doesn't fix anything.
                    // Preserved in case truncation will be important.
                    //var truncated = data.substring(data.search('<image '), data.search('</g>'));
                    //drawingPad.svg(truncated);
                    var dp = bgImg.doc(SVG.Doc);
                    var tempContainer = dp.nested();
                    tempContainer.svg(data);
                    var tempSVG = tempContainer.first();
                    tempSVG.each(function() {
                        drawingPad.viewPortGroup.add(this);
                    });
                    tempContainer.remove();
                    bgImg.remove();

                    resetZoomPan();
                }).
                error(function (data, status, headers) {
                    console.log(data);
                    console.log(status);
                    console.log(headers);
                });
        }
    }

    function convertImgToBase64URL(url, callback, outputFormat) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function () {
            var canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'), dataURL;
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            dataURL = canvas.toDataURL(outputFormat);
            callback(dataURL);
            canvas = null; //TODO: Does this destroy the canvas element? Does it matter if not?
        };
        img.src = url;
    }

    window.onkeydown = onKeyDownHandler;
    function onKeyDownHandler(event) {
        switch (event.keyCode) {
            case 46: // delete
                removeSelectedShape();
                return;
        }
    }

    function removeSelectedShape() {
        if (selectedShape) {
            selectedShape.unSelect();
            selectedShape.remove();
            selectedShape = null;
        }
    }


    return {
        DRAWINGPAD_CLICKED_EVENT: DRAWINGPAD_CLICKED_EVENT,


        setDrawingPad: function (dp) {
            if (dp) {
                drawingPad = dp;
                setup();
            }
        },

        getDrawingPad: function () {
            setup();
            return drawingPad;
        },

        getParentNode: function () {
            return document.getElementById(drawingPadNodeId);
        },

        getParentNodeId: function () {
            return drawingPadNodeId;
        },

        exportDrawing: function () {
            var group = drawingPad.group.clone();
            var svg = group.first();
            svg.attr({
                xmlns: 'http://www.w3.org/2000/svg',
                version: '1.1',
                'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                width: svg.first().width(),
                height: svg.first().height()
            });
            return svg.svg();
        },

        unSelectAllShapes: function () {
            if (drawingPad.viewPortGroup) {
                drawingPad.viewPortGroup.each(function () {
                    if (this.hasClass('shape')) {
                        if (this instanceof SVG.Nested) {
                            this.view();
                        }
                        this.unSelect();
                    }
                });
                selectedShape = null;
            }
        },

        setSelectedShape: function (shape) {
            selectedShape = shape;
        },

        getSelectedShape: function () {
            return selectedShape;
        },

        sendSelectedShapeToBack: function () {
            if (selectedShape) {
                selectedShape.back();
                selectedShape.forward();
            }
        },

        sendSelectedShapeToFront: function () {
            if (selectedShape) {
                selectedShape.front();
                selectedShape.backward();
            }
        },

        sendSelectedShapeBackward: function () {
            /*
             * the first element is the background image. so backward can only be called if the
             * selected shape is at least at 3rd position in the stack
             */
            if (selectedShape && drawingPad.viewPortGroup.get(1) !== selectedShape) {
                selectedShape.backward();
            }
        },

        sendSelectedShapeForward: function () {
            var indexLast = drawingPad.viewPortGroup.index(drawingPad.viewPortGroup.last());

            /*
             * the last element is the select border. so forward can only be called if the
             * selected shape is at least at 3rd last position in the stack
             */

            if (selectedShape && drawingPad.viewPortGroup.get(indexLast - 1) !== selectedShape) {
                selectedShape.forward();
            }
        },

        getZoomFactor: function () {
            return zoomFactor;
        },

        enableZoomPan: function () {
            panZoom.enablePan();
            panZoom.enableZoom();
        },

        disableZoomPan: function () {
            panZoom.disablePan();
            panZoom.disableZoom();
        },

        updateZoomPan: function () {
            //panZoom.updateBBox();
            var z = panZoom.getZoom();
            var p = panZoom.getPan();

            p.x = p.x - 0.000001;
            p.y = p.y - 0.000001;

            panZoom.zoom(z - 0.000001);
            panZoom.pan(p);
        },

        getPanPosition: function () {
            return panZoom.getPan();
        },

        destroy: function () {
            drawingPad.clear();
            drawingPad = null;
            isSetup = false;
            console.log(drawingPad);
        }

    };
});
