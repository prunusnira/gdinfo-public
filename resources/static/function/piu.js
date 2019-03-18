/*****************************************************
 * GITADORA Info Server
 * Developed by Tae Jun Kang a.k.a Prunus Nira
 * (c) Nira 2016
 *
 * 1. This project is protected under GNU AGPL v3.0
 *    Please refer to LICENSE file on root
 * 2. Also, products and libraries used to implement
 *    this server are on USED-LIBRARIES file on root
 *****************************************************/
// CSV 파일에 들어가는 내용
/**
 * 패턴 ID, 클리어 랭크로 이루어진 데이터가 무제한으로 이어짐
 * 첫 째줄 = 유저이름 string, 유저 레벨
 * 그 후 = 패턴아이디, 랭크 번호 (0~6)
 * 0: ss, 1: s_g, 2: s_b, 3: a_on, 4: a_off, 5: breakoff, 6: fail
 **/
 
// 공통 데이터
var username = "";
var userlv = 0;

var userstat = new Map();

$("#loading").hide();
$("#seldiffSingle").hide();
$("#seldiffDouble").hide();
$("#userinfo").hide();
$("#targetTable").hide();

$(function() {
	
	// Update how to use
	var howto = "";
	if(lang == "ko") {
		howto +=
			"사용법:<br/>"+
			"0. <b><font color='red'>반드시 구글 크롬 계열의 브라우저를 사용한다 (모바일도 마찬가지)</font></b><br/>"+
			"1. 새로운 유저를 생성하거나 자신의 파일을 불러온다<br/>"+
			"2. 난이도를 선택하고 패턴을 골라서 랭크 등을 설정<br/>"+
			"3. 저장 버튼을 누르고 파일을 보관<br/>"+
			"* 버전과 상관없이 사용 가능하며 삭제곡도 데이터는 그대로 보관됩니다";
	}
	else {
		howto +=
			"How to use:<br/>"+
			"0. <b><font color='red'>MUST USE Google Chrome or related webkit browser (Also for mobile devices)</font></b><br/>"+
			"1. Create new user or load your CSV data file created here<br/>"+
			"2. Select level, pattern and set your rank<br/>"+
			"3. Save file and keep on your disk<br/>"+
			"* You can use this tool regardless version. Data kept for removed songs.";
	}
	
	$("#howto").append(howto);
});

function cleardata() {
	this.ptid;
	this.rank;
}

function newUser() {
	// 새 유저 버튼을 눌렀을때
	// UI를 확장하고 끝냄
	userstat = new Map();
	$("#newuserDialog").empty();
	var ext =
		"<div class='row'>"+
			"<div class='col-12'>";
	if(lang == "ko")
		ext += "새로운 사용자 추가: 이름에는 영문자와 숫자만 사용 가능합니다.<br/>" +
			"<span style='color:red'>** 엔터키는 누르지 마세요</span>";
	else
		ext += "Add new user: Only alphabet and number are allowed for user name<br/>" +
			"<span style='color:red'>** DO NOT PRESS ENTER/RETURN</span>";
	ext += "</div>"+
			"<div class='col-12'>"+
				"<input class='form-control' type='text' id='newname' placeholder='NAME' onkeyup='nameValidCheck()'/>"+
				"<input class='form-control' type='number' min='1' step='1' id='newlv' onkeypress='return event.charCode >= 48 && event.charCode <= 57' placeholder='LEVEL'/>"+
				"<a href='#no_div' class='btn btn-primary' onclick='addNewUser()'>Create Profile</a>"+
			"</div>"+
		"</div>";
	$("#newuserDialog").append(ext);
	$("#newuserDialog").dialog();
}

function nameValidCheck() {
	$("#newname").keyup(function(e) {
		var regex = /^[a-zA-Z0-9]+$/;
		if (regex.test(this.value) !== true)
		this.value = this.value.replace(/[^a-zA-Z0-9]+/, '');
	});
}

