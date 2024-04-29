
var _3DModelDef =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	File:
	{
		field_0 : 'int32',

		field_4 : 'int32',
		field_8 : 'int32',
		field_C : 'int32',
		field_10 : 'int32',

		unk: ['array', 'uint8', 28],

		mipTexid : 'uint16',
		texid : 'uint16',
		numVerts : 'uint16',

		unk2: ['array', 'uint8', 2],

		aGeo: ['array', 'uint32', 4],
		unk_3: ['array', 'uint32', 4],
		field_58 : 'int32',
		unk_4: ['array', 'uint32', 4],
		field_6C : 'int32',

	}
};

var _3DOBJECTS =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	_3DObject:
	{
		id : 'int32',
		model : 'uint32',
		tex1 : 'uint32',
		tex2 : 'uint32',
	},

	File:
	{
		obj: ['array', '_3DObject', 401],
	}
};

var _3DOBJECTSPLACES =
{
	numObject : 'int16',
	pad : 'int16',
	objArray : 'uint32',
};

var _3DOBJECTSPLACE =
{
	unk : 'int32',
	x : 'uint16',
	y : 'uint16',
	id : 'uint16',
	dir : 'uint16',
	z : 'uint16',
	_pad : 'uint16',
};

var PAL16_256 =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	File:
	{
		pal: ['array', 'uint16', 256],
	}
};

var TEXTURES =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	File:
	{
		tex: ['array', 'uint32', 128],
	}
};

var TEXTURES2 =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	tEntry:
	{
		tbl: ['array', 'uint32', 6],
	},

	File:
	{
		tex: ['array', 'tEntry', 115],
	}
};

var TEXTURE =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	File:
	{
		data: ['array', 'uint8', 4096],
	}
};

var TEXTURE2 =
{
	'jBinary.all': 'File',
	'jBinary.littleEndian': true,

	File:
	{
		data: ['array', 'uint8', 16384],
	}
};

var Vector3D =
{
	x : 'int16',
	y : 'int16',
	z : 'int16',
};

var UV =
{
	u : 'int8',
	v : 'int8',
};

var GAMEVERTHEADER =
{
	size : 'uint8',
	field_1 : 'uint8',
	fillcolor : 'uint8',
	flag : 'uint8',
};

var GAMEVERT =
{
	h : GAMEVERTHEADER,

	v: ['if', context => context.h.size == 0x24, ['array', Vector3D, 4], ['array', Vector3D, 3]],

	t: ['if', context => context.h.size == 0x24, ['array', UV, 4], ['if', context => context.h.size == 0x1C, ['array', UV, 3]]],

	_pad: ['if', context => context.h.size == 0x18, ['array', 'uint8', 2]],
};

function CLUT4BitTo8Bit(pixel)
{
	return pixel | 16 * pixel;
}

function CLUT5BitTo8Bit(pixel)
{
	return 8 * pixel | (pixel >> 2);
}

function PAL256ToRGBA(pixel)
{

	var b = CLUT5BitTo8Bit(pixel & 0x1f);
	var g = CLUT5BitTo8Bit((pixel >> 5) & 0x1f);
	var r = CLUT5BitTo8Bit((pixel >> 10) & 0x1f);

	return r << 24 | g << 16 | b << 8 | 0xFF;
}

function PAL256ToRGB(pixel)
{

	var r = CLUT5BitTo8Bit(pixel & 0x1f);
	var g = CLUT5BitTo8Bit((pixel >> 5) & 0x1f);
	var b = CLUT5BitTo8Bit((pixel >> 10) & 0x1f);

	return r << 16 | g << 8 | b;
}

function toHex(number)
{
	if (number < 0)
		number = 0xFFFFFFFF + number + 1;

	return number.toString(16).toUpperCase();
}

