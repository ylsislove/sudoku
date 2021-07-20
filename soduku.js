var count = 0;			// 计时
var timeArea = document.getElementById("timer");
var startGame;
var lv_array;
var outgrid = null;
var lv_1_num = parseInt(document.getElementById("lv_1_num").textContent);
var lv_2_num = parseInt(document.getElementById("lv_2_num").textContent);
var lv_3_num = parseInt(document.getElementById("lv_3_num").textContent);
var lv_4_num = parseInt(document.getElementById("lv_4_num").textContent);
var lv_5_num = parseInt(document.getElementById("lv_5_num").textContent);

var isSuccess = false;		// 是否过关
var isFull = false;			// 当前级别已通关？

var userAnswer = [
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
]; 

// 显示答案
showAnser = function() {
	// 如果当前已显示答案，则不再重复显示
	if (isSuccess) return;
	
	// 获取用户填写的答案
	var elem = document.getElementsByClassName("hide-text");
	for(var i = 0; i < elem.length; i++) {
		var parentID = elem[i].parentNode.id;
		if(elem[i].value == "") {
			isSuccess = false;
			continue;
		}
		userAnswer[parseInt(parentID / 9)][parentID % 9] = elem[i].value;
	}

	// 和标准答案进行比对
	if (outgrid != null) {	
		isSuccess = true;
		stop();
		returnPage();
		var num = 0;
		for(var i = 0; i < 9; i++) {
			for(var j = 0; j < 9; j++) {
				var elem = document.getElementById(num);
				if(lv_array.charAt(num) != '0') {
					elem.innerHTML = lv_array.charAt(num);
				} else {
					// 用户填写的答案正确，显示绿色
					if (userAnswer[i][j] == outgrid[i][j]) {
						elem.innerHTML = userAnswer[i][j];
						elem.style = "color:#3CB371;font-size:25px;text-align:center;font-family:微软雅黑;height:46px;width:46px;line-height:46px;";
					} 
					// 用户填写的答案为空，显示标准答案，蓝色
					else if (userAnswer[i][j] == '0'){
						elem.innerHTML = outgrid[i][j];
						elem.style = "color:#7B68EE;font-size:25px;text-align:center;font-family:微软雅黑;height:46px;width:46px;line-height:46px;";
						isSuccess = false;
					} 
					// 用户填写的答案错误，显示标准答案，红色
					else {
						elem.innerHTML = outgrid[i][j];
						elem.style = "color:#C71585;font-size:25px;text-align:center;font-family:微软雅黑;height:46px;width:46px;line-height:46px;";
						isSuccess = false;
					}
				}
				num++;
			}
		}
		isSuccess = true;
	}
}

// 选择难度系数
selectLv = function() {
	isSuccess = false;
	userAnswer = [
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
	];
	
	outgrid = null;
	returnPage();
	var value = document.getElementById("mySelect").value;
	if(value == "1") {
		if (lv_1_num < 21) { lv_array = sudokuData[0][lv_1_num]; isFull = false;
		} else { isFull = true; }
		
	} else if (value == "2") {
		if (lv_2_num < 21) { lv_array = sudokuData[1][lv_2_num]; isFull = false;
		} else { isFull = true; }
		
	} else if (value == "3") {
		if (lv_3_num < 21) { lv_array = sudokuData[2][lv_3_num]; isFull = false;
		} else { isFull = true; }
		
	} else if (value == "4") {
		if (lv_4_num < 20) { lv_array = sudokuData[3][lv_4_num]; isFull = false;
		} else { isFull = true; }
		
	} else if (value == "5") {
		if (lv_5_num < 20) { lv_array = sudokuData[4][lv_5_num]; isFull = false;
		} else { isFull = true; }
	}
	renderArray();
	timeArea.innerHTML = "00:00:00";
	count = 0;
	
	// 填充固定数据
	for(var i = 0; i < 9; i++) {
		for(var j = 0; j < 9; j++) {
			if(lv_array.charAt(i * 9 + j) != '0')
				userAnswer[i][j] = lv_array.charAt(i * 9 + j);
		}
	}
	
	// 使用worker开辟新线程运行DLX算法
	var worker = new Worker("dancing_link.js");
	worker.postMessage(lv_array);
	worker.onmessage = function(evt) {     	//接收worker传过来的数据函数
		outgrid = evt.data;
	}
}
 
// 计时方法
pad = function(i) {
	return i < 10 ? ("0" + i) : i;
}

// 计时方法
timer = function() {
	count++;
	var h = pad(parseInt(count / 3600));
	var m = pad(parseInt(count / 60));
	var s = pad(parseInt(count % 60));
	timeArea.innerHTML = h + ":" + m + ":" + s;
}

// 下一关
next = function () {
	// 如果当前级别已通关，则点击无反应
	if (isFull) return;

	// 是否过关
	if (isSuccess) {
		var value = document.getElementById("mySelect").value;
		if(value == "1") {
			lv_1_num ++;
			document.getElementById("select_1").innerHTML = "初级 (" + lv_1_num + "/21)";
			if (lv_1_num >= 21) { isFull = true; }
			
		} else if (value == "2") {
			lv_2_num ++;
			document.getElementById("select_2").innerHTML = "中级 (" + lv_2_num + "/21)";
			if (lv_2_num >= 21) { isFull = true; }
			
		} else if (value == "3") {
			lv_3_num ++;
			document.getElementById("select_3").innerHTML = "高级 (" + lv_3_num + "/21)";
			if (lv_3_num >= 21) { isFull = true; }
			
		} else if (value == "4") {
			lv_4_num ++;
			document.getElementById("select_4").innerHTML = "地狱 (" + lv_4_num + "/20)";
			if (lv_4_num >= 20) { isFull = true; }
			
		} else if (value == "5") {
			lv_5_num ++;
			document.getElementById("select_5").innerHTML = "疯狂 (" + lv_5_num + "/20)";
			if (lv_5_num >= 20) { isFull = true; }
		}
		if (!isFull) selectLv();
	}
}

// 开始游戏
start = function () {
	var start = document.getElementById("start_game");
	if (start.textContent == "开始游戏") {
		start.innerHTML = "暂停游戏";
		// 开始计时
		startGame = setInterval(timer, 1000);
	} else {
		start.innerHTML = "开始游戏";
		clearInterval(startGame);
	}
}
 
// 重新开始游戏
restart = function() {
	userAnswer = [
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
		 [0,0,0,0,0,0,0,0,0],
	]; 
	// 重新开始计时
	timeArea.innerHTML = "00:00:00";
	count = 0;
	// 清除界面
	returnPage();
	// 重新渲染
	renderArray();
	isSuccess = false;
}

// 界面渲染
function renderArray() {
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 9; j++) {
			var elem = document.getElementById(i * 9 + j);
			if (lv_array.charAt(i * 9 + j) == '0') {
				elem.className = 'hide';
				elem.innerHTML = '<input type="text" class="hide-text">';
			} else {
				elem.className = 'show';
				elem.innerHTML = lv_array.charAt(i * 9 + j);
			}
		}
	}
}
	 
// 将界面上的数值清空
function returnPage() {
	for(var i = 0; i < 9; i++) {
		for(var j = 0; j < 9; j++) {
			var elem = document.getElementById(i * 9 + j);
			elem.innerHTML = "";
			elem.style.cssText = "";
		}
	}
}

function limitKey(evt, num){
	var key = window.evt? evt.keyCode : evt.which; 
	if(key < 49 || key > 57) return false; 
	else if(num.length == 1) return false; 
	else return true;
}

//页面初始化
selectLv();