function addNewUser() {
	// 새 유저 UI에서 이름과 레벨 정보를 입력
	// username과 userlv를 업데이트하고 난이도 선택 버튼 표시
	var name = $("#newname").val().toUpperCase();
	var lv = $("#newlv").val();
	
	if(name != "" && lv != "") {
		username = $("#newname").val().toUpperCase();
		userlv = $("#newlv").val();
		$("#newuserDialog").dialog("close");
		
		updateUserNameLv();
		showLevels();
	}
	else {
		if(lang == "ko") alert("이름과 레벨은 빈칸이 될 수 없습니다");
		else alert("Name and Level cannot be empty");
	}
}

function editUser() {
	$("#newuserDialog").empty();
	var ext =
		"<div class='row'>"+
			"<div class='col-12'>";
		if(lang == "ko")
			ext += "현재 사용자 정보 수정: 이름에는 영문자와 숫자만 사용 가능합니다";
		else
			ext += "Edit user data: Only alphabet and number are allowed for user name";
	ext += "</div>"+
			"<div class='col-12'>"+
				"<input class='form-control' type='text' id='newname' placeholder='NAME' onkeyup='nameValidCheck()'/>"+
				"<input class='form-control' type='number' min='1' step='1' id='newlv' onkeypress='return event.charCode >= 48 && event.charCode <= 57' placeholder='LEVEL'/>"+
				"<a href='#no_div' class='btn btn-primary' onclick='addNewUser()'>Modify</a>"+
			"</div>"+
		"</div>";
	$("#newuserDialog").append(ext);
	$("#newuserDialog").dialog();
	
	$("#newname").val(username);
	$("#newlv").val(userlv);
}

function loadUser() {
	// 파일 열기 대화상자를 열고 데이터를 가져옴
	if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
		if(lang == "ko") {
			alert("이 브라우저는 정상적으로 지원되지 않을 수도 있습니다");
		    alert("파일 대화상자를 여는 시도를 수행합니다. 하지만 정상적인 동작을 위해 되도록 구글 크롬을 사용해주세요");
		}
		else {
			alert("This browser may not fully support this tool.");
		    alert("Try to show file open dialog. But, please try to use Google Chrome");
		}
    }
	//$("#fileopen").on('change', handleFileSelect);
	$("#fileopen").trigger("click");
	document.getElementById("fileopen").onchange = function(e) {
		handleFileSelect(e.srcElement.files[0]);
	}
}

function handleFileSelect(file) {
	var fr = new FileReader();
	fr.onload = function(e) {
		var result = e.target.result;
		callbackOpen(result);
	};
	fr.readAsText(file);
}

function callbackOpen(result) {
	var str = result.split("\n");
	
	var userinfo = str[0].split(",");
	username = userinfo[0];
	userlv = userinfo[1];
	
	for(var i = 1; i < str.length; i++) {
		var cur = str[i].split(",");
		if(cur[0] != "")
			userstat.set(cur[0], cur[1]);
	}
	
	updateUserNameLv();
	showLevels();
}

function showLevels() {
	$("#seldiffSingle").show();
	$("#seldiffDouble").show();
	$("#userinfo").show();
}

function saveUser() {
	var text = "";
	text += username+","+userlv+"\n";
	
	var keys = userstat.keys();
	for(var i = 0; i < userstat.size; i++) {
		var ckey = keys.next();
		if(ckey.value != "")
			text += ckey.value + ","+userstat.get(ckey.value) + "\n";
	}
	
	// 데이터를 새 파일(임시)에 쓰고 다운로드
	var elem = document.createElement("a");
	elem.setAttribute("href", "data:text/plain;charset=utf-8,"+encodeURIComponent(text));
	elem.setAttribute("download", "piudata_"+username+"_"+new Date().getTime()+".csv");
	elem.style.display = 'none';
	document.body.appendChild(elem);
	elem.click();
	document.body.removeChild(elem);
}

function updateMap(ptnid, rank) {
	// 새로운 기록을 추가
	userstat.set(ptnid, rank);
}