function str2ab(str)
{
	var buf = new ArrayBuffer(str.length);
	var bufView = new Uint8Array(buf);
	for (var i=0, strLen=str.length; i < strLen; i++)
	{
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

function ROMADDR(a)
{
	return a - 0x08000000;
}

function ROMREAD(offset, arr, template)
{
	var b = arr.subarray( ROMADDR(offset), arr.length);
	var reader = new jBinary(b, template);
	var data = reader.readAll();
	return data;
}

function ROMREADARRAY(offset, arr, template, num)
{
	var _jbarr =
	{
		'jBinary.all': 'File',
		'jBinary.littleEndian': true,

		File:
		{
			arr: ['array', template, num],
		}
	};


	var b = arr.subarray( ROMADDR(offset), arr.length);
	var reader = new jBinary(b, _jbarr);
	var data = reader.readAll();
	return data.arr;
}

function ROMREADUINT32(offset, arr)
{
	var _jbui32 =
	{
		'jBinary.all': 'File',
		'jBinary.littleEndian': true,

		File:
		{
			v : 'uint32',
		}
	};

	var b = arr.subarray( ROMADDR(offset), arr.length);
	var reader = new jBinary(b, _jbui32);
	var data = reader.readAll();
	return data.v;
}

function RAWREADSTRING(offset, arr, stringLength)
{
	var _jbustr =
	{
		'jBinary.all': 'File',
		'jBinary.littleEndian': true,

		File:
		{
			s: ['string', stringLength],
		}
	};

	var b = arr.subarray(offset, arr.length);
	var reader = new jBinary(b, _jbustr);
	var data = reader.readAll();
	return data.s;
}

dat.GUI.prototype.removeFolder = function(name)
{
	var folder = this.__folders[name];
	if (!folder)
		return;

	folder.close();
	this.__ul.removeChild(folder.domElement.parentNode);
	delete this.__folders[name];
	this.onResize();
}

var MapViewer = function()
{
	this.init();
	this.animate();
};

MapViewer.prototype.init = function()
{
	this.clock = new THREE.Clock();

	this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
	this.renderer.setPixelRatio( window.devicePixelRatio );
	if ( gModelViewer )
		this.renderer.setClearColor( 0x00000000, 1.0 );
	else
		this.renderer.setClearColor( 0x0054B6F8, 1.0 );
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	this.renderer.outputEncoding = THREE.sRGBEncoding;

	this.container = document.createElement( 'div' );
	document.body.appendChild( this.container );

	this.container.appendChild( this.renderer.domElement );

	if ( gModelViewer )
	{
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .01, 1000)
		//this.camera.position.set( 0.50, 2.30, -6.55 );
		this.camera.position.set( -27.8,25.8, 7.25 );
	}
	else
	{
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .01, 5000);

		this.camera.position.set( -3036.527320713698, 125.33512518011082, 478.49821668346215 );
		//this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .01, 2500)
	}

	this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
	this.controls.enableDamping = true
	this.controls.dampingFactor = 0.2
	this.controls.zoomSpeed = 1.4
	this.controls.rotateSpeed = 0.6
	this.controls.enableKeys = false

	this.scene = new THREE.Scene();
	this.grid = new THREE.GridHelper( 100, 100, 0xffffff, 0x555555 );
	if ( gModelViewer )
		this.scene.add( this.grid );

	this.rom = null;
	this.palette = null;
	this.Textures = null;
	this.Textures2 = null;
	this._3DObjects = null;
	this._3DObjectPlaces = null;
	this.ConvCoord1 = null;
	this.ConvCoord2 = null;

	this.TxSrc = null;
	this.Sector = null;
	this.SpriteID = null;
	this.WORLD_X_SHIFT = 0;

	this.WorldSizeX = 0;
	this.WorldSizeY = 0;
	this.CoordMul = 0;

	this.DefaultMaterial = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: 0x00FF00 });

	this.stats = new Stats();
	this.container.appendChild( this.stats.dom );

	this.gui = new dat.GUI();

	if ( gModelViewer )
	{
		this.ObjConfig = {  };

		this.gui2 = new dat.GUI();

		this.gridConfig = { Grid: true, };

		this.gui2.add( this.gridConfig, 'Grid', true ).onChange( function ()
		{
			if (window.viewer.gridConfig.Grid)
				window.viewer.scene.add( window.viewer.grid );
			else
				window.viewer.scene.remove( window.viewer.grid );
		} );
	}

	this.viewerConfig = { Island: '1', ExportObj: this.expObj, ExportGLTF : this.expGLTF, };
	this.menuFunc = {  };

	this.gui.add( this.viewerConfig, 'ExportObj' )
	this.gui.add( this.viewerConfig, 'ExportGLTF' )

	window.addEventListener('resize', this.resize, false)
};


