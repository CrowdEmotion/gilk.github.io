(function () {
	
	var ceclient = new CEClient();
	var username, password;
    var kanakoMetrics = [1,3,4,5,6,7,8];
    var suwakoMetrics = [23,25,26,27,28,29,30];
	var engine = 'kanako';
    var videoData = null;
    var graphID = 'graph_0';
    var isNumeric = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n) && n!=null && n!=undefined && n!=NaN ;
    };
    var parseCSV_ID =  function(url){
        var nameString = url;
        var nameArray = nameString.split('/');
        var name = nameArray[nameArray.length - 1];
        return name.substring(0,name.indexOf('.'));
    };
	$(document).ready(function () {


		ceclient.init(true, true);
        $('#container').html('<div id="form_login" class="content">'+
		'<input id="username" class="loginFields" placeholder="username"   type="text"  class="inline">'+
		'<input id="password" class="loginFields" placeholder="password"  type="password"   class="inline">'+
		'<input id="submit" type="button"  class="inline" value="Login" ></div>');
		$('#container').on( 'click', '#submit', function () {execLogin($('#username').val(), $('#password').val());});
		$('.loginFields').keypress(function (e) {
			if (e.which==13){
				execLogin($('#username').val(), $('#password').val());
			}
		});
		
		
		 var execLogin = function (username, password) {

			ceclient.login(username, password,
				function (res) {

					if(res==true){
						$('#form_login').slideUp('slow', function(){
						$('#container').html(
							'<div id="form_graph" style="display: inline">'+
							'<input id="responseId" placeholder="Insert a response ID or csv file path" type="text"  class="inline">'+
							'<input id="checkHappy" type="checkbox"  class="inline metricCheck"  value="3" checked="checked"> Happy'+
							'<input id="checkSurprise" type="checkbox"  class="inline metricCheck"  value="4" checked="checked"> Surprise'+
							'<input id="checkAngry" type="checkbox"  class="inline metricCheck"  value="5" checked="checked"> Angry'+
							'<input id="checkDisgust" type="checkbox"  class="inline metricCheck"  value="6" checked="checked"> Disgust'+
							'<input id="checkFear" type="checkbox"  class="inline metricCheck"  value="7" checked="checked"> Fear'+
							'<input id="checkSadness" type="checkbox"  class="inline metricCheck"  value="8" checked="checked"> Sadness'+
                            '<select id="engine" type="select"  class="inline" >' +
                            '<option value="kanako" selected >Kanako</option><option value="suwako">Suwako / CLM</option></select>'+
							'<input id="submitRequestId" type="button"  class="inline"  value="Send Request" ></div>'+
							'<div id="'+graphID+'"></div></div>');
							$('#responseId').keypress(function (e) {
								if (e.which==13){
									$('#submitRequestId').click();
								}
							})

						    $('#'+graphID).slideDown('slow');
						});
						$('#container').on( 'click', '#submitRequestId', function () {
                            var respID = $('#responseId').val();
							engine = $("select#engine option").filter(":selected").val();
                            var engineMetric = kanakoMetrics;
                            if(engine == 'suwako'){
                                engineMetric = suwakoMetrics;
                                $('#checkHappy').val(25);
                                $('#checkSurprise').val(26);
                                $('#checkAngry').val(27);
                                $('#checkDisgust').val(28);
                                $('#checkFear').val(29);
                                $('#checkSadness').val(30);
                            }

                                //TODO load media video .csv
                                if(isNumeric(respID)) {
                                    ceclient.readFacevideoInfo(respID,
                                        function(res){
                                            videoData = res;
                                            ceclient.readTimeseries(respID, engineMetric, drawGraph, true);
                                        }
                                    );
                                }else{
                                    ceclient.readMediaVideo(parseCSV_ID(respID),
                                        function(res){
                                            videoData = res;
                                            drawGraph(respID);
                                        }
                                    );
                                }


						});
						$('#container').on( 'click', '#submitLogout', function () {
							execLogout();
						})

					}
					else{
						alert('Login fail');
					}

			});
				
		}
		
		var execLogout = function (res) {
            ceclient.logout(function (){location.reload(true);});
        };

		var drawGraph = function (apiData) {
			$('#'+graphID).slideUp('slow');
			var metricIds = $('input:checkbox:checked.metricCheck').map(function () {
				return this.value;
			}).get();
            var videoId = null;
            var videoPath = videoData.remoteLocation ? videoData.remoteLocation: videoData.presignedUrl;
            if(videoData && videoPath && window.location.search.indexOf('video=true')>-1){
                $('#video_wrapper').html(' ' +
                    '<div id="timing"></div>'+
                    '<button id="playpause" class="cmdbutton" >Play/Pause</button>'+
                    '<button id="reset" class="cmdbutton" >Reset</button>'+
                    '<video id="facevideo" width="420">'+
                    '<source src="'+videoPath+'" type="video/mp4">'+
                    'Your browser does not support HTML5 video.'+
                    '</video>');
                $('#playpause').on('click',playPause);
                $('#reset').on('click',reset);
                videoId = 'facevideo';
                ceTimeSeries.videoInit(videoId);
            }
			d3.select("#graph").html("");
            d3.select('#resEmo_0 svg').html("");
			ceTimeSeries.showGraph(apiData,"line",metricIds,graphID,true,videoId,engine);
			$('#'+graphID).slideDown('slow');
			window.addEventListener('resize', function () {
				d3.select("#"+graphID).html("");
				console.log(parseInt(d3.select("#"+graphID).style("width").substring(0,d3.select("#"+graphID).style("width").length-2)));
                ceTimeSeries.showGraph(apiData,"line",metricIds,graphID,true,videoId);
		//		console.log(parseInt(d3.select("#graph").style("width").substring(0,d3.select("#graph").style("width").length-2)));
			});
		};


        function playPause() {
            var myVideo = document.getElementById("facevideo");
            if (myVideo.paused){
                myVideo.play();
                ceTimeSeries.moveBarByVideo('play');
            }
            else {
                myVideo.pause();
                ceTimeSeries.moveBarByVideo('pause');
            }
        };
        function reset (){
            var myVideo = document.getElementById("facevideo");
            myVideo.pause()
            myVideo.currentTime = 0;
            ceTimeSeries.moveBarByVideo('reset');
        };

    });
})();