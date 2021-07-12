getSongInfo();

// song_info table에서 컨트롤러에 요청해 데이터 가져와 전체 데이터 리턴하는 메서드 
function getSongInfo() {
	// 한 줄 데이터 가져와 저장할 변수 선언 
	let songName = (songId = (chordInfo = (track = (bpm = (songId = (userId = (beat = (keyName = (genre = (producerName = (songForm = (artist = ''))))))))))));
	
	// 모든 데이터 저장할 리스트 선언 
	let allData_li = new Array();
	
	// 컨트롤러에 데이터 요청 
	$.ajax ({
	url : "/show/allSong", 
	type: "GET",
	success : function(data) {		
		for (var song of data.songList) {		
			
			// 데이터 한 column -> json으로 데이터 생성 
			let songInfo = new Object();
			
			for (var key in song) {
				if (key == 'producerName') songInfo.producerName = song[key];
				else if (key == 'songName') songInfo.songName = song[key];
				else if (key == 'artist') songInfo.artist = song[key];
				else if (key == 'genre') songInfo.genre = song[key];
				else if (key == 'keyName') songInfo.keyName = song[key];
				else if (key == 'songForm') songInfo.songForm = song[key];
				else if (key == 'songId') songInfo.songId = song[key];
			}
			
			// 모든 데이터 저장할 리스트에 column 추가 
			allData_li.push(songInfo);
		}
	},
	
	// 모든 데이터 다 담고 songID 추출해서 코드 정보와 트랙 정보 가져옴 
	complete : function() {
		songID_li = getSongID(allData_li);
		// 코드 정보 + 트랙 정보 붙은 데이터 
		get_chord_and_track_info(allData_li, songID_li);
	}});
}

// 전체 데이터에서 songID 추출 메서드 
function getSongID(data_li) {
	let songID_li = new Array();
	
	for (var info of data_li) {
		for (var each_info in info) {
			if (each_info == 'songId') songID_li.push(info[each_info]);
		}
	}
	
	return songID_li;
}


// SongID로 코드 정보랑 트랙 정보 가져올 메서드
function get_chord_and_track_info(allData_li, songID_li) {
	for (var songId of songID_li) {
		
		// 한 곡의 트랙 정보 담을 객체 
		let trackInfo = new Array();
		
		// 한 곡의 코드 정보 담을 객체
		let chordInfo = new Array();
		
		// SongID로 트랙 정보, 코드 정보 가져옴 
		$.ajax ({
			url : "/show/trackANDchord",
			type : "POST", 
			data : {"songId": songId},
			async: false,
			success : function(data) {
				let trackInfo_li = data.trackInfo;
				let chordInfo_li = data.chordInfo;
				
				for (var info of trackInfo_li) {
					let track_di = new Object();
					
					track_di.trackNum = info.trackNum;
					track_di.instName = info.instName;
					
					trackInfo.push(track_di);
				}
				
				for (var chord of chordInfo_li) {
					let chord_di = new Object();
					
					chord_di.measureNum = chord.measureNum;
					chord_di.chord = chord.chord;
					
					chordInfo.push(chord_di);
				}
		},
		complete : function() {
			for (var eachData of allData_li) {
				if (eachData.songId == songId) {
					eachData.trackInfo = trackInfo;
					eachData.chordInfo = chordInfo;
					
					viewData(eachData);
				}
			}
		}});
	}
}