MapViewer.prototype.expGLTF = function()
{
	var exporter = new THREE.GLTFExporter();

		exporter.parse( window.viewer.scene, function ( result ) {
			var buff = str2ab(JSON.stringify( result, null, 2 ));
			var blob = new Blob([buff]);

			saveAs(blob, 'export.gltf');
		} );
}
MapViewer.prototype.expObj = function()
{
	var exporter = new THREE.OBJExporter();
	var buff = str2ab(exporter.parse(window.viewer.scene));
	var blob = new Blob([buff]);

	saveAs(blob, 'export.obj');
}

MapViewer.prototype.setupMapGUI = function()
{
	this.SetIsland(0);

	this.gui.add( this.viewerConfig, 'Island', [ '1', '2', '3' ] ).onChange( function ()
	{
		if ( window.viewer.viewerConfig.Island == '1' )
			window.viewer.SetIsland(0);
		else if ( window.viewer.viewerConfig.Island == '2' )
			window.viewer.SetIsland(1);
		if ( window.viewer.viewerConfig.Island == '3' )
			window.viewer.SetIsland(2);
	} );


	var loadMap = function ( )
	{
		return function ()
		{
			window.viewer.scene.remove.apply(window.viewer.scene, window.viewer.scene.children);

			window.viewer.CreateWorld();
			window.viewer.CreateObjects();
		};
	};

	this.menuFunc[ 'Load Island Map' ] = loadMap();
	this.gui.add( this.menuFunc, 'Load Island Map' );
}

MapViewer.prototype.setupModelsGUI = function()
{
	this.SetIsland(0);

	this.gui.add( this.viewerConfig, 'Island', [ '1', '2', '3' ] ).onChange( function ()
	{
		if ( window.viewer.viewerConfig.Island == '1' )
			window.viewer.SetIsland(0);
		else if ( window.viewer.viewerConfig.Island == '2' )
			window.viewer.SetIsland(1);
		if ( window.viewer.viewerConfig.Island == '3' )
			window.viewer.SetIsland(2);
	} );


	var folder1 = this.gui.addFolder( "Objects" );

	var generateCallback = function ( index )
	{
		return function ()
		{
			window.viewer.scene.remove.apply(window.viewer.scene, window.viewer.scene.children);
			if (window.viewer.gridConfig.Grid)
				window.viewer.scene.add( window.viewer.grid );

			var model = ROMREAD(window.viewer._3DObjects.obj[index].model, window.viewer.rom, _3DModelDef);

			window.viewer.PutObject(model, new THREE.Vector3(0, 0, 0), window.viewer._3DObjects.obj[index].tex1, window.viewer._3DObjects.obj[index].tex2);
		};
	};

	for ( var i = 0; i < 401; i ++ )
	{
		var name = 'Object ' + i;

		this.ObjConfig[ name ] = generateCallback( i );
		folder1.add( this.ObjConfig, name ).name( name );
	}

	folder1.open();

	generateCallback(390)();
}

MapViewer.prototype.animate = function()
{
	requestAnimationFrame(this.animate.bind(this));
	this.render();
	this.stats.update();
};

MapViewer.prototype.render = function()
{
	var delta = this.clock.getDelta();
	this.renderer.render(this.scene, this.camera);
};

MapViewer.resize = function()
{
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();

	this.renderer.setSize( window.innerWidth, window.innerHeight );
}

