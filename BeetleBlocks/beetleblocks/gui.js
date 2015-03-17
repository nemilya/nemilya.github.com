IDE_Morph.prototype.originalCreateLogo = IDE_Morph.prototype.createLogo;
IDE_Morph.prototype.createLogo = function () {
	this.originalCreateLogo();
	this.logo.texture = 'beetleblocks/logo.png';
	this.logo.drawNew();
}

IDE_Morph.prototype.originalNewProject = IDE_Morph.prototype.newProject;
IDE_Morph.prototype.newProject = function () {
	this.originalNewProject();
	this.createStatusDisplay();
}

IDE_Morph.prototype.originalRemoveSprite = IDE_Morph.prototype.removeSprite;
IDE_Morph.prototype.removeSprite = function (sprite) {
	var stage = sprite.parentThatIsA(StageMorph);
	stage.scene.remove(sprite.beetle);
	stage.reRender();
	this.originalRemoveSprite(sprite);
}

// Force flat design
IDE_Morph.prototype.setDefaultDesign = IDE_Morph.prototype.setFlatDesign; 

// Overriding these functions as we cannot proxy them. They don't return a menu, they create one and pop it up

IDE_Morph.prototype.projectMenu = function () {
	var menu,
	    myself = this,
	    world = this.world(),
	    pos = this.controlBar.projectButton.bottomLeft(),
	    graphicsName = this.currentSprite instanceof SpriteMorph ?
		    'Costumes' : 'Backgrounds',
	    shiftClicked = (world.currentKey === 16);

	menu = new MenuMorph(this);
	menu.addItem('Project notes...', 'editProjectNotes');
	menu.addLine();
	menu.addItem('New', 'createNewProject');
	menu.addItem('Open...', 'openProjectsBrowser');
	menu.addItem('Save', "save");
	if (shiftClicked) {
		menu.addItem(
				'Save to disk',
				'saveProjectToDisk',
				'experimental - store this project\nin your downloads folder',
				new Color(100, 0, 0)
			    );
	}
	menu.addItem('Save As...', 'saveProjectsBrowser');
	menu.addLine();
	menu.addItem(
			'Import...',
			function () {
			var inp = document.createElement('input');
			if (myself.filePicker) {
			document.body.removeChild(myself.filePicker);
			myself.filePicker = null;
			}
			inp.type = 'file';
			inp.style.color = "transparent";
			inp.style.backgroundColor = "transparent";
			inp.style.border = "none";
			inp.style.outline = "none";
			inp.style.position = "absolute";
			inp.style.top = "0px";
			inp.style.left = "0px";
			inp.style.width = "0px";
			inp.style.height = "0px";
			inp.addEventListener(
				"change",
				function () {
				document.body.removeChild(inp);
				myself.filePicker = null;
				world.hand.processDrop(inp.files);
				},
				false
				);
			document.body.appendChild(inp);
			myself.filePicker = inp;
			inp.click();
			},
			'file menu import hint' // looks up the actual text in the translator
				);

	menu.addItem(
			shiftClicked ?
			'Export project as plain text...' : 'Export project...',
			function () {
			if (myself.projectName) {
			myself.exportProject(myself.projectName, shiftClicked);
			} else {
			myself.prompt('Export Project As...', function (name) {
				myself.exportProject(name);
				}, null, 'exportProject');
			}
			},
			'show project data as XML\nin a new browser window',
			shiftClicked ? new Color(100, 0, 0) : null
		    );

	menu.addItem(
			'Export blocks...',
			function () { myself.exportGlobalBlocks(); },
			'show global custom block definitions as XML\nin a new browser window'
		    );

	if (shiftClicked) {
		menu.addItem(
				'Export all scripts as pic...',
				function () { myself.exportScriptsPicture(); },
				'show a picture of all scripts\nand block definitions',
				new Color(100, 0, 0)
			    );
	}

	menu.addLine();
	menu.addItem(
			'Export 3D model as STL',
			function() { myself.downloadSTL() },
			'download the currently rendered 3D model\ninto an STL file ready to be printed'
		    );
	menu.addItem(
			'Export 3D model as OBJ',
			function() { myself.downloadOBJ() },
			'download the currently rendered 3D model\ninto an OBJ file'
		    );

	menu.addLine();
	menu.addItem(
			'Import tools',
			function () {
			myself.droppedText(
				myself.getURLsbeOrRelative(
					'tools.xml'
					),
				'tools'
				);
			},
			'load the official library of\npowerful blocks'
		    );
	menu.addItem(
			'Libraries...',
			function () {
			// read a list of libraries from an external file,
			var libMenu = new MenuMorph(this, 'Import library'),
			libUrl = 'libraries/LIBRARIES';

			function loadLib(name) {
			var url = 'libraries/'
			+ name
			+ '.xml';
			myself.droppedText(myself.getURL(url), name);
			}

			myself.getURL(libUrl).split('\n').forEach(function (line) {
				if (line.length > 0) {
				libMenu.addItem(
					line.substring(line.indexOf('\t') + 1),
					function () {
					loadLib(
						line.substring(0, line.indexOf('\t'))
					       );
					}
					);
				}
				});

			libMenu.popup(world, pos);
			},
			'Select categories of additional blocks to add to this project.'
				);


	menu.popup(world, pos);
}