// jsp에 각 데이터 렌더하는 메서드 
function viewData(data) {
	let dataColumn = '';
	dataColumn += '<div class = "tableDataBox">' + 
					'<div class = "column pdname">' + data.producerName + '</div>' + 
					'<div class = "column song">' + data.songName + '</div>' + 
					'<div class = "column artist">' + data.artist + '</div>' + 
					'<div class = "column genre">' + data.genre + '</div>' + 
					'<div class = "column key">' + data.keyName + '</div>' + 
					'<div class = "column songform">' + data.songForm + '</div>';

	let trackBox = '<div class = "trackBox">';
	
	for (var track of data.trackInfo) {
		let trackColumn = '<div class = "trackColumn">'
		trackColumn += track.trackNum + '. ' + track.instName + '</div>';
		trackBox += trackColumn;
	}
	trackBox += '</div>'
	
	let chordBox = '<div class = "chordBox">';
	
	for (var measure of data.chordInfo) {
		let chorldColumn = '<div class = "chordColumn">'
		chorldColumn += measure.measureNum + '마디 :  ' + measure.chord + '</div>';
		chordBox += chorldColumn;
	}
	chordBox += '</div>'
	
	dataColumn +=	'<div class = "column track">' + trackBox + '</div>' + 
					'<div class = "column chordInfo">' + chordBox + '</div>' + 
			  	  '</div>';

	$('.dataColumnContainer').append(dataColumn);
}

// songID -> trackInfo, chordInfo 가져오는 메서드 
function getChordTrack(songID, song_info) { 
	// 한 곡의 트랙 정보 담을 객체 
	let trackInfo = new Array();
	
	// 한 곡의 코드 정보 담을 객체
	let chordInfo = new Array();
				
	$.ajax ({
			url : "/show/trackANDchord",
			type : "POST", 
			data : {"songId": songID},
			async : false,
			beforeSend: function() {
				// 기존 거 다 지우기
				$('.dataColumnContainer').html('');
			},
			
			success : function(data) {
				let trackInfo_li = data.trackInfo;
				let chordInfo_li = data.chordInfo;
				
				for (var info of trackInfo_li) {
					let track_di = new Object();
					
					track_di.trackNum = info.trackNum;
					track_di.instName = info.instName;
					
					trackInfo.push(track_di);
				}
				
				for (var chord of chordInfo_li) {
					let chord_di = new Object();
					
					chord_di.measureNum = chord.measureNum;
					chord_di.chord = chord.chord;
					
					chordInfo.push(chord_di);
				}
				
				song_info.trackInfo = trackInfo;
				song_info.chordInfo = chordInfo;
			}});
			
	return song_info;
}

// 검색 하려고 검색 박스 클릭 이벤트 핸들러
$('.searchBox').click(function() {
	//디폴트로 출력한 값 제거 
	$('.searchInfo').val('');
	
	//검색할 때 글자 검정색으로 변경 
	$('.searchInfo').css('color', 'black');
});

// 사용자가 검색 기능으로 작업한 데이터 찾는 메서드 
function getData_bySearch(pdName) {
	let song_info_li = new Array();
	
	$.ajax ({
		url : "/show/pdSong",
		type: "GET",
		data: {"producerName" : pdName},
		
		success : function(data) {
			if (data.songList.length == 0) {
				alert('찾는 데이터가 없습니다.');
				location.href = '/view';
			}
			
			else {
				for(var eachData of data.songList) {
					let songID = eachData.songId;
					
					let song_info = getChordTrack(songID, eachData);
					song_info_li.push(song_info);
				}
			} 
		},
		
		complete : function() {
			for (var songInfo of song_info_li) {
				viewData(songInfo);
			}
		}
	});
}

// 검색할 값 가져와서 컨트롤러에 찾기 요청 메서드 
$('.searchBtn').click(function() {
	let searchInfo = $('.searchInfo').val();
	getData_bySearch(searchInfo);
});

$('.searchBox').keypress(function(e) {
	if (e.keyCode == 13) {
		let searchInfo = $('.searchInfo').val();
		getData_bySearch(searchInfo);
		console.log('click');
	}	
});

// 내 데이터 보기 클릭 이벤트 핸들러
$('.viewMine').click(function() {
	let myName = $('.userName').text();
	getData_bySearch(myName);
});

// 전체 보기 클릭 이벤트 핸들러 
$('.viewAll').click(function() {
	// 기존 거 다 지우기
	$('.dataColumnContainer').html('');
				
	getSongInfo();
});