function updateUserNameLv() {
	$("#username").text(username);
	$("#username2").text("Player: "+username + " / Lv. " + userlv);
	$("#userlv").text(userlv);
}

function updateTable(data) {
	$("#targetTable").show();
	// 기존 테이블 초기화
	$("#lvover").empty();
	$("#lvhigh").empty();
	$("#lvnorm").empty();
	$("#lvlow").empty();
	$("#lvbelow").empty();
	$("#lvrand").empty();

	var cntov = 0;
	var cnthi = 0;
	var cntnr = 0;
	var cntlo = 0;
	var cntbe = 0;
	var cntrn = 0;
	
	var json = JSON.parse(data);
	
	for(var i = 0; i < json.patterns.length; i++) {
		var current = json.patterns[i];
		
		if(current.removed == 0) {
			var data = 
				"<div class='col-3 col-sm-2 div-pattern' style='padding:5px'>"+
					"<input style='transform:scale(2); left:48%;' type='checkbox' id='ptnsel' value='"+current.ptid+"' />"+
					"<a href='#no_div' onclick='updatePattern("+current.ptid+",\""+current.title_ko+"\")'>"+
						"<div style='background-origin:content-box;" +
									"background-image: url(\"/img/piumusic/"+current.musicid+".png\"), url(\"/img/piumusic/empty.jpg\");" +
									"background-repeat: no-repeat;" +
									"background-size: 100%;" +
									"height:50%;'>"+
							"<div>";
					if(current.steptype == 1)
						data += "<img style='width:40%; position: absolute; left:0px;' src='/img/piu/half.png'/>";
					else if(current.steptype == 2)
						data += "<img style='width:40%; position: absolute; left:0px;' src='/img/piu/pref.png'/>";
					data += "</div>" +
							"<div id='cs"+current.ptid+"'>"+
								"<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_np.png'/>"+
							"</div>"+
							"<img src='/img/piumusic/"+current.musicid+".png' onerror='/img/piumusic/empty.jpg' " +
									"style='width:100%; visibility: hidden;' />"+
						"</div>";
			if(lang == "ko")
				data += "<b><a class='innerhref' href='#no_div' " +
						"onclick='updatePattern("+current.ptid+",\""+current.title_ko+"\")'>"+
						current.title_ko+"</a></b>";
			else
				data += "<b><a class='innerhref' href='#no_div' " +
						"onclick='updatePattern("+current.ptid+",\""+current.title_en+"\")'>"+
						current.title_en+"</a></b>";
					"</a>"+
				"</div>";
			
			switch(current.difftype) {
			case 0:
				$("#lvbelow").append(data);
				cntbe++;
				break;
			case 1:
				$("#lvlow").append(data);
				cntlo++;
				break;
			case 2:
				$("#lvnorm").append(data);
				cntnr++;
				break;
			case 3:
				$("#lvhigh").append(data);
				cnthi++;
				break;
			case 4:
				$("#lvover").append(data);
				cntov++;
				break;
			case 5:
				$("#lvrand").append(data);
				cntrn++;
				break;
			}
			
			updateRecord(current.ptid);
		}
	}

	if(cntov == 0) {
		$("#cat5").text('');
	}
	if(cnthi == 0) {
		$("#cat4").text('');
	}
	if(cntnr == 0) {
		$("#cat3").text('');
	}
	if(cntlo == 0) {
		$("#cat2").text('');
	}
	if(cntbe == 0) {
		$("#cat1").text('');
	}
	if(cntrn == 0) {
		$("#cat0").text('');
	}
}

function updateRecord(id) {
	// 현재 불러온 내 기록에 해당 패턴 데이터가 있으면 NO PLAY를 지우고 해당 기록을 표시
	if(userstat.has(id.toString())) {
		switch(userstat.get(id.toString())) {
		case "0":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_ss.png' />");
			break;
		case "1":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_gs.png' />");
			break;
		case "2":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_s.png' />");
			break;
		case "3":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_aon.png' />");
			break;
		case "4":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_aoff.png' />");
			break;
		case "5":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_bcd.png' />");
			break;
		case "6":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_f.png' />");
			break;
		case "7":
			$("#cs"+id).html("<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_np.png' />");
			break;
		}
	}
}