MapViewer.prototype.SetIsland = function(island)
{
	this.CoordMul = 5 * 8;

	if ( island == 0 )
	{
		this.WorldSizeX = 256;
		this.WorldSizeY = 256;
		this.WORLD_X_SHIFT = 8;

		this._3DObjects = ROMREAD(0x8EBF7F4, this.rom, _3DOBJECTS);
		this._3DObjectPlaces = ROMREADARRAY(0x88DC098, this.rom, _3DOBJECTSPLACES, 256);
		this.Sector = ROMREADARRAY(0x88B3558, this.rom, 'uint16', 256*256);
		this.SpriteID = ROMREADARRAY(0x886E1EC, this.rom, 'uint16', 5*5*5670);
		this.TxSrc = ROMREADARRAY(0x8853C2C, this.rom, 'uint8', 1687*64);
	}
	else if ( island == 1 )
	{
		this.WorldSizeX = 128;
		this.WorldSizeY = 256;
		this.WORLD_X_SHIFT = 7;
		this._3DObjects = ROMREAD(0x8EC1104, this.rom, _3DOBJECTS);
		this._3DObjectPlaces = ROMREADARRAY(0x89AE9D0, this.rom, _3DOBJECTSPLACES, 128);
		this.Sector = ROMREADARRAY(0x89966B0, this.rom, 'uint16', 128*256);
		this.SpriteID = ROMREADARRAY(0x893A7FC, this.rom, 'uint16', 5*5*7530);
		this.TxSrc = ROMREADARRAY(0x891E17C, this.rom, 'uint8', 1818*64);
	}
	else if ( island == 2 )
	{
		this.WorldSizeX = 128;
		this.WorldSizeY = 256;
		this.WORLD_X_SHIFT = 7;
		this._3DObjects = ROMREAD(0x8EC2A14, this.rom, _3DOBJECTS);
		this._3DObjectPlaces = ROMREADARRAY(0x8A5B248, this.rom, _3DOBJECTSPLACES, 128);
		this.Sector = ROMREADARRAY(0x8A461E6, this.rom, 'uint16', 128*256);
		this.SpriteID = ROMREADARRAY(0x89E7740, this.rom, 'uint16', 5*5*7755);
		this.TxSrc = ROMREADARRAY(0x89D0640, this.rom, 'uint8', 1476*64);
	}
}

MapViewer.prototype.GetWorldTexture = function(tex)
{
	var texture = new THREE.Texture();

	var X1 = 0;
	var X2 = (this.WorldSizeX*5)-1;
	var Y1 = 0;
	var Y2 = (this.WorldSizeY*5)-1;
	var TexW = this.WorldSizeX*5*8;
	var TexH = this.WorldSizeY*5*8;

	{
		var useOffscreen = typeof OffscreenCanvas !== 'undefined';

		var canvas = useOffscreen ? new OffscreenCanvas( TexW, TexH ) : document.createElement( 'canvas' );
		canvas.width = TexW;
		canvas.height = TexH;

		var context = canvas.getContext( '2d' );
		var imageData = context.createImageData( TexW, TexH );

		{

			for ( var x = X1; x < X2; x++ )
			{
				for ( var y = Y1; y < Y2; y++ )
				{
					var id = this.SpriteID[25 * this.Sector[this.ConvCoord2[x] + (this.ConvCoord2[y] << this.WORLD_X_SHIFT)]
                                             + 5 * this.ConvCoord1[y]
                                             + this.ConvCoord1[x]];

					var _x = x;
					var _y = y;

					var n = 0;

					for ( var scry = _y*8; scry < _y*8+8; scry++ )
					{
						for ( var scrx = _x*8; scrx < _x*8+8; scrx++ )
						{
							var index = tex[id*64+(n++)];
							var pixel = this.palette.pal[index];

							var r = CLUT5BitTo8Bit(pixel & 0x1f);
							var g = CLUT5BitTo8Bit((pixel >> 5) & 0x1f);
							var b = CLUT5BitTo8Bit((pixel >> 10) & 0x1f);

							imageData.data[ (TexW*scry+scrx)*4 + 0 ] = r;
							imageData.data[ (TexW*scry+scrx)*4 + 1 ] = g;
							imageData.data[ (TexW*scry+scrx)*4 + 2 ] = b;
							imageData.data[ (TexW*scry+scrx)*4 + 3 ] = 255;
						}
					}
				}
			}
		}

		context.putImageData( imageData, 0, 0 );
		texture.image = useOffscreen ? canvas.transferToImageBitmap() : canvas;
	}

	texture.needsUpdate = true;

	return texture;
}

