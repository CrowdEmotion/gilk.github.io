// d3.legend.js
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence
//Modified by Gil Kogan (gil@crowdemotion.co.uk)


var ceGraphTS_H = 350;
var ceGraphTS_M = 20;

var ceTimeSeries = {engine: 'kanako',gid:0,graphRuler:null, videoId: null, video: null, divId:null,time:0,
    timeId: 'timing', width:0,height:0, left:0, outerLeft: 0, right:0, top:0, outerTop: 0,events: {focus_ready:null},handleBarMove:null, handleMovieTime:null, handleInitBar:null, handleTimeHtml: null,
        init_H: ceGraphTS_H, pixelXSeconds: 0, haveClicked: false, margin:{
        m: [ceGraphTS_H*(20.0/500.0), ceGraphTS_M, ceGraphTS_H*(100.0/500.0), ceGraphTS_M],
        m2:[ceGraphTS_H*(430.0/500.0), ceGraphTS_M, ceGraphTS_H*(5.0/500.0), ceGraphTS_M],
        yLegend:0},xScale: null

};
ceTimeSeries.events.focus_ready = new Event('cegraphts_focus_ready');

ceTimeSeries.isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n!=null && n!=undefined && n!=NaN ;
};

ceTimeSeries.d3Legend =function() {

    d3.legend = function (g) {
        var gid = ceTimeSeries.gid;
        g.each(function () {
            var g = d3.select(this),
                items = {},
                svg = d3.select("#" + ceTimeSeries.divId + ' svg'),
                legendPadding = 0,
                lb = g.selectAll(".legend-box").data([true]),
                li = g.selectAll(".legend-items").data([true])

            lb.enter().append("rect").classed("legend-box", true)
            li.enter().append("g").classed("legend-items", true)

            svg.selectAll("[data-legend]").each(function () {
                var self = d3.select(this);
                items[self.attr("data-legend")] = {
                    pos: self.attr("data-legend-pos") || this.getBBox().y,
                    color: self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
                }
            });

            items = d3.entries(items).sort(function (a, b) {
                return a.value.pos - b.value.pos
            })

            function legendClick(d) {
                if (d3.select("." + d.key + "line.gidline_" + gid).attr("visibility") == "visible") {
                    d3.selectAll("." + d.key + "line.gidline_" + gid).attr("visibility", "hidden");
                    d3.selectAll(".legend" + d.key + ".gidlegend_" + gid).style("fill", "grey");
                }
                else if (d3.select("." + d.key + "line.gidline_" + gid).attr("visibility") == "hidden") {
                    d3.selectAll("." + d.key + "line.gidline_" + gid).attr("visibility", "visible");
                    d3.selectAll(".legend" + d.key + ".gidlegend_" + gid).style("fill", d.value.color);
                }
            }

            function legendMouseover(d) {
                d3.select("." + d.key + "line.gidline_" + gid).style("stroke-width", 5);
                d3.select("." + d.key + "line.gidline_" + gid)[0][0].parentNode.appendChild(d3.select("." + d.key + "line.gidline_" + gid)[0][0]);
            }

            function legendMouseout(d) {
                d3.select("." + d.key + "line.gidline_" + gid).style("stroke-width", 1.5);
            }

            li.selectAll("text")
                .data(items, function (d) {
                    return d.key
                })
                .call(function (d) {
                    d.enter().append("text")
                })
                .call(function (d) {
                    d.exit().remove()
                })
                .attr("x", function (d, i) {
                    return i*7 + 1 + "em"
                })
                .attr("y", 0)
                .attr("class", function (d) {
                    return "legendText legend" + d.key + " gidlegendtext_" + gid
                })
                .attr("id", function (d) {
                    return "legend" + d.key + "text"
                })
                .attr("data-i18n", function (d) {
                    return "emo." + d.key.toLowerCase()
                })
                .text(function (d) {
                    return d.key
                })
                .style("fill", function (d) {
                    return d.value.color
                })
                .on("click", legendClick)
                .on("mouseover", legendMouseover)
                .on("mouseout", legendMouseout)

            li.selectAll("circle")
                .data(items, function (d) {
                    return d.key
                })
                .call(function (d) {
                    d.enter().append("circle")
                })
                .call(function (d) {
                    d.exit().remove()
                })
                .attr("cx", function (d, i) {
                    return i*7 + "em"
                })
                .attr("cy", "-0.5em")
                .attr("r", "0.4em")
                .style("fill", function (d) {
                    return d.value.color
                })
                .attr("class", function (d) {
                    return "legendCircle legend" + d.key + " " + "gidlegend_" + gid
                })
                .on("click", legendClick)
                .on("mouseover", legendMouseover)
                .on("mouseout", legendMouseout)

            var lbbox = li[0][0].getBBox()
            lb.attr("x", (lbbox.x - legendPadding))
                .attr("y", (lbbox.y - legendPadding))
                .attr("height", (lbbox.height + 2 * legendPadding))
                .attr("width", (lbbox.width + 2 * legendPadding))
        });
        return g
    };
};