IDE_Morph.prototype.settingsMenu = function () {
    var menu,
        stage = this.stage,
        world = this.world(),
        myself = this,
        pos = this.controlBar.settingsButton.bottomLeft(),
        shiftClicked = (world.currentKey === 16);

    function addPreference(label, toggle, test, onHint, offHint, hide) {
        var on = '\u2611 ',
            off = '\u2610 ';
        if (!hide || shiftClicked) {
            menu.addItem(
                (test ? on : off) + localize(label),
                toggle,
                test ? onHint : offHint,
                hide ? new Color(100, 0, 0) : null
            );
        }
    }

    menu = new MenuMorph(this);
    menu.addItem('Language...', 'languageMenu');
    menu.addItem(
        'Zoom blocks...',
        'userSetBlocksScale'
    );
    menu.addLine();
    addPreference(
        'Blurred shadows',
        'toggleBlurredShadows',
        useBlurredShadows,
        'uncheck to use solid drop\nshadows and highlights',
        'check to use blurred drop\nshadows and highlights',
        true
    );
    addPreference(
        'Zebra coloring',
        'toggleZebraColoring',
        BlockMorph.prototype.zebraContrast,
        'uncheck to disable alternating\ncolors for nested block',
        'check to enable alternating\ncolors for nested blocks',
        true
    );
    addPreference(
        'Dynamic input labels',
        'toggleDynamicInputLabels',
        SyntaxElementMorph.prototype.dynamicInputLabels,
        'uncheck to disable dynamic\nlabels for variadic inputs',
        'check to enable dynamic\nlabels for variadic inputs',
        true
    );
    addPreference(
        'Prefer empty slot drops',
        'togglePreferEmptySlotDrops',
        ScriptsMorph.prototype.isPreferringEmptySlots,
        'uncheck to allow dropped\nreporters to kick out others',
        'settings menu prefer empty slots hint',
        true
    );
    addPreference(
        'Long form input dialog',
        'toggleLongFormInputDialog',
        InputSlotDialogMorph.prototype.isLaunchingExpanded,
        'uncheck to use the input\ndialog in short form',
        'check to always show slot\ntypes in the input dialog'
    );
    addPreference(
        'Plain prototype labels',
        'togglePlainPrototypeLabels',
        BlockLabelPlaceHolderMorph.prototype.plainLabel,
        'uncheck to always show (+) symbols\nin block prototype labels',
        'check to hide (+) symbols\nin block prototype labels'
    );
    addPreference(
        'Virtual keyboard',
        'toggleVirtualKeyboard',
        MorphicPreferences.useVirtualKeyboard,
        'uncheck to disable\nvirtual keyboard support\nfor mobile devices',
        'check to enable\nvirtual keyboard support\nfor mobile devices',
        true
    );
    addPreference(
        'Input sliders',
        'toggleInputSliders',
        MorphicPreferences.useSliderForInput,
        'uncheck to disable\ninput sliders for\nentry fields',
        'check to enable\ninput sliders for\nentry fields'
    );
    if (MorphicPreferences.useSliderForInput) {
        addPreference(
            'Execute on slider change',
            'toggleSliderExecute',
            InputSlotMorph.prototype.executeOnSliderEdit,
            'uncheck to supress\nrunning scripts\nwhen moving the slider',
            'check to run\nthe edited script\nwhen moving the slider'
        );
    }
    addPreference(
        'Clicking sound',
        function () {
            BlockMorph.prototype.toggleSnapSound();
            if (BlockMorph.prototype.snapSound) {
                myself.saveSetting('click', true);
            } else {
                myself.removeSetting('click');
            }
        },
        BlockMorph.prototype.snapSound,
        'uncheck to turn\nblock clicking\nsound off',
        'check to turn\nblock clicking\nsound on'
    );
    addPreference(
        'Animations',
        function () {myself.isAnimating = !myself.isAnimating; },
        myself.isAnimating,
        'uncheck to disable\nIDE animations',
        'check to enable\nIDE animations',
        true
    );
    addPreference(
        'Turbo mode',
        'toggleFastTracking',
        this.stage.isFastTracked,
        'uncheck to run scripts\nat normal speed',
        'check to prioritize\nscript execution'
    );
    menu.addLine(); // everything below this line is stored in the project
    addPreference(
        'Thread safe scripts',
        function () {stage.isThreadSafe = !stage.isThreadSafe; },
        this.stage.isThreadSafe,
        'uncheck to allow\nscript reentrance',
        'check to disallow\nscript reentrance'
    );
    addPreference(
        'Prefer smooth animations',
        'toggleVariableFrameRate',
        StageMorph.prototype.frameRate,
        'uncheck for greater speed\nat variable frame rates',
        'check for smooth, predictable\nanimations across computers'
    );
    addPreference(
        'Flat line ends',
        function () {
            SpriteMorph.prototype.useFlatLineEnds =
                !SpriteMorph.prototype.useFlatLineEnds;
        },
        SpriteMorph.prototype.useFlatLineEnds,
        'uncheck for round ends of lines',
        'check for flat ends of lines'
    );
    addPreference(
        'Codification support',
        function () {
            StageMorph.prototype.enableCodeMapping =
                !StageMorph.prototype.enableCodeMapping;
            myself.currentSprite.blocksCache.variables = null;
            myself.currentSprite.paletteCache.variables = null;
            myself.refreshPalette();
        },
        StageMorph.prototype.enableCodeMapping,
        'uncheck to disable\nblock to text mapping features',
        'check for block\nto text mapping features',
        false
    );
    menu.popup(world, pos);
};