MapViewer.prototype.CreateWorld = function()
{
	var tx = this.GetWorldTexture(this.TxSrc);
	tx.flipY = false;
	tx.minFilter = THREE.LinearFilter;

	const geometry = new THREE.PlaneGeometry( this.WorldSizeX*this.CoordMul, this.WorldSizeY*this.CoordMul);
	const material = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide, map: tx} );
	const plane = new THREE.Mesh( geometry, material );

	plane.position.x = 0;
	plane.position.y = 0;
	plane.position.z = -0.5;

	plane.rotateX(Math.PI / 2)

	this.scene.add( plane );
}

MapViewer.prototype.CreateObjects = function()
{
	var v_0x88513F4 = ROMREADARRAY(0x88513F4, this.rom, 'uint32', 192);
	var v_0x88516F4 = ROMREADARRAY(0x88516F4, this.rom, 'uint32', 990);
	var v_0x8EC76B4 = ROMREADARRAY(0x8EC76B4, this.rom, 'uint16', 3);

	var island = 0;
	if ( this.viewerConfig.Island == '1' )
		island = 0;
	if ( this.viewerConfig.Island == '2' )
		island = 1;
	if ( this.viewerConfig.Island == '3' )
		island = 2;


	for ( var n = 0; n < 256; n++ )
	{
		if ( this._3DObjectPlaces[n].numObject != 0 )
		{
			var data = ROMREADARRAY(this._3DObjectPlaces[n].objArray, this.rom, _3DOBJECTSPLACE, this._3DObjectPlaces[n].numObject);

			for ( var i = 0; i < data.length; i++ )
			{
				var id = data[i].id;

				var bIgnoreDirTex = true;
				if ( id >= 128 )
				{
					id = id - 128;

					if ( (v_0x88516F4[330 * island + id] & 0x100000) != 0 )
						bIgnoreDirTex = false;
				}
				else if ( id >= 64 )
				{
					id = id + 266;

					if ( (v_0x88513F4[ 64 * island + id - (266 + 64)] & 0x100000) != 0)
						bIgnoreDirTex = false;
				}

				var model = ROMREAD(this._3DObjects.obj[id].model, this.rom, _3DModelDef);

				var H = (model.field_C - model.field_0) >> 1;
                var W = (model.field_10 - model.field_4) >> 1;

				var x = data[i].x;
				var y = data[i].y;
				var z = data[i].z;

				var dir = (data[i].dir - 1) & 3;

				if ( ((data[i].dir - 1) & 1) != 0 )
				{
					x = (x + W) ;//<< 16;
					y = (y + H) ;//<< 16;
				}
				else
				{
					x = (x + H) ;//<< 16;
					y = (y + W) ;//<< 16;
				}

				//z = -0x10000 * z;

				x = x / (64.0);
				y = y / (64.0);
				//z = z / (64.0);
				if ( z != 0 )
					z = -0.5 * z;

				this.PutObject(model, new THREE.Vector3(x, y, z), this._3DObjects.obj[id].tex1, this._3DObjects.obj[id].tex2, dir, bIgnoreDirTex);
			}
		}
	}
}

MapViewer.prototype.PutObject = function(model, pos, tex1=0, tex2 = 0, dir = 0, bIgnoreDirTex = true)
{
	var verts = ROMREADARRAY(model.aGeo[dir], this.rom, GAMEVERT, model.numVerts);
	this.CreateObject(pos, dir, bIgnoreDirTex, verts, model, tex1, tex2);
}

MapViewer.prototype.GetTexture = function(tex, width, height)
{
	var texture = new THREE.Texture();

	{
		var useOffscreen = typeof OffscreenCanvas !== 'undefined';

		var canvas = useOffscreen ? new OffscreenCanvas( width, height ) : document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		var context = canvas.getContext( '2d' );
		var imageData = context.createImageData( width, height );

		{
			var i = 0;

			for ( var y = height-1; y >= 0; y-- )
			{
				for ( var x = 0; x < width; x++, i += 4 )
				{
					var index = tex.data[y*width+x];

					var pixel = this.palette.pal[index];

					var r = CLUT5BitTo8Bit(pixel & 0x1f);
					var g = CLUT5BitTo8Bit((pixel >> 5) & 0x1f);
					var b = CLUT5BitTo8Bit((pixel >> 10) & 0x1f);

					imageData.data[ i + 0 ] = r;
					imageData.data[ i + 1 ] = g;
					imageData.data[ i + 2 ] = b;
					if ( r == 255 && g == 0 && b == 255 )
						imageData.data[ i + 3 ] = 0;
					else
						imageData.data[ i + 3 ] = 255;
				}
			}
		}

		context.putImageData( imageData, 0, 0 );
		texture.image = useOffscreen ? canvas.transferToImageBitmap() : canvas;
	}

	texture.needsUpdate = true;

	return texture;
}

