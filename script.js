window.addEventListener('load', function() {
	_init();
}, false);

var pixelRatio = 8,
	circleCursorRadius = 50,
	squareCursorSize = 100,
	showHelper = false,
	tool = '8bit',
	cursorType = 'circle';

var inputCircleCursorRadius = null,
	inputSquareCursorSize = null,
	inputPixelRatio = null;

var img = null,
	wrapper = document.createElement('div'),
	cursorCanvas = document.createElement('canvas'),
	cursorContext = cursorCanvas.getContext('2d'),
	imageCanvas = document.createElement('canvas'),
	imageContext = imageCanvas.getContext('2d'),
	helperCanvas = document.createElement('canvas'),
	helperContext = helperCanvas.getContext('2d'),
	leftClickHold = false,
	imageHistory = [];

/**
 * init app
 */
function _init() {
	helperCanvas.className = 'helper-canvas';
	helperCanvas.width = circleCursorRadius * 2;
	helperCanvas.height = circleCursorRadius * 2;

	img = document.getElementById('img');
	wrapper.className = 'wrapper';

	wrapper.appendChild(cursorCanvas);
	wrapper.appendChild(imageCanvas);
	wrapper.appendChild(img);

	imageCanvas.className = 'image-canvas';
	imageCanvas.width = img.width;
	imageCanvas.height = img.height;
	cursorCanvas.className = 'cursor-canvas';
	cursorCanvas.width = img.width;
	cursorCanvas.height = img.height;
	cursorCanvas.addEventListener('mousemove', function() {
		_drawCursor.apply(this, arguments);
		_tryToApplyTool.apply(this, arguments);
	}, false);
	cursorCanvas.addEventListener('mousedown', function(e) {
		if (e.button === 0) {
			leftClickHold = true;
			_tryToApplyTool.apply(this, arguments);
		} else {
			cursorCanvas.style.display = 'none';
			imageCanvas.style.display = 'none';
		}
	}, false);

	img.addEventListener('mouseup', function(e) {
		if (e.button === 0) {
			cursorCanvas.style.display = 'block';
			imageCanvas.style.display = 'block';
		}
	}, false);
	cursorCanvas.addEventListener('mouseup', function(e) {
		if (leftClickHold) {
			_updateImage.apply(this, arguments);
		}

		leftClickHold = false;
		e.stopPropagation();
		e.preventDefault();
	}, false);

	document.body.appendChild(wrapper);
	if (showHelper) {
		document.body.appendChild(helperCanvas);
	}

	_initForm();
}

/**
 * cursor size may change, so reinit helper canvas
 */
function _reInitHelperCanvas() {
	switch (cursorType) {
		case 'circle':
			helperCanvas.width = circleCursorRadius * 2;
			helperCanvas.height = circleCursorRadius * 2;
			break;
		case 'square':
			helperCanvas.width = squareCursorSize;
			helperCanvas.height = squareCursorSize;
			break;
	}
}

/**
 * apply tool if left mouse button is hold
 */
function _tryToApplyTool() {
	if (leftClickHold) {
		_copyCursorToHelper.apply(this, arguments);
		_applyCursorToHelper.apply(this, arguments);
		_applyToolToHelper.apply(this, arguments);
		_applyHelperToImage.apply(this, arguments);
	}
}

/**
 * write changes to img-element
 */
function _updateImage() {
	var _helperCanvas = document.createElement('canvas'),
		_helperContext = _helperCanvas.getContext('2d');
	_helperCanvas.width = img.width;
	_helperCanvas.height = img.height;
	_helperContext.drawImage(img, 0, 0);
	_helperContext.drawImage(imageCanvas, 0, 0);

	var _historyCanvas = document.createElement('canvas'),
		_historyContext = _historyCanvas.getContext('2d');
	_historyCanvas.width = img.width;
	_historyCanvas.height = img.height;
	_historyContext.drawImage(img, 0, 0);

	imageHistory.push(_historyCanvas);

	img.src = _helperCanvas.toDataURL();

	imageContext.clearRect(0, 0, img.width, img.height);
}

/**
 * apply cursor type/shape to helper, if necessary
 */
function _applyCursorToHelper() {
	var _helperCanvas = document.createElement('canvas'),
		_helperContext = _helperCanvas.getContext('2d');

	_helperCanvas.width = helperCanvas.width;
	_helperCanvas.height = helperCanvas.height;

	switch (cursorType) {
		case 'circle':
			_helperContext.beginPath();
			_helperContext.arc(_helperCanvas.width / 2, _helperCanvas.height / 2, circleCursorRadius, 0, 2 * Math.PI);
			_helperContext.fillStyle = '#000';
			_helperContext.fill();

			helperContext.globalCompositeOperation = 'destination-in';
			helperContext.drawImage(_helperCanvas, 0, 0);
			helperContext.globalCompositeOperation = 'source-over'; // reset to default
			break;
	}
}

/**
 * apply helper to image canvas
 */
function _applyHelperToImage(e) {
	var _posX = e.offsetX,
		_posY = e.offsetY;

	switch (cursorType) {
		case 'circle':
			_posX -= circleCursorRadius;
			_posY -= circleCursorRadius;
			break;
		case 'square':
			_posX -= squareCursorSize / 2;
			_posY -= squareCursorSize / 2;
			break;

	}
	imageContext.drawImage(helperCanvas, _posX, _posY);
}