// STL export
IDE_Morph.prototype.downloadSTL = function() {
	var exporter = new THREE.STLExporter(),
		stlString = exporter.exportScene(this.stage.scene);
		blob = new Blob([stlString], {type: 'text/plain;charset=utf-8'});

	saveAs(blob, (this.projectName ? this.projectName : 'beetleblocks_export') + '.stl'); 
}

// OBJ export
IDE_Morph.prototype.downloadOBJ = function() {
	var exporter = new THREE.OBJExporter(),
		scene = copy(this.stage.scene),
		objString, 
		blob;

	scene.children = scene.children.filter(function(each) { return each.name != 'beetle' });
	objString = exporter.parse(scene);
	blob = new Blob([objString], {type: 'text/plain;charset=utf-8'});

	saveAs(blob, (this.projectName ? this.projectName : 'beetleblocks_export') + '.obj'); 
}

// IDE_Morph.prototype.createControlBar proxy
IDE_Morph.prototype.originalCreateControlBar = IDE_Morph.prototype.createControlBar;
IDE_Morph.prototype.createControlBar = function () {
	this.originalCreateControlBar();

	var myself = this,
	    colors = [
		    this.groupColor,
	    this.frameColor.darker(50),
	    this.frameColor.darker(50)
		    ];

	// cameraButton
	button = new PushButtonMorph(
			this,
			'cameraMenu',
			new SymbolMorph('camera', 14)
			);
	button.corner = 12;
	button.color = colors[0];
	button.highlightColor = colors[1];
	button.pressColor = colors[2];
	button.labelMinExtent = new Point(36, 18);
	button.padding = 0;
	button.labelShadowOffset = new Point(-1, -1);
	button.labelShadowColor = colors[1];
	button.labelColor = this.buttonLabelColor;
	button.contrast = this.buttonContrast;
	button.drawNew();
	button.hint = '3D world settings';
	button.fixLayout();
	cameraButton = button;
	this.controlBar.add(cameraButton);
	this.controlBar.cameraButton = cameraButton; // for menu positioning	

	this.controlBar.originalFixLayout = this.controlBar.fixLayout;

	this.controlBar.fixLayout = function () {
		this.originalFixLayout();

		cameraButton.setCenter(myself.controlBar.center());
		cameraButton.setLeft(this.settingsButton.right() + 5);

		this.updateLabel();
	};

	this.controlBar.originalUpdateLabel = this.controlBar.updateLabel;

	this.controlBar.updateLabel = function() {
		this.originalUpdateLabel();
		this.label.setLeft(cameraButton.right() + 5);
	}
}

