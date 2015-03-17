// labelPart() proxy
SyntaxElementMorph.prototype.originalLabelPart = SyntaxElementMorph.prototype.labelPart;
SyntaxElementMorph.prototype.labelPart = function(spec) {
	var part;
	switch (spec) {
		case '%axes':
			part = new InputSlotMorph(
					null,
					false,
					{
					'x' : ['x'],
					'y' : ['y'], 
					'z' : ['z']
					},
					true
					);
			break;
		case '%directions':
			part = new InputSlotMorph(
					null,
					false,
					{
					'right' : ['right'],
					'up' : ['up']
					},
					true
					);
			break;
		case '%hsla':
			part = new InputSlotMorph(
					null,
					false,
					{
					'hue' : ['hue'],
					'saturation' : ['saturation'],
					'lightness' : ['lightness'],
					'opacity' : ['opacity']
					},
					true
					);
			break;
		case '%lookat':
			part = new InputSlotMorph(
					null,
					false,
					{
					'beetle' : ['beetle'],
					'origin' : ['origin']
					},
					true
					);
			break;
		default:
			part = this.originalLabelPart(spec);
			//part.fontSize = this.fontSize;
			break;
	}
	return part;
}

// Increase inter-block space

SyntaxElementMorph.prototype.originalFixLayout = SyntaxElementMorph.prototype.fixLayout;
SyntaxElementMorph.prototype.fixLayout = function () {
	this.originalFixLayout();
	if (this.nextBlock)	{
		var nb = this.nextBlock();
		if (nb) { nb.moveBy(new Point(0,1)) }
	}
}

CSlotMorph.prototype.originalInit = CSlotMorph.prototype.init;
CSlotMorph.prototype.init = function() {
	this.originalInit();
	this.dent -= 1;
	this.inset += 2;
}

CSlotMorph.prototype.fixLayout = function () {
    var nb = this.nestedBlock();
    if (nb) {
        nb.setPosition(
            new Point(
                this.left() + this.inset + 1, // inner left 
                this.top() + this.corner + 1 // inner top
            )
        );
        this.setHeight(nb.fullBounds().height() + this.corner + 2); // inner bottom
        this.setWidth(nb.fullBounds().width() + (this.cSlotPadding * 2));
    } else {
        this.setHeight(this.corner * 4  + this.cSlotPadding); // default
        this.setWidth(
            this.corner * 4
                + (this.inset * 2)
                + this.dent
                + (this.cSlotPadding * 2)
        ); // default
    }
    if (this.parent.fixLayout) {
        this.parent.fixLayout();
    }
};

// Camera SymbolMorph

SymbolMorph.prototype.names.push('camera');

SymbolMorph.prototype.originalSymbolCanvasColored = SymbolMorph.prototype.symbolCanvasColored;

SymbolMorph.prototype.symbolCanvasColored = function (aColor) {
	if (this.name == 'camera') {
		return this.drawSymbolCamera(newCanvas(new Point(this.symbolWidth(), this.size)), aColor);
	} else {
		return this.originalSymbolCanvasColored(aColor)
	}
}

SymbolMorph.prototype.drawSymbolCamera = function (canvas, color) {
	// answer a canvas showing a camera symbol
	var ctx = canvas.getContext('2d'),
		w = canvas.width,
		h = canvas.height;

	ctx.fillStyle = color.toString();

	ctx.fillRect(0, h/4, w*3/4, h/2);

	ctx.beginPath();
	ctx.moveTo(w, h*3/4);
	ctx.lineTo(w/2, h/2);
	ctx.lineTo(w, h/4);
	ctx.lineTo(w, h*3/4);
	ctx.closePath();
	ctx.fill();

	return canvas;
};