/**
 * apply image operation to helper
 */
function _applyToolToHelper() {
	switch (tool) {
		case '8bit':
			pixelCanvasToScale(helperCanvas, pixelRatio);
	}
}

/**
 * copy imagepart selected via cursor to helper
 */
function _copyCursorToHelper(e) {
	var _posX = e.offsetX;
	var _posY = e.offsetY;

	switch (cursorType) {
		case 'circle':
			helperContext.drawImage(img, _posX - circleCursorRadius, _posY - circleCursorRadius, circleCursorRadius * 2, circleCursorRadius * 2, 0, 0, helperCanvas.width, helperCanvas.height);
			break;
		case 'square':
			helperContext.drawImage(img, _posX - squareCursorSize / 2, _posY - squareCursorSize / 2, squareCursorSize, squareCursorSize, 0, 0, helperCanvas.width, helperCanvas.height);
			break;
	}
}

/**
 * draw current cursor type to cursor canvas on mouse move
 */
function _drawCursor(e) {
	cursorContext.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

	switch (cursorType) {
		case 'circle':
			cursorContext.beginPath();
			cursorContext.arc(e.offsetX, e.offsetY, circleCursorRadius, 0, 2 * Math.PI);
			cursorContext.strokeStyle = '#fff';
			cursorContext.stroke();
			cursorContext.closePath();

			break;
		case 'square':
			cursorContext.beginPath();
			cursorContext.rect(e.offsetX - squareCursorSize / 2, e.offsetY - squareCursorSize / 2, squareCursorSize, squareCursorSize);
			cursorContext.strokeStyle = '#fff';
			cursorContext.stroke();
			break;
	}
}

/**
 * based on https://github.com/rogeriopvl/8bit
 */
var pixelCanvasToScale = function(src, scale) {
	scale *= 0.01;

	var _srcContext = src.getContext('2d');
	var _helperCanvas = document.createElement('canvas'),
		_helperContext = _helperCanvas.getContext('2d');

	var _scaledW = src.width * scale,
		_scaledH = src.height * scale;

	_helperCanvas.width = _scaledW;
	_helperCanvas.height = _scaledH;

	_srcContext.mozImageSmoothingEnabled = false;
	_srcContext.webkitImageSmoothingEnabled = false;
	_srcContext.imageSmoothingEnabled = false;

	_helperContext.drawImage(src, 0, 0, _scaledW, _scaledH); // draw tiny version

	_srcContext.clearRect(0, 0, src.width, src.height);
	_srcContext.drawImage(_helperCanvas, 0, 0, _scaledW, _scaledH, 0, 0, src.width, src.height);

	// reset to default
	_srcContext.mozImageSmoothingEnabled = true;
	_srcContext.webkitImageSmoothingEnabled = true;
	_srcContext.imageSmoothingEnabled = true;
};

/**
 * undo last change
 */
function _undo() {
	if (imageHistory.length > 0) {
		var _imageHistoryItem = imageHistory.pop();

		img.src = _imageHistoryItem.toDataURL();
	}
}

/**
 * undo all changes
 */
function _reset() {
	if (imageHistory.length > 0) {
		var _imageHistoryItem = imageHistory.shift();

		img.src = _imageHistoryItem.toDataURL();

		imageHistory = [];
	}
}

/**
 * init inputs, buttons etc.
 */
function _initForm() {
	var _radioCircleCursor = document.getElementById('cursor-circle'),
		_radioSquareCursor = document.getElementById('cursor-square'),
		_fieldsetCircleCursor = document.getElementById('cursor-circle-settings'),
		_fieldsetSquareCursor = document.getElementById('cursor-square-settings');

	_radioCircleCursor.addEventListener('click', function() {
		cursorType = 'circle';
		_fieldsetCircleCursor.disabled = false;
		_fieldsetSquareCursor.disabled = true;
		_reInitHelperCanvas();
	});

	_radioSquareCursor.addEventListener('click', function() {
		cursorType = 'square';
		_fieldsetCircleCursor.disabled = true;
		_fieldsetSquareCursor.disabled = false;
		_reInitHelperCanvas();
	});

	inputCircleCursorRadius = document.getElementById('circle-cursor-radius');
	inputCircleCursorRadius.value = circleCursorRadius;
	inputCircleCursorRadius.addEventListener('input', function() {
		circleCursorRadius = this.value;
		_reInitHelperCanvas();
	}, false);

	inputSquareCursorSize = document.getElementById('square-cursor-size');
	inputSquareCursorSize.value = squareCursorSize;
	inputSquareCursorSize.addEventListener('input', function() {
		squareCursorSize = this.value;
		_reInitHelperCanvas();
	}, false);

	inputPixelRatio = document.getElementById('pixel-ratio');
	inputPixelRatio.value = pixelRatio;
	inputPixelRatio.addEventListener('input', function() {
		pixelRatio = this.value;
	}, false);

	var _btnUndo = document.getElementById('undo'),
		_btnReset = document.getElementById('reset');

	_btnUndo.addEventListener('click', _undo, false);
	_btnReset.addEventListener('click', _reset, false);
}