IDE_Morph.prototype.cameraMenu = function () {
	var menu,
	    stage = this.stage,
	    world = this.world(),
	    myself = this,
	    pos = this.controlBar.cameraButton.bottomLeft(),
	    shiftClicked = (world.currentKey === 16);

	function addPreference(label, toggle, test, onHint, offHint, hide) {
		var on = '\u2611 ',
		    off = '\u2610 ';
		if (!hide || shiftClicked) {
			menu.addItem(
					(test ? on : off) + localize(label),
					toggle,
					test ? onHint : offHint,
					hide ? new Color(100, 0, 0) : null
				    );
		}
	}

	menu = new MenuMorph(this);
	menu.addItem(
		'Reset camera',
		function() { stage.camera.reset() }
		);
	menu.addLine();
	menu.addItem(
		'Set background color', 
		function(){ 
			this.pickColor(null, function(color) { 
				stage.renderer.setClearColor('rgb(' + color.r + ',' + color.g + ',' + color.b + ')', 1);
				stage.reRender();
			})
		});
	menu.addLine();
	menu.addItem(
		'Set grid interval',
		function(){
			new DialogBoxMorph(
		        this,
		        function(point) { stage.scene.grid.setInterval(point) },
		        this
		    ).promptVector(
		        'Grid intervals',
		        stage.scene.grid.interval, // current
		        new Point(1, 1), // default
		        'x interval',
		        'y interval',
		        this.world(),
		        null, // pic
		        null // msg
		    );
		});
	menu.addItem(
		'Set grid color', 
		function(){ 
			this.pickColor(null, function(color) { 
				stage.scene.grid.setColor('0x' + color.r.toString(16) + color.g.toString(16) + color.b.toString(16));
				stage.reRender();
			})
		});
	menu.popup(world, pos);
};

IDE_Morph.prototype.originalSetStageExtent = IDE_Morph.prototype.setStageExtent;
IDE_Morph.prototype.setStageExtent = function (aPoint) {
	this.originalSetStageExtent(aPoint);
	this.stage.renderer.setSize(aPoint.x, aPoint.y);
	this.stage.reRender();
}

// Examples now pulls from local. We need to override, proxying is too complex in this case
ProjectDialogMorph.prototype.getExamplesProjectList = function () {
    var dir,
        projects = [];
    dir = JSON.parse(this.ide.getURL('https://api.github.com/repos/ericrosenbaum/BeetleBlocks/contents/beetleblocks/examples'));
	dir.forEach(function(each){
		var dta = {
			name: each.name.replace('.xml',''),
			thumb: null,
			notes: null,
			path: each.path
		};
		projects.push(dta)
	})
    projects.sort(function (x, y) {
        return x.name < y.name ? -1 : 1;
    });
    return projects;
};