function updatePattern(ptid, title) {
	// 기록 갱신용 Dialog 만듦
	$("#updateDialog").empty();
	var html =
		"<div class='row'>"+
			"<div class='col-12'>"+
				"Title: "+title+
				"<div class='form-group'>"+
					"<label for='grade'>Select rank:</label>"+
					"<select class='form-control' id='grade'>"+
					    "<option value='0'>SSS</option>"+
					    "<option value='1'>SS</option>"+
					    "<option value='2'>S</option>"+
					    "<option value='3'>A(Break On)</option>"+
					    "<option value='4'>A(Break Off)</option>"+
					    "<option value='5'>Break Off under A</option>"+
					    "<option value='6'>Stage Failed</option>"+
					    "<option value='7'>No Play</option>"+
					"</select>"+
				"</div>"+
			"</div>"+
			"<div class='col-12'>"+  
				"<a href='#no_div' class='btn btn-primary' onclick='updateData("+ptid+")'>Update</a>"+
				"<a href='#no_div' class='btn btn-primary' onclick='closeUP()'>Cancel</a>"+
			"</div>"+
		"</div>";
	$("#updateDialog").append(html);
	$("#updateDialog").dialog();
}

function updatePatternMultiple() {
	// 기록 갱신용 Dialog 만듦
	$("#updateDialog").empty();
	var html =
		"<div class='row'>"+
			"<div class='col-12'>"+
				"Update all selected patterns"+
				"<div class='form-group'>"+
					"<label for='grade'>Select rank:</label>"+
					"<select class='form-control' id='grade'>"+
					    "<option value='0'>SS</option>"+
					    "<option value='1'>S(Gold)</option>"+
					    "<option value='2'>S(Blue)</option>"+
					    "<option value='3'>A(Break On)</option>"+
					    "<option value='4'>A(Break Off)</option>"+
					    "<option value='5'>Break Off under A</option>"+
					    "<option value='6'>Stage Failed</option>"+
					    "<option value='7'>No Play</option>"+
					"</select>"+
				"</div>"+
			"</div>"+
			"<div class='col-12'>"+  
				"<a href='#no_div' class='btn btn-primary' onclick='updateMultipleData()'>Update</a>"+
				"<a href='#no_div' class='btn btn-primary' onclick='closeUP()'>Cancel</a>"+
			"</div>"+
		"</div>";
	$("#updateDialog").append(html);
	$("#updateDialog").dialog();
}

function updateData(ptid) {
	var rank = $("#grade").val();
	userstat.set(ptid.toString(), $("#grade").val());
	updateRecord(ptid);
	closeUP();
}

function updateMultipleData() {
	var rank = $("#grade").val();
	$("input[id=ptnsel]:checked").each(function() {
		var ptid = $(this).val();
		userstat.set(ptid.toString(), $("#grade").val());
		updateRecord(ptid);
		$(this).attr("checked", false);
	});
	closeUP();
}

function closeUP() {
	$("#updateDialog").dialog("close");
}

