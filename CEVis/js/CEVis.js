// d3.legend.js
// (C) 2012 ziggy.jonsson.nyc@gmail.com
// MIT licence
//Modified by Gil Kogan (gil@crowdemotion.co.uk)

var ceGraphTS = {engine: 'kanako',gid:0,graphRuler:null, videoId: null, divId:null,time:0, width:0,height:0, handleBar:null, events: {focus_ready:null}};
ceGraphTS.events.focus_ready = new Event('cegraphts_focus_ready');
var gid = 0;


var d3Legend =function() {

    d3.legend = function (g) {
        var gid = ceGraphTS.gid;
        g.each(function () {
            var g = d3.select(this),
                items = {},
                svg = d3.select("#" + ceGraphTS.divId + ' svg'),
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
                .attr("y", function (d, i) {
                    return i + "em"
                })
                .attr("x", "1em")
                .attr("class", function (d) {
                    return "legend" + d.key + " gidlegendtext_" + gid
                })
                .attr("id", function (d) {
                    return "legend" + d.key + "text"
                })
                .attr("data-i18n", function (d) {
                    return "emo." + d.key.toLowerCase()
                })
                .text(function (d) {
                    ;
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
                .attr("cy", function (d, i) {
                    return i - 0.25 + "em"
                })
                .attr("cx", 0)
                .attr("r", "0.4em")
                .style("fill", function (d) {
                    return d.value.color
                })
                .attr("class", function (d) {
                    return "legend" + d.key + " " + "gidlegend_" + gid
                })
                .on("click", legendClick)
                .on("mouseover", legendMouseover)
                .on("mouseout", legendMouseout)

            var lbbox = li[0][0].getBBox()
            lb.attr("x", (lbbox.x - legendPadding))
                .attr("y", (lbbox.y - legendPadding))
                .attr("height", (lbbox.height + 2 * legendPadding))
                .attr("width", (lbbox.width + 2 * legendPadding))
        })
        return g
    };
};
var isNumeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n!=null && n!=undefined && n!=NaN ;
};
var d3VRulerDraw= function(){
    var xpos = d3.event.pageX;
    ceGraphTS.graphRuler = d3.select('#'+ceGraphTS.divId).selectAll('div.rule')
        .data([0]);
    ceGraphTS.graphRuler.enter().insert('div',":first-child")
        .attr('class', 'rule')
        .append('span');
    ceGraphTS.graphRuler.style('left', xpos + 'px');
    ceGraphTS.graphRuler.style('height', ceGraphTS.height + 'px');
    ceGraphTS.graphRuler.attr('height', ceGraphTS.height + 'px');
    //ceGraphTS.graphRuler.select('span').text(xpos);
};

var d3VRuler = function(graphID, videoTag){
    //TODO SVGLoad event  not working
    /*
    d3.select('#'+graphID+' svg').on('SVGLoad', function() {
        d3VRulerDraw();
    });
    */
    d3.select('#'+graphID+'').on('mousemove', function() {
        d3VRulerDraw();
        graphMoveBarByVideo(ceGraphTS.videoId, 'pause');
    });
    /* TODO
    d3.select('#graph').on('click', function() {
        graphMoveVideoByBar();
    });
    */
};

var graphMoveVideoByBar = function(videoId){
    //WIP
    if(videoId) ceGraphTS.videoId =  videoId;
    var pixelXSeconds = ceGraphTS.width / (ceGraphTS.time/1000);
    var vid =  document.getElementById(ceGraphTS.videoId);
    var xpos = d3.event.pageX;
    var left = ceGraphTS.graphRuler.style('left');
    vid.currentStyle = xpos/pixelXSeconds;
    if(handleBar){
        clearInterval(handleBar);
    }else{

    }
    graphMoveBarByVideo();
};

var graphMoveBarByVideo = function(videoId,action){
    if(videoId) ceGraphTS.videoId =  videoId;
    var handleFocus = null;
    if(action == 'pause' ||  action == 'stop' ){
        if(handleFocus) clearInterval(handleFocus);
    }else{
        handleFocus = setInterval(function(){
            if(ceGraphTS.width){
                moveBar()
                clearInterval(handleFocus);
            }
        },250);
    }



};
var moveBar = function(){
    var pixelXSeconds = ceGraphTS.width / (ceGraphTS.time/1000);
    var vid =  document.getElementById(ceGraphTS.videoId);
    ceGraphTS.handleBar = setInterval(function(){
        if(vid.currentTime>0) {
            ceGraphTS.graphRuler.style('left', (vid.currentTime * pixelXSeconds) + 'px');
            $('#timing').html((parseInt(vid.currentTime))+'s');
        };
    },250);
};

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
}


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


var saveDim = function(){
    if(ceGraphTS.width<=0) {
        ceGraphTS.width = d3.select("#" + ceGraphTS.divId + " svg g.focus").node().getBoundingClientRect().width;
        ceGraphTS.height = d3.select("#" + ceGraphTS.divId + " svg g.focus").node().getBoundingClientRect().height;
    }
};