ProjectDialogMorph.prototype.setSource = function (source) {
    var myself = this,
        msg;

    this.source = source; //this.task === 'save' ? 'local' : source;
    this.srcBar.children.forEach(function (button) {
        button.refresh();
    });
    switch (this.source) {
    case 'cloud':
        msg = myself.ide.showMessage('Updating\nproject list...');
        this.projectList = [];
        SnapCloud.getProjectList(
            function (projectList) {
                myself.installCloudProjectList(projectList);
                msg.destroy();
            },
            function (err, lbl) {
                msg.destroy();
                myself.ide.cloudError().call(null, err, lbl);
            }
        );
        return;
    case 'examples':
        this.projectList = this.getExamplesProjectList();
        break;
    case 'local':
        this.projectList = this.getLocalProjectList();
        break;
    }

    this.listField.destroy();
    this.listField = new ListMorph(
        this.projectList,
        this.projectList.length > 0 ?
                function (element) {
                    return element.name;
                } : null,
        null,
        function () {myself.ok(); }
    );

    this.fixListFieldItemColors();
    this.listField.fixLayout = nop;
    this.listField.edge = InputFieldMorph.prototype.edge;
    this.listField.fontSize = InputFieldMorph.prototype.fontSize;
    this.listField.typeInPadding = InputFieldMorph.prototype.typeInPadding;
    this.listField.contrast = InputFieldMorph.prototype.contrast;
    this.listField.drawNew = InputFieldMorph.prototype.drawNew;
    this.listField.drawRectBorder = InputFieldMorph.prototype.drawRectBorder;

    if (this.source === 'local') {
        this.listField.action = function (item) {
            var src, xml;

            if (item === undefined) {return; }
            if (myself.nameField) {
                myself.nameField.setContents(item.name || '');
            }
            if (myself.task === 'open') {

                src = localStorage['-snap-project-' + item.name];
                xml = myself.ide.serializer.parse(src);

                myself.notesText.text = xml.childNamed('notes').contents
                    || '';
                myself.notesText.drawNew();
                myself.notesField.contents.adjustBounds();
                myself.preview.texture = xml.childNamed('thumbnail').contents
                    || null;
                myself.preview.cachedTexture = null;
                myself.preview.drawNew();
            }
            myself.edit();
        };
    } else { // 'examples', 'cloud' is initialized elsewhere
        this.listField.action = function (item) {
            var src, xml;
            if (item === undefined) {return; }
            if (myself.nameField) {
                myself.nameField.setContents(item.name || '');
            }
            src = myself.ide.getURL(item.path);

            xml = myself.ide.serializer.parse(src);
            myself.notesText.text = xml.childNamed('notes').contents
                || '';
            myself.notesText.drawNew();
            myself.notesField.contents.adjustBounds();
            myself.preview.texture = xml.childNamed('thumbnail').contents
                || null;
            myself.preview.cachedTexture = null;
            myself.preview.drawNew();
            myself.edit();
        };
    }
    this.body.add(this.listField);
    this.shareButton.hide();
    this.unshareButton.hide();
    if (this.source === 'local') {
        this.deleteButton.show();
    } else { // examples
        this.deleteButton.hide();
    }
    this.buttons.fixLayout();
    this.fixLayout();
    if (this.task === 'open') {
        this.clearDetails();
    }
};

ProjectDialogMorph.prototype.openProject = function () {
    var proj = this.listField.selected,
        src;
    if (!proj) {return; }
    this.ide.source = this.source;
    if (this.source === 'cloud') {
        this.openCloudProject(proj);
    } else if (this.source === 'examples') {
        src = this.ide.getURL('beetleblocks/examples/' + proj.name + '.xml');
        this.ide.openProjectString(src);
        this.destroy();
    } else { // 'local'
        this.ide.openProject(proj.name);
        this.destroy();
    }
};

IDE_Morph.prototype.originalRawOpenProjectString = IDE_Morph.prototype.rawOpenProjectString;
IDE_Morph.prototype.rawOpenProjectString = function (str) {
	this.originalRawOpenProjectString(str);
	this.createStatusDisplay();
}