var d3VRulerDrawByEvt= function(x_pos){
    var xpos = ceTimeSeries.isNumeric(x_pos) ? x_pos : d3.event.pageX;
    x_pos = x_pos -  ceGraphTS_M - ceTimeSeries.outerLeft;
    ceTimeSeries.graphRuler = d3.select('#'+ceTimeSeries.divId).selectAll('div.rule')
        .data([0]);
    ceTimeSeries.graphRuler.enter().insert('div',":first-child")
        .attr('class', 'rule')
        .append('span');;
    ceTimeSeries.graphRuler.style('left', (xpos) + 'px');
    ceTimeSeries.graphRuler.style('height', ceTimeSeries.height + 'px');
    ceTimeSeries.graphRuler.attr('height', ceTimeSeries.height + 'px');
    //ceTimeSeries.graphRuler.style('top', ceTimeSeries.margin.m[0]+ceTimeSeries.margin.yLegend+50 + 'px');
    //ceTimeSeries.graphRuler.attr("transform", "translate(" + ceTimeSeries.margin.m[3] + "," + (ceTimeSeries.margin.m[0]+ceTimeSeries.margin.yLegend+50) + ")")
    //ceTimeSeries.graphRuler.select('span').text(xpos);
};

var isInsideFocus = function(pos,type){
    type? '': type='y';
    pos? '' : pos=d3.event.pageY;

    if(type == 'y' && pos>=ceTimeSeries.outerTop && pos<=ceTimeSeries.outerTop+ceTimeSeries.height){
        console.log('isInsideFocus true');
        return true;
    }
    console.log('isInsideFocus false');
    return false;
};
var d3VRulerInit = function (graphID, videoTag){
    d3VRulerDrawByEvt(ceGraphTS_M+ceTimeSeries.outerLeft);

    d3.select('#'+graphID+'').on('mousemove', function() {
        if(isInsideFocus()) {
            if(!ceTimeSeries.haveClicked) {
                moveBarByVideo('pause');
                videoPlayback('pause');
                d3VRulerDrawByEvt();
                moveTime();
                moveVideo();
            }
        }
        if(!isInsideFocus()){
            ceTimeSeries.haveClicked = false;
        }
    });

    d3.select('#'+graphID).on('click', function() {
        if(isInsideFocus()) {
            ceTimeSeries.haveClicked = true;
            moveVideoByBar();
        };
    });

};

var getPos = function(xpos){
    return (xpos-ceGraphTS_M-ceTimeSeries.outerLeft) / ceTimeSeries.pixelXSeconds;
};
var moveTime = function(){
    displayTime(getPos( d3.event.pageX));
};

var moveVideo = function(){
    videoSetTime(getPos( d3.event.pageX));
};
var deleteInterval =  function(interval){
    if(interval) clearInterval(interval);
}

var moveVideoByBar = function(x_pos){

    var xpos = ceTimeSeries.isNumeric(x_pos) ? x_pos : d3.event.pageX;
    //var left = ceTimeSeries.graphRuler.style('left');
    videoSetTime(getPos(xpos));
    moveBarByVideo('play');
    videoPlayback('play');
    deleteInterval(ceTimeSeries.handleTimeHtml);
    deleteInterval(ceTimeSeries.handleMovieTime);
};