MapViewer.prototype.CreateMesh = function(pos, dir, verts, flag, material, coloring=false, bIgnoreDirTex = false)
{
	var geo = new THREE.Geometry();

	var numVert = 0;
	for ( var i = 0; i < verts.length; i++ )
	{
		var e = verts[i];

		var uvmapsize = 0.0;

		if ( flag == 0 )
		{
			if ( e.h.flag != 20 )
				continue;
		}
		else if ( flag == 1 )
		{
			if (  e.h.flag != 28 && e.h.flag != 19 )
				continue;
		}
		else if ( flag == 2 )
		{
			if ( e.h.flag != 3 )
				continue;
		}
		else if ( flag == 3 || flag == 4 )
		{
			if ( e.h.flag != 20 )
				continue;

			if ( flag == 3 && (dir & 1) != 0 )
				continue;

			if ( flag == 4 && (dir & 1) == 0 )
				continue;
		}

		if ( e.h.flag == 20 )
			uvmapsize = 128.0;
		else if ( e.h.flag == 28 || e.h.flag == 19 )
			uvmapsize = 64.0;
		else if ( e.h.flag == 3 )
			uvmapsize = 0.0;

		if ( e.h.size == 0x18 || e.h.size == 0x1C || e.h.size == 0x24 )
		{
			var col = PAL256ToRGB(this.palette.pal[e.h.fillcolor]); // 0x00ff00

				geo.vertices.push(new THREE.Vector3(e.v[0].x, e.v[0].z, e.v[0].y));
				geo.vertices.push(new THREE.Vector3(e.v[1].x, e.v[1].z, e.v[1].y));
				geo.vertices.push(new THREE.Vector3(e.v[2].x, e.v[2].z, e.v[2].y));
			if ( e.h.size == 0x24 )
				geo.vertices.push(new THREE.Vector3(e.v[3].x, e.v[3].z, e.v[3].y));

			var fa = new THREE.Face3(numVert+0, numVert+1, numVert+2);
			if ( coloring )
				fa.vertexColors[0] = fa.vertexColors[1] = fa.vertexColors[2] = new THREE.Color(col);
			geo.faces.push(fa);

			if ( e.h.size == 0x24 )
			{
				var fb = new THREE.Face3(numVert+0, numVert+2, numVert+3);
				if ( coloring )
					fb.vertexColors[0] = fb.vertexColors[1] = fb.vertexColors[2] = new THREE.Color(col);
				geo.faces.push(fb);
			}

			if ( e.h.size != 0x18 )
			{
				var iu = false;
				var iv = false;

				var inv = function (v, b) {return b ? 1.0 - v: v;};

				var isTex0 = true;
				if ( e.h.flag == 20 )
				{
					if ( (dir & 1) != 0 )
						iv = true;
				}

				{
						var uva = new THREE.Vector2(inv(e.t[0].u/uvmapsize, iu), inv(e.t[0].v/uvmapsize, iv));
						var uvb = new THREE.Vector2(inv(e.t[1].u/uvmapsize, iu), inv(e.t[1].v/uvmapsize, iv));
						var uvc = new THREE.Vector2(inv(e.t[2].u/uvmapsize, iu), inv(e.t[2].v/uvmapsize, iv));

						geo.faceVertexUvs[0].push([ uva, uvb, uvc ] );

					if ( e.h.size == 0x24 )
					{
						var uvd = new THREE.Vector2(inv(e.t[3].u/uvmapsize, iu), inv(e.t[3].v/uvmapsize, iv));
						geo.faceVertexUvs[0].push([ uva, uvc, uvd ] );
					}
				}
			}
			else
			{
				var uv = new THREE.Vector2(0.0, 0.0);
				geo.faceVertexUvs[0].push([ uv, uv, uv ] );
			}


			if ( e.h.size == 0x24 )
				numVert += 4;
			else
				numVert += 3;
		}
	}

	var mesh = new THREE.Mesh(geo, material);
	if ( gModelViewer )
	{
		mesh.position.x = pos.x;
		mesh.position.y = pos.z;
		mesh.position.z = pos.y;
	}
	else
	{
		mesh.position.x = (pos.x * this.CoordMul) - (this.WorldSizeX * this.CoordMul / 2.0);
		mesh.position.y = (pos.z );
		mesh.position.z = (pos.y * this.CoordMul) - (this.WorldSizeY * this.CoordMul / 2.0);
	}

	mesh.rotateY( Math.PI );

	mesh.scale.set(-0.625,0.625,0.625);

	this.scene.add(mesh);
}

