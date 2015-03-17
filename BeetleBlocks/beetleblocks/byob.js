BlockDialogMorph.prototype.originalInit = BlockDialogMorph.prototype.init;
BlockDialogMorph.prototype.init = function (target, action, environment) {
	var myself = this;
	this.originalInit(target, action, environment);
	this.category = 'my blocks';
	this.categories.children.forEach(function (each) {
		each.refresh();
	});
	if (this.types) {
		this.types.children.forEach(function (each) {
			each.setColor(SpriteMorph.prototype.blockColor['my blocks']);
		});
	}
	this.edit();
}
