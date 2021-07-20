var MAX_ROWS = 729;
var MAX_COLS = 324;
var lv_array;

onmessage = function (evt) {
	
	lv_array = evt.data;		// 通过evt.data获得发送来的数据
	dlx_solver();				// 运行DLX算法
	postMessage(outgrid);		// 将获取到的数据发送会主线程
}

function data() { 
	this.left = this;
	this.right = this;
	this.up = this;
	this.down = this;
	this.col = this;
	this.row = 0;
}

function column() { 
	this.left = this;
	this.right = this;
	this.up = this;
	this.down = this;
	this.size = 0;
	this.name = 0;
}

// 存储通过精确覆盖求解出来的答案
var output = new Array(MAX_ROWS / 9);

// 舞蹈链初始化
var matrix = new Array(MAX_ROWS);
for(var i = 0; i < MAX_ROWS; ++i) {
	matrix[i] = new Array(MAX_COLS);
	for (var j = 0; j < MAX_COLS; ++j)
		matrix[i][j] = null;
} 
var columns = new Array(MAX_COLS);
var header = new column();
var size = 0;

function dlx_solver() {
	
	// 初始化列头数组
	for (var i = 0; i < MAX_COLS; ++i)
		columns[i] = new column();
	
	// 链接列头元素
	for (i = 0; i < MAX_COLS; ++i) {
		if (i === 0) {
			columns[i].left = header;
			columns[i].right = columns[i + 1];
		}
		else if (i === MAX_COLS - 1) {
			columns[i].left = columns[i - 1];
			columns[i].right = header;
		}
		else {
			columns[i].left = columns[i - 1];
			columns[i].right = columns[i + 1];
		}
		columns[i].name = i;
	}
	header.right = columns[0];
	header.left = columns[MAX_COLS - 1];
	
	// 初始化数据矩阵
	for (i = 0; i < MAX_ROWS; ++i) {
		matrix[i][parseInt(i / 9)] = new data();
		matrix[i][parseInt(i / 9)].row = i;

		matrix[i][81 + 9 * parseInt(i / 81) + i % 9] = new data();
		matrix[i][81 + 9 * parseInt(i / 81) + i % 9].row = i;

		matrix[i][162 + i % 81] = new data();
		matrix[i][162 + i % 81].row = i;

		matrix[i][243 + i % 9 + 9 * parseInt(i / 27) - 27 * parseInt(i / 81) + 27 * parseInt(i / 243)] = new data();
		matrix[i][243 + i % 9 + 9 * parseInt(i / 27) - 27 * parseInt(i / 81) + 27 * parseInt(i / 243)].row = i;
	}
	
	// 矩阵 行链接
	for (i = 0; i < MAX_ROWS; ++i) {
		var size = 0;
		var row = new Array(MAX_COLS);
		for (var j = 0; j < MAX_COLS; ++j) {
			if (matrix[i][j] !== null) {
				row[size] = matrix[i][j];
				++size;
			}
		}
		for (var x = 0; x < size; ++x) {
			if (x === 0) {
				row[x].left = row[size - 1];
				row[x].right = row[x + 1];
			}
			else if (x === size - 1) {
				row[x].left = row[x - 1];
				row[x].right = row[0];
			}
			else {
				row[x].left = row[x - 1];
				row[x].right = row[x + 1];
			}
		}
	}
	
	// 矩阵 列链接
	for (j = 0; j < MAX_COLS; ++j) {
		size = 1;
		var col = new Array(MAX_ROWS + 1);
		col[0] = columns[j];
		for (i = 0; i < MAX_ROWS; ++i) {
			if (matrix[i][j] !== null) {
				col[size] = matrix[i][j];
				++size;
				matrix[i][j].col = columns[j];
				++(columns[j].size);
			}
		}
		for (x = 0; x < size; ++x) {
			if (x === 0) {
				col[x].up = col[size - 1];
				col[x].down = col[x + 1];
			}
			else if (x === size - 1) {
				col[x].up = col[x - 1];
				col[x].down = col[0];
			}
			else {
				col[x].up = col[x - 1];
				col[x].down = col[x + 1];
			}
		}
	}
	
	for (i = 0; i < 9; i++) {
		for (j = 0; j < 9; j++) {
			var value = parseInt(lv_array.charAt(i * 9 + j));
			if (value != '0') {
				parseInput(parseInt(value), i, j);
			} 
		}
	}
	
	if (search()) {
		console.log("dlx_success");
	} else {
		console.log("dlx_fail")
	}
}

function parseInput(n, r, c) {
	var row = r * 81 + c * 9 + (n - 1);
	coverClue(matrix[row][parseInt(row / 9)]);
}

function coverClue(d) {
	output[size] = d.row;
	++ size;
	coverCol(d.col);
	var r = d.right;
	while (r != d){
		coverCol(r.col);
		r = r.right;
	}
}

function coverCol(c) {
	c.left.right = c.right;
	c.right.left = c.left;
	var d = c.down;
	while (d != c) {
		var r = d.right;
		while (r !== d) {
			r.up.down = r.down;
			r.down.up = r.up;
			--(r.col.size);
			r = r.right;
		}
		d = d.down;
	}
}

function uncoverCol(c) {
	var u = c.up;
	while (u != c) {
		var l = u.left;
		while (l !== u) {
			l.up.down = l;
			l.down.up = l;
			++(l.col.size);
			l = l.left;
		}
		u = u.up;
	}
	c.left.right = c;
	c.right.left = c;
}

function findSmallest() {
    var c = null;
    var r = header.right;
    var size = MAX_ROWS + 1;
    while(r != header)
    {
        if(r.size < size)
        {
            size = r.size;
            c = r;
        }
        r = r.right;
    }
    return c;
}

function search() {
	if (header.right === header) {
		success();
		return true;
	}
	var c = findSmallest();
	coverCol(c);
	var d = c.down;
	while (d !== c) {
		output[size] = d.row;
		++ size;
		var r = d.right;
		while (r !== d) {
			coverCol(r.col);
			r = r.right;
		}

		// 进行递归
		if (search())
			return true;

		var l = d.left;
		while (l !== d) {
			uncoverCol(l.col);
			l = l.left;
		}
		d = d.down;
		--size;
	}
	uncoverCol(c);
	return false;
}

function success() {
	outgrid = new Array(9);
	for (var i = 0; i < 9; ++i){
		outgrid[i] = new Array(9);
		for (var j = 0; j < 9; ++j)
			outgrid[i][j] = 0;
	}
	for (i = 0; i < size; ++i)
	{
		var pos = parseInt(output[i] / 9);
		outgrid[parseInt(pos / 9)][pos % 9] = output[i] % 9 + 1;
	}
}