var MaterialsA = new Array(128);
var MaterialsB = new Array(115*2);

MapViewer.prototype.CreateObject = function(pos, dir, bIgnoreDirTex, verts, model, tex1, tex2)
{
	var materialnotex = new THREE.MeshBasicMaterial( {vertexColors: THREE.VertexColors, transparent: true} );
	materialnotex.side = THREE.DoubleSide;
	materialnotex.alphaTest = 0.5;
	materialnotex.transparent = true;

	var materialTex = this.DefaultMaterial;
	if ( tex1 != 0 )
	{
		var a = ROMREADUINT32(tex1, this.rom);

		var mp = this.GetTexture(ROMREAD(a, this.rom, TEXTURE), 64, 64);

		mp.wrapS = THREE.RepeatWrapping;
		mp.wrapT = THREE.RepeatWrapping;
		mp.encoding = THREE.sRGBEncoding;
		materialTex = new THREE.MeshBasicMaterial( { map: mp, side: THREE.DoubleSide, transparent: true } );
		materialTex.name = "mat_txu" + tex1;
	}
	else if (  model.texid != 0 && this.Textures.tex[model.texid] != 0)
	{
		if ( MaterialsA[model.texid] )
			materialTex = MaterialsA[model.texid];
		else
		{
			var mp = this.GetTexture(ROMREAD(this.Textures.tex[model.texid], this.rom, TEXTURE), 64, 64);

			mp.wrapS = THREE.RepeatWrapping;
			mp.wrapT = THREE.RepeatWrapping;
			mp.encoding = THREE.sRGBEncoding;
			materialTex = new THREE.MeshBasicMaterial( { map: mp, side: THREE.DoubleSide, transparent: true } );
			materialTex.name = "mat_tx" + model.texid;
			MaterialsA[model.texid] = materialTex;
		}
	}

	var dirtexid = 0;
	var materialTex2 = this.DefaultMaterial;
	var materialTex20 = this.DefaultMaterial;
	var materialTex21 = this.DefaultMaterial;

	{
		if ( tex2 != 0 )
		{
			{
				var a = ROMREADUINT32(tex2+0*4, this.rom);
				var mp = this.GetTexture(ROMREAD(a, this.rom, TEXTURE2), 128, 128);

				mp.wrapS = THREE.RepeatWrapping;
				mp.wrapT = THREE.RepeatWrapping;
				mp.encoding = THREE.sRGBEncoding;
				materialTex20 = new THREE.MeshBasicMaterial( { map: mp, side: THREE.DoubleSide, transparent: true } );
				materialTex20.name = "mat_txu21" + tex1;
			}

			{
				var a = ROMREADUINT32(tex2+1*4, this.rom);
				var mp = this.GetTexture(ROMREAD(a, this.rom, TEXTURE2), 128, 128);

				mp.wrapS = THREE.RepeatWrapping;
				mp.wrapT = THREE.RepeatWrapping;
				mp.encoding = THREE.sRGBEncoding;
				materialTex21 = new THREE.MeshBasicMaterial( { map: mp, side: THREE.DoubleSide, transparent: true } );
				materialTex21.name = "mat_txu22" + tex1;
			}
		}

		if ( tex2 == 0 && model.mipTexid != 0 && this.Textures2.tex[model.mipTexid].tbl[0] != 0)
		{
			if ( MaterialsB[model.mipTexid*2+0] )
				materialTex20 = MaterialsB[model.mipTexid*2+0];
			else
			{
				var mp = this.GetTexture(ROMREAD(this.Textures2.tex[model.mipTexid].tbl[0], this.rom, TEXTURE2), 128, 128);

				mp.wrapS = THREE.RepeatWrapping;
				mp.wrapT = THREE.RepeatWrapping;
				mp.encoding = THREE.sRGBEncoding;
				materialTex20 = new THREE.MeshBasicMaterial( { map: mp, side: THREE.DoubleSide, transparent: true } );
				materialTex20.name = "mat_tx20" + model.mipTexid;

				MaterialsB[model.mipTexid*2+0] = materialTex20;
			}
		}

		if ( tex2 == 0 && model.mipTexid != 0 && this.Textures2.tex[model.mipTexid].tbl[1] != 0)
		{
			if ( MaterialsB[model.mipTexid*2+1] )
				materialTex21 = MaterialsB[model.mipTexid*2+1];
			else
			{
				var mp = this.GetTexture(ROMREAD(this.Textures2.tex[model.mipTexid].tbl[1], this.rom, TEXTURE2), 128, 128);

				mp.wrapS = THREE.RepeatWrapping;
				mp.wrapT = THREE.RepeatWrapping;
				mp.encoding = THREE.sRGBEncoding;
				materialTex21 = new THREE.MeshBasicMaterial( { map: mp, side: THREE.DoubleSide, transparent: true } );
				materialTex21.name = "mat_tx21" + model.mipTexid;

				MaterialsB[model.mipTexid*2+1] = materialTex21;
			}
		}
	}

	//this.CreateMesh(pos, dir, verts, 0, materialTex2!=null ? materialTex2 : materialnotex, materialnotex!=null);

	this.CreateMesh(pos, dir, verts, 3, materialTex20, false, bIgnoreDirTex);
	this.CreateMesh(pos, dir, verts, 4, materialTex21, false, bIgnoreDirTex);

	this.CreateMesh(pos, dir, verts, 1, materialTex,  false);
	this.CreateMesh(pos, dir, verts, 2, materialnotex, true);
}