IDE_Morph.prototype.originalRawOpenCloudDataString = IDE_Morph.prototype.rawOpenCloudDataString;
IDE_Morph.prototype.rawOpenCloudDataString = function (str) {
	this.originalRawOpenCloudDataString(str);
	this.createStatusDisplay();
}

// Single Morph mode, no corral and no tabs in the scripting area

IDE_Morph.prototype.createCorralBar = nop;
IDE_Morph.prototype.createCorral = nop;

IDE_Morph.prototype.fixLayout = function (situation) {
    // situation is a string, i.e.
    // 'selectSprite' or 'refreshPalette' or 'tabEditor'
    var padding = this.padding;

    Morph.prototype.trackChanges = false;

    if (situation !== 'refreshPalette') {
        // controlBar
        this.controlBar.setPosition(this.logo.topRight());
        this.controlBar.setWidth(this.right() - this.controlBar.left());
        this.controlBar.fixLayout();

        // categories
        this.categories.setLeft(this.logo.left());
        this.categories.setTop(this.logo.bottom());
    }

    // palette
    this.palette.setLeft(this.logo.left());
    this.palette.setTop(this.categories.bottom());
    this.palette.setHeight(this.bottom() - this.palette.top());

    if (situation !== 'refreshPalette') {
        // stage
        if (this.isAppMode) {
            this.stage.setScale(Math.floor(Math.min(
                (this.width() - padding * 2) / this.stage.dimensions.x,
                (this.height() - this.controlBar.height() * 2 - padding * 2)
                    / this.stage.dimensions.y
            ) * 10) / 10);
            this.stage.setCenter(this.center());
        } else {
            this.stage.setScale(this.isSmallStage ? this.stageRatio : 1);
            this.stage.setTop(this.logo.bottom() + padding);
            this.stage.setRight(this.right());
        }

        // spriteEditor
        if (this.spriteEditor.isVisible) {
            this.spriteEditor.setPosition(this.categories.topRight().add(padding));
            this.spriteEditor.setExtent(new Point(
                Math.max(0, this.stage.left() - padding - this.spriteEditor.left()),
                this.bottom() - this.categories.top()
            ));
        }

        this.statusDisplay.fixLayout();
    }

    Morph.prototype.trackChanges = true;
    this.changed();
};

IDE_Morph.prototype.buildPanes = function () {
    this.createLogo();
    this.createControlBar();
    this.createCategories();
    this.createPalette();
    this.createStage();
    this.createSpriteEditor();
	// It's easier to make a bogus spriteBar object than to remove all references to it
	this.spriteBar = { 
		tabBar: { 
			tabTo: nop
		}
	};
	this.createStatusDisplay();
};