function getPatterns(type, level) {
	if(type == 'd' && level == '25') {
		$.ajax({
			url:"/piu/data/over/"+type,
			method: "post",
			success: function(data) {
				updateTableOver(data);
				if(type == "s") $("#type").text("Single");
				if(type == "d") $("#type").text("Double");
				$("#lv").text(level+" Over");
				$("#cat0").text("25 E");
				$("#cat1").text("25 N");
				$("#cat2").text("25 H");
				$("#cat3").text(level*1+1);
				$("#cat4").text(level*1+2);
				$("#cat5").text(level*1+3);
			}
		});
	}
	else if(type == 's' && level == '24') {
		$.ajax({
			url:"/piu/data/over/"+type,
			method: "post",
			success: function(data) {
				updateTableOver(data);
				if(type == "s") $("#type").text("Single");
				if(type == "d") $("#type").text("Double");
				$("#lv").text(level+" Over");
				$("#cat0").text("");
				$("#cat1").text("");
				$("#cat2").text("");
				$("#cat3").text(level*1);
				$("#cat4").text(level*1+1);
				$("#cat5").text(level*1+2);
			}
		});
	}
	else {
		$.ajax({
			url:"/piu/data/"+type+"/"+level,
			method: "post",
			success: function(data) {
				updateTable(data);
				if(type == "s") $("#type").text("Single");
				if(type == "d") $("#type").text("Double");
				$("#lv").text(level);
				$("#cat0").text("?");
				$("#cat1").text((level*1-1)+"-");
				$("#cat2").text("E");
				$("#cat3").text("N");
				$("#cat4").text("H");
				$("#cat5").text((level*1+1)+"+");
			}
		});
	}
}

function updateTableOver(data) {
	$("#targetTable").show();
	// 기존 테이블 초기화
	$("#lvover").empty();
	$("#lvhigh").empty();
	$("#lvnorm").empty();
	$("#lvlow").empty();
	$("#lvbelow").empty();
	$("#lvrand").empty();
	
	var json = JSON.parse(data);
	
	for(var i = 0; i < json.patterns.length; i++) {
		var current = json.patterns[i];
		
		if(current.removed == 0) {
			var data = 
				"<div class='col-3 col-sm-2 div-pattern' style='padding:5px'>"+
					"<input style='transform:scale(2); left:48%;' type='checkbox' id='ptnsel' value='"+current.ptid+"' />"+
					"<a href='#no_div' onclick='updatePattern("+current.ptid+",\""+current.title_ko+"\")'>"+
						"<div style='background-origin:content-box;" +
									"background-image: url(\"/img/piumusic/"+current.musicid+".png\"), url(\"/img/piumusic/empty.jpg\");" +
									"background-repeat: no-repeat;" +
									"background-size: 100%;'>"+
							"<div>";
					if(current.steptype == 1)
						data += "<img style='width:40%; position: absolute; left:0px;' src='/img/piu/half.png'/>";
					else if(current.steptype == 2)
						data += "<img style='width:40%; position: absolute; left:0px;' src='/img/piu/pref.png'/>";
					data += "</div>" +
							"<div id='cs"+current.ptid+"'>"+
								"<img style='width:60%; position: absolute; right:0px;' src='/img/piu/grade_np.png'/>"+
							"</div>"+
							"<img src='/img/piumusic/"+current.musicid+".png' onerror='/img/piumusic/empty.jpg' " +
									"style='width:100%; visibility: hidden;' />"+
						"</div>";
			if(lang == "ko")
				data += "<b><a class='innerhref' href='#no_div' " +
						"onclick='updatePattern("+current.ptid+",\""+current.title_ko+"\")'>"+
						current.title_ko+"</a></b>";
			else
				data += "<b><a class='innerhref' href='#no_div' " +
						"onclick='updatePattern("+current.ptid+",\""+current.title_en+"\")'>"+
						current.title_en+"</a></b>";
					"</a>"+
				"</div>";
			
			if(current.type == 0) {
				switch(current.lv) {
				case 24:
					$("#lvnorm").append(data);
					break;
				case 25:
					$("#lvhigh").append(data);
					break;
				case 26:
					$("#lvover").append(data);
					break;
				}
			}
			if(current.type == 1) {
				switch(current.lv) {
				case 25:
					if(current.difftype == 1)
						$("#lvrand").append(data);
					if(current.difftype == 2)
						$("#lvbelow").append(data);
					if(current.difftype == 3)
						$("#lvlow").append(data);
					break;
				case 26:
					$("#lvnorm").append(data);
					break;
				case 27:
					$("#lvhigh").append(data);
					break;
				case 28:
					$("#lvover").append(data);
					break;
				}
			}
		
			updateRecord(current.ptid);
		}
	}
}