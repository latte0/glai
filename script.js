
var c;

var N = 50
var DELTA = 0.4

var LERNING_LOOP = 1000

var NUM_INPUT = 2
var NUM_HIDDEN = 4
var NUM_OUTPUT = 1
var showgraph = true;


onload = function(){
	c = document.getElementById('canvas');
	c.width = 512;
	c.height = 512;


	var data = new Array();
  var result = new Array();
	for(var k = 0; k < 50 ;k++) result[k] = -Math.cos((k/50.0-0.5)*3.14);
	for(var k = 0; k < 50 ;k++) data[k] = (k/50.0 - 0.5) + 0.0;



	var gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	var eRange = document.getElementById('range');

	var v_sh = create_shader('ivs');
	var f_sh = create_shader('ifs');

	var nu_v_sh = create_shader('nuvs');
	var nu_f_sh = create_shader('nufs');

	var disp_v_sh = create_shader('dispvs');
	var disp_f_sh = create_shader('dispfs');

	var w_v_sh = create_shader('wvs');
	var w_f_sh = create_shader('wfs');

	var i_prg = create_program(v_sh, f_sh);
	var nu_prg = create_program(nu_v_sh, nu_f_sh);
	var disp_prg = create_program(disp_v_sh, disp_f_sh);
	var w_prg = create_program(w_v_sh, w_f_sh);



	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(i_prg, 'position');

	var attStride = new Array();
	attStride[0] = 3;

	var nuAttLocation = [gl.getAttribLocation(nu_prg, 'position'),
											gl.getAttribLocation(nu_prg, 'texcoord')];

	var nuAttStride = new Array()
	nuAttStride[0] = 3;
	nuAttStride[1] = 2;


	var dispAttLocation = new Array();
	dispAttLocation = [gl.getAttribLocation(disp_prg, 'position'),
											gl.getAttribLocation(disp_prg, 'texcoord')];

	var dispAttStride = new Array();
	dispAttStride[0] = 3;
	dispAttStride[1] = 2;

	var wAttLocation = new Array();
	wAttLocation = [gl.getAttribLocation(disp_prg, 'position'),
											gl.getAttribLocation(disp_prg, 'texcoord')];

	var wAttStride = new Array();
	wAttStride[0] = 3;
	wAttStride[1] = 2;



	var position = [
		-1.0,  1.0,  0.0,
		 1.0,  1.0,  0.0,
		-1.0, -1.0,  0.0,
		 1.0, -1.0,  0.0
	];

	var index = [
		0, 2, 1,
		3, 1, 2
	];

	var texCoord = [
		0.0, 1.0,
		1.0, 1.0,
		0.0, 0.0,
		1.0, 0.0
	];



	var vPosition = create_vbo(position);
	var vTexCoord = create_vbo(texCoord);
	var nuVBOList  = [vPosition,vTexCoord];
	var iVBOList = [vPosition];
	var dispVBOList = [vPosition,vTexCoord];
	var wVBOList = [vPosition,vTexCoord];
	var vIndex    = create_ibo(index);

	var nu_uniLocation = new Array();
	nu_uniLocation[0] = gl.getUniformLocation(nu_prg, 'data');
	nu_uniLocation[1] = gl.getUniformLocation(nu_prg, 'texture');
	nu_uniLocation[2] = gl.getUniformLocation(nu_prg, 'result');
	nu_uniLocation[3] = gl.getUniformLocation(nu_prg, 'inputL');
	nu_uniLocation[4] = gl.getUniformLocation(nu_prg, 'hiddenL');
	nu_uniLocation[5] = gl.getUniformLocation(nu_prg, 'outputL');
	nu_uniLocation[6] = gl.getUniformLocation(nu_prg, 'training');
	nu_uniLocation[7] = gl.getUniformLocation(nu_prg, 'delta');
	nu_uniLocation[8] = gl.getUniformLocation(nu_prg, 'afunc');

	var disp_uniLocation = new Array();
	disp_uniLocation[0] = gl.getUniformLocation(disp_prg, 'texture');
	disp_uniLocation[1] = gl.getUniformLocation(disp_prg, 'data');
	disp_uniLocation[2] = gl.getUniformLocation(disp_prg, 'result');
	disp_uniLocation[3] = gl.getUniformLocation(disp_prg, 'afunc');

	var w_uniLocation = new Array();
	w_uniLocation[0] = gl.getUniformLocation(disp_prg, 'texture');


	var count = 0;

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.enable(gl.CULL_FACE);



	var ext;
	ext = gl.getExtension('OES_texture_float');
	if(ext == null){
		alert('float texture not supported');
		return;
	}


	var fBufferWidth = new Array();
	var fBufferHeight = new Array();
	var fBuffer = new Array();

	fBufferWidth[0] = 512;
	fBufferHeight[0] = 512;
	fBuffer[0] = create_framebuffer(fBufferWidth[0], fBufferHeight[0]);

	fBufferWidth[1] = 512;
	fBufferHeight[1] = 512;
	fBuffer[1] = create_framebuffer(fBufferWidth[1], fBufferHeight[1]);


	(function(){
		count++;


		var afunction;

		var afuncList = document.getElementsByName("afunc");
				for(var i=0; i<afuncList.length; i++){
					if (afuncList[i].checked) {
						afunction = eval(afuncList[i].value);
						break;
					}
				}

				console.log(afunction);


		if(count == 1){
				gl.useProgram(i_prg);

				gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer[0].f);

				gl.clearColor(0.0, 0.2, 0.7, 1.0);
				gl.clearDepth(1.0);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				gl.viewport(0.0, 0.0, c.width, c.height);

				set_attribute(iVBOList, attLocation, attStride);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

				gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
		}


		gl.useProgram(nu_prg);

//		gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer.f);
		gl.bindFramebuffer(gl.FRAMEBUFFER,null);

		gl.clearColor(1.0, 1.0, 1.0, 1.0);
		gl.clearDepth(1.0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.viewport(0.0, 0.0, fBufferWidth[0], fBufferHeight[0]);

		set_attribute(nuVBOList, nuAttLocation, nuAttStride);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);

		gl.uniform1f(nu_uniLocation[0], data[count%50]);
		gl.uniform1i(nu_uniLocation[1], 0);
		gl.uniform1f(nu_uniLocation[2], result[count%50]);
		gl.uniform1i(nu_uniLocation[3], NUM_INPUT);
		gl.uniform1i(nu_uniLocation[4], NUM_HIDDEN);
		gl.uniform1i(nu_uniLocation[5], NUM_OUTPUT);
		gl.uniform1i(nu_uniLocation[6], N);
		gl.uniform1f(nu_uniLocation[7], DELTA);
		gl.uniform1i(nu_uniLocation[8], afunction);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, fBuffer[(count+1)%2].t);
	//		gl.bindTexture(gl.TEXTURE_2D, fBuffer[0].t);
			gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer[count%2].f);
			gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);


		gl.bindTexture(gl.TEXTURE_2D, null);

		showgraph = document.getElementById("cbox1").checked;;