var moveBarByVideo = function (action){
    action? '': action='play';
    ceTimeSeries.handleInitBar = null;
    if(action == 'pause' ||  action == 'stop' ){
        stopBar();
    }else if(action == 'play') {
        initBar();
    }else if(action == 'reset') {
        stopBar();
        resetBar();
    }
};
var resetBar = function(){
    if(ceTimeSeries.handleInitBar) clearInterval(ceTimeSeries.handleInitBar);
    ceTimeSeries.graphRuler.style('left',(ceGraphTS_M+ceTimeSeries.outerLeft)+'px');
    displayTime(0);
};


var moveBar = function(){
    if(ceTimeSeries.handleInitBar) clearInterval(ceTimeSeries.handleInitBar);
    ceTimeSeries.handleBarMove = setInterval(function(){
        if(ceTimeSeries.video.currentTime>0) {
            ceTimeSeries.graphRuler.style('left', (ceTimeSeries.video.currentTime * ceTimeSeries.pixelXSeconds) + (ceGraphTS_M+ceTimeSeries.outerLeft) + 'px');
            displayTime();
        };
    },250);
};

var stopBar = function(){
    if(ceTimeSeries.handleBarMove) clearInterval(ceTimeSeries.handleBarMove);
    if(ceTimeSeries.handleInitBar) clearInterval(ceTimeSeries.handleInitBar);
};

var initBar = function(){
    ceTimeSeries.handleInitBar = setInterval(function(){
        if(ceTimeSeries.width){
            moveBar();
        }
    },150);
};

var videoPlayback = function(action){
    if(!action || action == 'play'){
        ceTimeSeries.video.play();
    }
    if(action == 'pause'){
        if(!ceTimeSeries.video.paused) ceTimeSeries.video.pause();
    }
    if(action == 'reset'){
        if(!ceTimeSeries.video.paused) ceTimeSeries.video.pause();
        ceTimeSeries.video.currentTime = 0;
    }
};

var displayTime = function(time){
    var t = time? time : videoGetTime();

    document.getElementById(ceTimeSeries.timeId).innerHTML = t.toFixed(2)+'s';
};

var videoSetTime = function(time){
    time ? '' : time = 0;
    ceTimeSeries.video.currentTime = (time);
};
var videoGetTime = function(){
    return ceTimeSeries.video.currentTime ? (ceTimeSeries.video.currentTime) : 0;
};

var videoInit = function(videoId){
    ceTimeSeries.videoId = videoId;
    ceTimeSeries.video = document.getElementById(videoId);
}
var getMetricName = function(name,type){
    if(type=='kanako') {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }else{
        return (name.charAt(0).toUpperCase()+name.slice(1) ).substring(0, name.length - 6 );
    }
};

var clearNumber = function(n){
    return n;
    /*var n = new String(n);
    n = n.replace(/[^\d.-]/g, '');
    return parseFloat(n,5);
    */
};


function normalise(arr){
    minVal = d3.min(arr)
    range = d3.max(arr) - minVal;

    return arr.map(function (d) {
        if (d==null) {
            return null;
        }
        else {
            return (d-minVal)/range;
        }
    });
}


var saveBoxDimension = function(){
    if(ceTimeSeries.width<=0) {
        /*
        console.log('d3.select("#" + ceTimeSeries.divId + " svg").node().getBoundingClientRect().width');
        console.log(d3.select("#" + ceTimeSeries.divId + " svg").node().getBoundingClientRect().width);
        console.log('d3.select("#" + ceTimeSeries.divId + " svg g.focus").node().getBoundingClientRect().width');
        console.log(d3.select("#" + ceTimeSeries.divId + " svg g.focus").node().getBoundingClientRect().width);
        console.log('$("#" + ceTimeSeries.divId).width()');
        console.log($("#" + ceTimeSeries.divId).width());
        */
        ceTimeSeries.width = d3.select("#" + ceTimeSeries.divId + " svg").node().getBoundingClientRect().width;
        ceTimeSeries.left = ceTimeSeries.width - ceTimeSeries.margin.m[1];
        ceTimeSeries.outerLeft = $("#" + ceTimeSeries.divId).offset().left;
        ceTimeSeries.top =  ceTimeSeries.margin.m[0];
        ceTimeSeries.outerTop = $("#" + ceTimeSeries.divId).offset().top;
        ceTimeSeries.height = d3.select("#" + ceTimeSeries.divId + " svg g.focus").node().getBoundingClientRect().height;
        ceTimeSeries.pixelXSeconds = ceTimeSeries.xScale(1);

    }
};