function globalInit(raw)
{
	var rom = new Uint8Array(raw);
	if ( rom )
	{
		var title    = RAWREADSTRING(0xA0, rom, 12);
		var gamecode = RAWREADSTRING(0xAC, rom, 4);

		if ( title && gamecode && title == 'GTA ADVANCE\0' && gamecode == 'BGTP'  )
			alert('Unsupported game version!');
		else if ( title && gamecode && title == 'GTA\0\0\0\0\0\0\0\0\0' && gamecode == 'BGTE' )
		{
			window.viewer = new MapViewer();
			window.viewer.rom = rom;
			window.viewer.palette = ROMREAD(0x08CABC98, window.viewer.rom, PAL16_256);
			window.viewer.Textures = ROMREAD(0x08EBF5F4, window.viewer.rom, TEXTURES);
			window.viewer.Textures2 = ROMREAD(0x08EBEB2C, window.viewer.rom, TEXTURES2);

			window.viewer.ConvCoord1 = ROMREADARRAY(0x8CA3C28, window.viewer.rom, 'uint8', 1280);
			window.viewer.ConvCoord2 = ROMREADARRAY(0x8CA3728, window.viewer.rom, 'uint8', 1280);


			if ( gModelViewer )
				window.viewer.setupModelsGUI();
			else
				window.viewer.setupMapGUI();
		}
		else
			alert('Unknown file');
	}
}


function main()
{
	jBinary.loadData('rom.gba', function (err, data)
	{
		globalInit(data);
	});
}

var gModelViewer = false;

function HandleFiles(filelist)
{
	var f = filelist[0];

	if ( !f ) return;

	{
		var reader=new FileReader();

		reader.onload=function(e)
		{
			var raw=e.target.result;

			globalInit(raw)
		}

		reader.readAsArrayBuffer(f);
	}
}