function showGraph(dataFull, graphType, initState, divId, emotionsOnly, videoId, engine) {
    engine ? ceGraphTS.engine =   engine : ceGraphTS.engine = 'kanako';
    gid = divId.split('_');
    ceGraphTS.gid = gid = (gid[1])?  gid[1] : 0;
    ceGraphTS.divId = divId;
    document.getElementById(ceGraphTS.divId).addEventListener('cegraphts_focus_ready', saveDim, false);
    videoId = videoId ? document.getElementById(videoId) : false;
    d3Legend();
    var positiveMood = [];
    var negativeMood = [];
    var engagement = [];
    if(emotionsOnly==undefined) emotionsOnly= false;
    if(!dataFull || !dataFull[0] || !dataFull[0].data) return false;
    ceGraphTS.time = dataFull[0].data[dataFull[0].data.length-1];
    ceGraphTS.timeLength = dataFull[0].data.length;
    for( var i = 0; i < dataFull[0].data.length; i++){
        if(dataFull[1].data[i]==null || emotionsOnly==true){
            positiveMood.push(null);
            negativeMood.push(null);
            engagement.push(null);
        }
        else {
            positiveMood.push(
                (dataFull[1].data[i]+dataFull[2].data[i])/2.0);
            negativeMood.push(
                (dataFull[3].data[i]+dataFull[4].data[i]+dataFull[5].data[i]+dataFull[6].data[i])/4.0);
            engagement.push(
                (dataFull[1].data[i]+dataFull[2].data[i]+dataFull[3].data[i]+dataFull[4].data[i]+dataFull[5].data[i]+dataFull[6].data[i])/6.0);
        }
    }

    positiveMood=normalise(positiveMood);
    negativeMood=normalise(negativeMood);
    engagement=normalise(engagement);

    //TODO engagement
    /*
    dataFull = [
        {"name": ( dataFull[0].metricName.charAt(0).toUpperCase()+dataFull[0].metricName.slice(1) ) ,"data":dataFull[0].data},
        {"name": ( dataFull[1].metricName.charAt(0).toUpperCase()+dataFull[1].metricName.slice(1) ) ,"data":dataFull[1].data},
        {"name": ( dataFull[2].metricName.charAt(0).toUpperCase()+dataFull[2].metricName.slice(1) ) ,"data":dataFull[2].data},
        {"name": ( dataFull[3].metricName.charAt(0).toUpperCase()+dataFull[3].metricName.slice(1) ) ,"data":dataFull[3].data},
        {"name": ( dataFull[4].metricName.charAt(0).toUpperCase()+dataFull[4].metricName.slice(1) ) ,"data":dataFull[4].data},
        {"name": ( dataFull[5].metricName.charAt(0).toUpperCase()+dataFull[5].metricName.slice(1) ) ,"data":dataFull[5].data},
        {"name": ( dataFull[6].metricName.charAt(0).toUpperCase()+dataFull[6].metricName.slice(1) ) ,"data":dataFull[6].data},
        //{"name":"PositiveMood","data":positiveMood},
        //{"name":"NegativeMood","data":negativeMood},
        //{"name":"Engagement","data":engagement}
    ];
    */
    var reformattedArray = dataFull.map(function(obj){
        var rObj = {};
        obj.data.length>ceGraphTS.timeLength?  obj.data.splice(-(obj.data.length-ceGraphTS.timeLength)):'';
        rObj["name"] = getMetricName(obj.metricName,ceGraphTS.engine);
        rObj["data"] = obj.data;
        return rObj;
    });

    if(reformattedArray.length>ceGraphTS.timeLength){
        reformattedArray.splice(- (reformattedArray.length-ceGraphTS.timeLength));
    }
    dataFull = reformattedArray;

    if (graphType == "line") {

        var init_H = 300;// parseInt(d3.select('#'+divId).style("height").substring(0,d3.select('#'+divId).style("width").length-2)) || 500;
        init_H = init_H>250 ? init_H : 250;

        var m = [20, 150, 100, 20];
//		var m2 =[430, 150, 20, 20]; // margins

        var m = [init_H*(20.0/500.0), 150, init_H*(100.0/500.0), 20];
        var m2 =[init_H*(430.0/500.0), 150, init_H*(20.0/500.0), 20]; // margins

        // var w = d3.select('#'+divId).style("width") - m[1] - m[3]; // width
        //	var w = 1200 - m[1] - m[3];
        var w = parseInt(d3.select('#'+divId).style("width").substring(0,d3.select('#'+divId).style("width").length-2)) - m[1] - m[3];

        var h = init_H - m[0] - m[2];
        var h2 = init_H - m2[0] - m2[2]; // height

        var normalised = false;
        var dataRanges=[];

        for (var pos = 1; pos <= dataFull.length-1; pos++){
            dataRanges.push([d3.min(dataFull[pos].data),d3.max(dataFull[pos].data)]);
        }

        var data = dataFull[1].data;

        function timetrans(timestamp){
            var r  =clearNumber(timestamp / 1000.0);
            return r;
        }

        var ymina = [];
        var ymaxa = [];
        for(var pos = 1; pos <= dataFull.length-1; pos++){
            ymina.push(d3.min(dataFull[pos].data));
            ymaxa.push(d3.max(dataFull[pos].data));
        }
        if (ymina.length)
        {
            ymina=d3.min(ymina);
            ymaxa=d3.max(ymaxa);
        }
        else{
            ymina=0;
            ymaxa=1;
        }

        var x  = d3.scale.linear().domain([0, timetrans(dataFull[0].data[dataFull[0].data.length-1])]).range([0, w]);
        var x2 = d3.scale.linear().domain(x.domain()).range([0,w]);

        var y = d3.scale.linear().domain([ymina, ymaxa]).range([h, 0]);
        var y2= d3.scale.linear().domain(y.domain()).range([h2,0]);

        function adjustYDomain(){

            var ymin = [];
            var ymax = [];

            for(var pos = 1; pos <= dataFull.length-1; pos++){
                if(d3.select("#"+divId+" ."+dataFull[pos].name.charAt(0).toUpperCase()+dataFull[pos].name.slice(1)+"line").attr("visibility")=="visible")
                {
                    ymin.push(d3.min(dataFull[pos].data));
                    ymax.push(d3.max(dataFull[pos].data));
                }
            }

            if (ymin.length==0){return;}

            ymin=d3.min(ymin);
            ymax=d3.max(ymax);

            if(ymin==ymax){ymax+=1;}

            y.domain([ymin,ymax]);
            y2.domain([ymin,ymax])

            for (var pos = 1; pos <= dataFull.length-1; pos++) {
                graph.select("#path"+pos).attr("d",line(dataFull[pos].data));
                viewer.select("#vPath"+pos).attr("d",line2(dataFull[pos].data));
            }

        }



        var line = d3.svg.line()
            .defined(function(d) { return isNumeric(clearNumber(d)); }) //To remove null entries (will look like gaps in the line)
            //.interpolate('cardinal')
            .x(function (d, i) {
                return clearNumber(x(timetrans(dataFull[0].data[i])));
            })
            .y(function (d) {
                return clearNumber(y(d));
            });

        var line2 = d3.svg.line()
            .defined(function(d) { return isNumeric(clearNumber(d)); }) //To remove null entries (will look like gaps in the line)
            .x(function (d, i) {
                return clearNumber(x2(timetrans(dataFull[0].data[i])));
            })
            .y(function (d) {
                return clearNumber(y2(d));
            });

        d3.select("#"+divId+" svg").remove();

        var svgContainer = d3.select("#"+divId).append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2]);

        svgContainer.append("defs").append("clipPath")
            .attr("id","clip")
            .append("rect")
            .attr("width",w)
            .attr("height",h);

        var graph =	svgContainer.append("svg:g")
            .attr("class","focus")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

        //ceGraphTS.width = d3.select("#"+ceGraphTS.divId+" svg g.focus").node().getBoundingClientRect().width;


        var viewer = svgContainer.append("g")
            .attr("class","context")
            .attr("transform","translate(" + m2[3] + ","+m2[0]+")");

        var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true).tickFormat(function(d){return d+"s"});
        var xAxis2= d3.svg.axis().scale(x2).tickSize(-h).tickSubdivide(true).tickFormat(function(d){return d+"s"});

        function brushed() {
            x.domain(brush.empty() ? x2.domain() : brush.extent());
            graph.select(".x.axis").call(xAxis);
            for (var pos = 1; pos <= dataFull.length-1; pos++) {
                graph.select("#path"+pos).attr("d",line(dataFull[pos].data));
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

        for (var pos = 1; pos <= dataFull.length-1; pos++) {
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
            }catch(e){

            }
        }

        viewer.append("g")
            .attr("class", "x brush")
            .call(brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", h2 + 7);

        document.getElementById(ceGraphTS.divId).dispatchEvent(ceGraphTS.events.focus_ready);

        var legend = graph.append("g")
            .attr("class","legend")
            .attr("transform","translate("+(w+m[3]+25)+",50)")
            .style("font-size","16px")
            .call(d3.legend)
            .on("click",adjustYDomain);


        if(videoId){
            d3VRuler(divId, videoId);
        }
    }
    for (var pos = 1; pos <= dataFull.length-1; pos++){
        if(initState.indexOf(pos+2+"") == -1){
            d3.selectAll("#"+divId+" ."+dataFull[pos].name+"line").attr("visibility","hidden");
            d3.selectAll("#"+divId+" .legend"+dataFull[pos].name).style("fill","grey");
        }
    }

//	var el = d3.select('#'+divId);
//
//	function setSize(child, parent) {
//	    child && parent &&
//	    child.attr('width', parent.clientWidth)
//	         .attr('height', parent.clientHeight);
//	}
//	var that = this;


}