ceTimeSeries.getCsv = function (csvUrl) {
    var timeList = [];
    //TODO ceTimeSeries.time = dataFull[0].data[dataFull[0].data.length - 1];
    //TODO ceTimeSeries.timeLength = dataFull[0].data.length;

    var timeList = [];
    d3.csv(csvUrl, function(d,i) {
        var n =  d.Timestamp;
        delete d.Timestamp;
        var d = d;
        if(i==0){
            timeList = Object.keys(d);
        }
        return {
            name : n,
            data : Object.keys(d).map(function (key) {return d[key]})
        };
    }, function(data) {
        data.unshift({name:'Timestamp', data:timeList});
        data.pop();
        ceTimeSeries.time = data[0].data[data[0].data.length - 1];
        ceTimeSeries.timeLength = data[0].data.length;
        ceTimeSeries.dataFull = data;
        ceTimeSeries.d3Drawn();
    });

};


ceTimeSeries.showGraph = function(dataFull, graphType, initState, divId, emotionsOnly, videoId, engine) {
    ceTimeSeries.dataFull = dataFull;
    ceTimeSeries.graphType = graphType;
    ceTimeSeries.initState = ceTimeSeries;

    engine ? ceTimeSeries.engine =   engine : ceTimeSeries.engine = 'kanako';
    gid = divId.split('_');
    ceTimeSeries.gid = gid = (gid[1])?  gid[1] : 0;
    ceTimeSeries.divId = divId;
    document.getElementById(ceTimeSeries.divId).addEventListener('cegraphts_focus_ready', saveBoxDimension, false);
    if(videoId) {
        ceTimeSeries.videoId = document.getElementById(videoId);
    }
    ceTimeSeries.d3Legend();
    var positiveMood = [];
    var negativeMood = [];
    var engagement = [];
    if(emotionsOnly==undefined) emotionsOnly= false;
    if(dataFull instanceof Array){
        if (!dataFull || !dataFull[0] || !dataFull[0].data) return false;
        ceTimeSeries.time = dataFull[0].data[dataFull[0].data.length - 1];
        ceTimeSeries.timeLength = dataFull[0].data.length;
        for (var i = 0; i < dataFull[0].data.length; i++) {
            if (dataFull[1].data[i] == null || emotionsOnly == true) {
                positiveMood.push(null);
                negativeMood.push(null);
                engagement.push(null);
            }
            else {
                positiveMood.push(
                    (dataFull[1].data[i] + dataFull[2].data[i]) / 2.0);
                negativeMood.push(
                    (dataFull[3].data[i] + dataFull[4].data[i] + dataFull[5].data[i] + dataFull[6].data[i]) / 4.0);
                engagement.push(
                    (dataFull[1].data[i] + dataFull[2].data[i] + dataFull[3].data[i] + dataFull[4].data[i] + dataFull[5].data[i] + dataFull[6].data[i]) / 6.0);
            }
        }


        var reformattedArray = dataFull.map(function (obj) {
            var rObj = {};
            obj.data.length > ceTimeSeries.timeLength ? obj.data.splice(-(obj.data.length - ceTimeSeries.timeLength)) : '';
            rObj["name"] = getMetricName(obj.metricName, ceTimeSeries.engine);
            rObj["data"] = obj.data;
            return rObj;
        });

        if (reformattedArray.length > ceTimeSeries.timeLength) {
            reformattedArray.splice(-(reformattedArray.length - ceTimeSeries.timeLength));
        }
        ceTimeSeries.dataFull = reformattedArray;
        ceTimeSeries.d3Drawn();
    }else{
        ceTimeSeries.getCsv(dataFull);
    }

};