//ここでディスプレイに表示する。


if(showgraph){
				gl.useProgram(disp_prg);

				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				gl.clearColor(1.0, 1.0, 1.0, 1.0);
				gl.clearDepth(1.0);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				gl.viewport(0.0, 0.0, fBufferWidth[0], fBufferHeight[0]);


				set_attribute(dispVBOList, dispAttLocation, dispAttStride);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);
				gl.uniform1i(disp_uniLocation[0], 0);
				gl.uniform1f(disp_uniLocation[1], data);
				gl.uniform1f(disp_uniLocation[2], result);
				gl.uniform1i(disp_uniLocation[3], afunction);

				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, fBuffer[(count)%2].t);

				gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);
				gl.bindTexture(gl.TEXTURE_2D, null);

}else{

				gl.useProgram(w_prg);

				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				gl.clearColor(1.0, 1.0, 1.0, 1.0);
				gl.clearDepth(1.0);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

				gl.viewport(0.0, 0.0, fBufferWidth[0], fBufferHeight[0]);



				set_attribute(wVBOList, wAttLocation, wAttStride);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vIndex);


				gl.uniform1i(nu_uniLocation[0], 0);


				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, fBuffer[(count)%2].t);

				gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);


				gl.bindTexture(gl.TEXTURE_2D, null);

}













		gl.flush();
		console.log(count);

		setTimeout(arguments.callee, 200 / 1);
	})();








function heviside(x){
	    return 0.5 * (np.sign(x) + 1)
}


function lerning_delta() {

}














	function create_shader(id){
		var shader;

		var scriptElement = document.getElementById(id);

		if(!scriptElement){return;}

		switch(scriptElement.type){

			case 'x-shader/x-vertex':
				shader = gl.createShader(gl.VERTEX_SHADER);
				break;

			case 'x-shader/x-fragment':
				shader = gl.createShader(gl.FRAGMENT_SHADER);
				break;
			default :
				return;
		}

		gl.shaderSource(shader, scriptElement.text);
		gl.compileShader(shader);
		if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			return shader;
		}else{

			alert(gl.getShaderInfoLog(shader));
		}
	}

	function create_program(vs, fs){
		var program = gl.createProgram();

		gl.attachShader(program, vs);
		gl.attachShader(program, fs);

		gl.linkProgram(program);

		if(gl.getProgramParameter(program, gl.LINK_STATUS)){

			gl.useProgram(program);

			return program;
		}else{

			alert(gl.getProgramInfoLog(program));
		}
	}

	function create_vbo(data){
		var vbo = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		return vbo;
	}

	function set_attribute(vbo, attL, attS){
		for(var i in vbo){
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

			gl.enableVertexAttribArray(attL[i]);

			gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
		}
	}

	function create_ibo(data){
		var ibo = gl.createBuffer();

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		return ibo;
	}


	function create_framebuffer(width, height){
		var frameBuffer = gl.createFramebuffer();

		gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

		var depthRenderBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);

		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

		var fTexture = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, fTexture);

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);

		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		return {f : frameBuffer, d : depthRenderBuffer, t : fTexture};
	}

};