IDE_Morph.prototype.createStatusDisplay = function () {
    var frame,
		padding = 5,
		myself = this,
		elements = [],
		beetle = this.currentSprite.beetle,
		stage = this.stage;

    if (this.statusDisplay) {
        this.statusDisplay.destroy();
    }

    this.statusDisplay = new Morph();
    this.statusDisplay.color = this.groupColor;
    this.add(this.statusDisplay);

    frame = new ScrollFrameMorph(null, null, this.sliderColor);
    frame.acceptsDrops = false;
    frame.contents.acceptsDrops = false;

    frame.alpha = 0;

    this.statusDisplay.frame = frame;
    this.statusDisplay.add(frame);

    this.statusDisplay.fixLayout = function () {
        this.setLeft(myself.stage.left());
        this.setTop(myself.stage.bottom() + padding);
		this.setWidth(myself.stage.width());
		this.setHeight(myself.height() - myself.stage.height() - myself.controlBar.height() - padding);
		this.frame.setExtent(this.extent());
        this.arrangeContents()
        this.refresh();
    };

    this.statusDisplay.arrangeContents = function () {
        var x = this.left() + padding,
            y = this.top() + padding,
            max = this.right() - padding,
            start = x,
			middle = (max - start) / 2 + start;

        this.frame.contents.children.forEach(function (element) {
			element.setPosition(new Point(x, y));
			x += element.width();

			if (element.newLines) {
				y += 14 * element.newLines;
				x = start;
			};

			if (element.newColumn) {
				x = middle;
			};
        });

        this.frame.contents.adjustBounds();
    };

    this.statusDisplay.addElement = function (element) {

		if (typeof element == 'string') {
			element = new StringMorph(element, 12, null, true);
		};

		this.frame.contents.add(element);
        this.fixLayout();
    };

    this.statusDisplay.refresh = function () {
        this.frame.contents.children.forEach(function (element) {
            if (element.hasOwnProperty('update')) {
				element.update();
		   		element.changed();
		   		element.drawNew();
		   		element.changed();
			};
        });
    };

    this.statusDisplay.acceptsDrops = function () {
        return false;
    };

	this.statusDisplay.watchers = function (leftPos) {
	/*
	    answer an array of all currently visible watchers.
	    If leftPos is specified, filter the list for all
	    shown or hidden watchers whose left side equals
	    the given border (for automatic positioning)
	*/
		return this.children.filter(function (morph) {
			if (morph instanceof WatcherMorph) {
				if (leftPos) {
					return morph.left() === leftPos;
				}
				return morph.isVisible;
			}
			return false;
		});
	};

	this.statusDisplay.step = function() {
		// update watchers
    	current = Date.now();
    	elapsed = current - this.lastWatcherUpdate;
    	leftover = (1000 / this.watcherUpdateFrequency) - elapsed;
    	if (leftover < 1) {
    	    this.watchers().forEach(function (w) {
    	        w.update();
    	    });
    	this.lastWatcherUpdate = Date.now();
    	}
	}

	this.statusDisplay.lastWatcherUpdate = Date.now();
	this.statusDisplay.watcherUpdateFrequency = 250;

	// Buttons
	
	var toggleBeetleButton = new PushButtonMorph(
		null,
		function () {
			beetle.toggleVisibility();
			toggleBeetleButton.labelString = (beetle.shape.visible ? 'Hide' : 'Show') + ' beetle';
			toggleBeetleButton.drawNew();
		},
		'Hide beetle'
	);
	elements.push(toggleBeetleButton);

	var toggleAxesButton = new PushButtonMorph(
		null,
		function () {
			stage.renderer.toggleAxes();
			toggleAxesButton.labelString = (stage.renderer.showingAxes ? 'Hide' : 'Show') + ' axes';
			toggleAxesButton.drawNew();
		},
		'Hide axes');
	elements.push(toggleAxesButton);

	var toggleWireframeButton = new PushButtonMorph(
		null,
		function () {
			stage.renderer.toggleWireframe();
			toggleWireframeButton.labelString = (stage.renderer.isWireframeMode ? 'Shaded' : 'Wireframe') + ' mode';
			toggleWireframeButton.drawNew();
		},
		'Wireframe mode');
	elements.push(toggleWireframeButton);

	var toggleParallelProjectionButton = new PushButtonMorph(
		null,
		function () {
			stage.renderer.toggleParallelProjection();
			toggleParallelProjectionButton.labelString = (stage.renderer.isParallelProjection ? 'Perspective' : 'Parallel') + ' projection';
			toggleParallelProjectionButton.drawNew();
		},
		'  Parallel projection  ');
	elements.push(toggleParallelProjectionButton);

	var toggleGridButton = new PushButtonMorph(
		null,
		function () {
			stage.scene.grid.toggle();
			toggleGridButton.labelString = (stage.scene.grid.visible ? 'Hide' : 'Show') + ' grid';
			toggleGridButton.drawNew();
		},
		'Show grid');
	toggleGridButton.newLines = 3;
	elements.push(toggleGridButton);

	// It should be done like this, so it also updates if we toggle visibility from somewhere else...
	// For some reason this doesn't work

	/*
	element.update = function() {
		this.labelString = (beetle.shape.visible ? 'Hide' : 'Show') + ' beetle';
	};
	*/

	// Status watchers

	elements.push('Position: ');
	element = new StringMorph();
	element.update = function() {
		this.text = beetle.position.z.toFixed(2).toString().replace('.00','') + ', ' 
					+ beetle.position.x.toFixed(2).toString().replace('.00','') + ', ' 
					+ beetle.position.y.toFixed(2).toString().replace('.00','')
	};
	element.newColumn = true;
	elements.push(element);

	elements.push('Color: ');
	element = new Morph();
	element.update = function() {
		this.setColor(new Color(beetle.color.r * 255, beetle.color.g * 255, beetle.color.b * 255));
	}
	element.setWidth(30);
	element.setHeight(12);
	element.newLines = 1.5;
	elements.push(element);

	elements.push('Rotation: ');
	element = new StringMorph();
	element.update = function() {
		this.text = degrees(beetle.rotation.z * -1).toFixed(2).toString().replace('.00','') + ', ' 
					+ degrees(beetle.rotation.x * -1).toFixed(2).toString().replace('.00','') + ', ' 
					+ degrees(beetle.rotation.y).toFixed(2).toString().replace('.00','')
	};
	element.newColumn = true;
	elements.push(element);

	elements.push('HSL: ');
	element = new StringMorph();
	element.update = function() {
		this.text = beetle.color.state.h.toFixed(2).toString().replace('.00','') + ', ' 
					+ beetle.color.state.s.toFixed(2).toString().replace('.00','') + ', ' 
					+ beetle.color.state.l.toFixed(2).toString().replace('.00','')
   	};
	element.newLines = 1.5;
	elements.push(element);

	elements.push('Scale: ');
	element = new StringMorph();
	element.update = function() {
		this.text = beetle.multiplierScale.toString() 
					+ ' (' + (beetle.multiplierScale * 100).toString() + '%)'
	}
	element.newColumn = true;
	elements.push(element);

	elements.push('Opacity: ');
	element = new StringMorph();
	element.update = function() {
		this.text = (beetle.shape.material.opacity * 100).toFixed(2).toString().replace('.00','') + '%'
	}
	element.newLines = 1.5;
	elements.push(element);
	
	// Add all contents

	elements.forEach(function(each) { myself.statusDisplay.addElement(each) });
};