ceTimeSeries.d3Drawn = function() {

    if (ceTimeSeries.graphType == "line") {
        var divId = ceTimeSeries.divId;
        var dataFull = ceTimeSeries.dataFull;
        var init_H = ceTimeSeries.init_H;// parseInt(d3.select('#'+divId).style("height").substring(0,d3.select('#'+divId).style("width").length-2)) || 500;
        init_H = init_H > 250 ? init_H : 250;

        //var m = [20, 150, 100, 20];
        //var m2 =[430, 150, 20, 20]; // margins

        var m = ceTimeSeries.margin.m;
        var m2 = ceTimeSeries.margin.m2;
//        var m3 = ceTimeSeries.margin.m3;
        var yLegend = ceTimeSeries.margin.yLegend;

        // var w = d3.select('#'+divId).style("width") - m[1] - m[3]; // width
        //	var w = 1200 - m[1] - m[3];
        var w = parseInt(d3.select('#' + divId).style("width").substring(0, d3.select('#' + divId).style("width").length - 2)) - m[1] - m[3];

        var h = init_H - m[0] - m[2];// - m3[3];
        var h2 = init_H - m2[0] - m2[2];// - m3[3]; // height
        //var h3 = init_H - m2[0] - m3[2]; // height

        var normalised = false;
        var dataRanges = [];

        for (var pos = 1; pos <= dataFull.length - 1; pos++) {
            dataRanges.push([d3.min(dataFull[pos].data), d3.max(dataFull[pos].data)]);
        }

        var data = ceTimeSeries.dataFull[1].data;

        function timetrans(timestamp) {
            var r = clearNumber(timestamp / 1000.0);
            return r;
        }

        var ymina = [];
        var ymaxa = [];
        for (var pos = 1; pos <= dataFull.length - 1; pos++) {
            ymina.push(d3.min(dataFull[pos].data));
            ymaxa.push(d3.max(dataFull[pos].data));
        }
        if (ymina.length) {
            ymina = d3.min(ymina);
            ymaxa = d3.max(ymaxa);
        }
        else {
            ymina = 0;
            ymaxa = 1;
        }

        var x = ceTimeSeries.xScale = d3.scale.linear().domain([0, timetrans(dataFull[0].data[dataFull[0].data.length - 1])]).range([0, w]);
        var x2 = d3.scale.linear().domain(x.domain()).range([0, w]);

        var y = d3.scale.linear().domain([ymina, ymaxa]).range([h, 0]);
        var y2 = d3.scale.linear().domain(y.domain()).range([h2, 0]);

        function adjustYDomain() {

            var ymin = [];
            var ymax = [];

            for (var pos = 1; pos <= dataFull.length - 1; pos++) {
                if (d3.select("#" + divId + " ." + dataFull[pos].name.charAt(0).toUpperCase() + dataFull[pos].name.slice(1) + "line").attr("visibility") == "visible") {
                    ymin.push(d3.min(dataFull[pos].data));
                    ymax.push(d3.max(dataFull[pos].data));
                }
            }

            if (ymin.length == 0) {
                return;
            }

            ymin = d3.min(ymin);
            ymax = d3.max(ymax);

            if (ymin == ymax) {
                ymax += 1;
            }

            y.domain([ymin, ymax]);
            y2.domain([ymin, ymax])

            for (var pos = 1; pos <= dataFull.length - 1; pos++) {
                graph.select("#path" + pos).attr("d", line(dataFull[pos].data));
                viewer.select("#vPath" + pos).attr("d", line2(dataFull[pos].data));
            }

        }


        var line = d3.svg.line()
            .defined(function (d) {
                return ceTimeSeries.isNumeric(clearNumber(d));
            }) //To remove null entries (will look like gaps in the line)
            //.interpolate('cardinal')
            .x(function (d, i) {
                return clearNumber(x(timetrans(dataFull[0].data[i])));
            })
            .y(function (d) {
                return clearNumber(y(d));
            });

        var line2 = d3.svg.line()
            .defined(function (d) {
                return ceTimeSeries.isNumeric(clearNumber(d));
            }) //To remove null entries (will look like gaps in the line)
            .x(function (d, i) {
                return clearNumber(x2(timetrans(dataFull[0].data[i])));
            })
            .y(function (d) {
                return clearNumber(y2(d));
            });

        d3.select("#" + divId + " svg").remove();

        var svgContainer = d3.select("#" + divId).append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2] + 30);

        svgContainer.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", w)
            .attr("height", h);


        var graph = svgContainer.append("svg:g")
            .attr("class", "focus")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        //ceTimeSeries.width = d3.select("#"+ceTimeSeries.divId+" svg g.focus").node().getBoundingClientRect().width;


        var viewer = svgContainer.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + m2[3] + "," + m2[0] + ")");

        var legendWrap = svgContainer.append("g")
            .attr("class", "legendwrap")
            .attr("transform", "translate(" + 0 + "," + (h + m[0] + m[2]) + ")");
        ;

        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true).tickFormat(function (d) {
            return d + "s"
        });
        var xAxis2 = d3.svg.axis().scale(x2).tickSize(-h).tickSubdivide(true).tickFormat(function (d) {
            return d + "s"
        });

        function brushed() {
            x.domain(brush.empty() ? x2.domain() : brush.extent());
            graph.select(".x.axis").call(xAxis);
            for (var pos = 1; pos <= dataFull.length - 1; pos++) {
                graph.select("#path" + pos).attr("d", line(dataFull[pos].data));
            }
        }

        var brush = d3.svg.brush()
            .x(x2)
            .on("brush", brushed);

        graph.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");

        graph.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);

        var yAxisV = d3.svg.axis().scale(y2).ticks(4).orient("left");

        viewer.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);

        var colorMap = d3.scale.ordinal().range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#bcbd22", "#17becf"]);

        function lineMouseover() {
            d3.select(this)
                .transition()
                .duration(100)
                .style("stroke-width", 5);
            this.parentNode.appendChild(this);
        }

        function lineMouseout() {
            d3.select(this)
                .transition()
                .duration(100)
                .style("stroke-width", 1.5);
        }

        for (var pos = 1; pos <= dataFull.length - 1; pos++) {
            var datad = dataFull[pos].data;
            var datan = dataFull[pos].name;
            try {

                graph.append("svg:path").attr("id", "path" + pos)
                    .attr("d", line(datad))
                    .attr("data-legend", datan)
                    .attr("data-legend-pos", pos)
                    .attr("stroke", colorMap(datan))
                    .attr("stroke-width", 1.5)
                    .attr("fill", "none")
                    .attr("visibility", "visible")
                    .attr("class", datan + "line gidline_" + gid)
                    .on("mouseover", lineMouseover)
                    .on("mouseout", lineMouseout)
                    .attr("clip-path", "url(#clip)");

                viewer.append("svg:path").attr("id", "vPath" + pos)
                    .attr("d", line2(datad))
                    .attr("stroke", colorMap(datan))
                    .attr("stroke-width", 1.5)
                    .attr("fill", "none")
                    .attr("visibility", "visible")
                    .attr("class", datan + "line gidline_" + gid)

            } catch (e) {

            }
        }

        viewer.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", h2);

        document.getElementById(ceTimeSeries.divId).dispatchEvent(ceTimeSeries.events.focus_ready);

        var legend = legendWrap.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + 25 + ",25)")
            .style("font-size", "16px")
            .call(d3.legend)
            .on("click", adjustYDomain);


        if (ceTimeSeries.videoId) {
            d3VRulerInit(divId);
        }
    }

    for (var pos = 1; pos <= dataFull.length - 1; pos++) {
        var visible = true;
        if (engine == 'kanako' && initState.indexOf(pos + 2 + "") == -1) {
            visible = false;
        } else if (engine == 'suwako' && initState.indexOf(pos + 24 + "") == -1) {
            visible = false;
        }
        if (!visible) {
            d3.selectAll("#" + divId + " ." + dataFull[pos].name + "line").attr("visibility", "hidden");
            d3.selectAll("#" + divId + " .legend" + dataFull[pos].name).style("fill", "grey");
        }
    }
};