IDE_Morph.prototype.selectSprite = function (sprite) {
    this.currentSprite = sprite;
    this.createPalette();
    this.createSpriteEditor();
    this.fixLayout('selectSprite');
    this.currentSprite.scripts.fixMultiArgs();
};

IDE_Morph.prototype.toggleAppMode = function (appMode) {
    var world = this.world(),
        elements = [
            this.logo,
            this.controlBar.cameraButton,
            this.controlBar.cloudButton,
            this.controlBar.projectButton,
            this.controlBar.settingsButton,
            this.controlBar.stageSizeButton,
            this.spriteEditor,
            this.palette,
			this.statusDisplay,
            this.categories
        ];

    this.isAppMode = isNil(appMode) ? !this.isAppMode : appMode;

    Morph.prototype.trackChanges = false;
    if (this.isAppMode) {
        this.setColor(this.appModeColor);
        this.controlBar.setColor(this.color);
        this.controlBar.appModeButton.refresh();
        elements.forEach(function (e) {
            e.hide();
        });
        world.children.forEach(function (morph) {
            if (morph instanceof DialogBoxMorph) {
                morph.hide();
            }
        });
    } else {
        this.setColor(this.backgroundColor);
        this.controlBar.setColor(this.frameColor);
        elements.forEach(function (e) {
            e.show();
        });
        this.stage.setScale(1);
        // show all hidden dialogs
        world.children.forEach(function (morph) {
            if (morph instanceof DialogBoxMorph) {
                morph.show();
            }
        });
        // prevent scrollbars from showing when morph appears
        world.allChildren().filter(function (c) {
            return c instanceof ScrollFrameMorph;
        }).forEach(function (s) {
            s.adjustScrollBars();
        });
    }
    this.setExtent(this.world().extent()); // resume trackChanges
};

// Addressing #54: Stage occasionally goes blank
IDE_Morph.prototype.originalRefreshPalette = IDE_Morph.prototype.refreshPalette;
IDE_Morph.prototype.refreshPalette = function (shouldIgnorePosition) {
	this.originalRefreshPalette(shouldIgnorePosition);
	this.stage.reRender();
};

