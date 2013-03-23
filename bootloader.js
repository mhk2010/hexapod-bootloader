$(document).ready(function() {

	var op_codes         = new Array();
	var upload_started   = 0;
	var uploaded_opcodes = 0;
	var total_opcodes    = 0;
	var example_blinker  = "0C9434000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E000C943E0011241FBECFEFD8E0DEBFCDBF0E9440000C9450000C94000080E284B990E285B1892785B92FEF33ED80E3215030408040E1F700C00000F3CFF894FFCF";

	function sendStop() {
		$.ajax({
			type: "GET",
			url: "/",
			data: { s : "1" } 
		});
	}

	function sendStart() {
		$.ajax({
			type: "GET",
			url: "/",
			data: { bootloader : "1" } 
		}).done(function(msg) {
			sendCode(op_codes[0]);
		});
	}

	function sendCode(code) {
		$.ajax({
			type: "GET",
			url: "/",
			data: { h : code } 
		}).done(function(msg) {
			uploaded_opcodes++;
			$("#progress").attr("value", uploaded_opcodes);
			if (uploaded_opcodes < total_opcodes) {
				sendCode(op_codes[uploaded_opcodes]);
			} else{
				$("#output").text("Baigta");
				$("#progress").css("opacity", "0");
				sendStop();
			}
		});
	}

	function checkCode(code) {
		var hex_code_allowed = "0123456789ABCDEF";
		var code_length = code.length;
		if(code_length < 32) return 1;
		for (i = 0; i < code_length; i++) {
			if (hex_code_allowed.search(code[i]) == -1) return 1;
		}
		return 0;
	}

	$("head").append("<link rel='stylesheet' href='http://hexapod-bootloader.googlecode.com/git/bootloader.css' type='text/css'/>");
	$("head").append("<title>HTTP Bootloader</title>");
	$("html").append("<body><div id='main'></div></body>");
	
	$("#main").append("<div id='output'>Iveskite sesioliktaini koda</div>");
	$("#main").append("<textarea spellcheck='false' id='input'></textarea>");
	$("#main").append("<div id='input_button'>Siusti koda</div>");
	$("#main").append("<div id='load_example'>Ikelti blinker koda</div>");
	$("#main").append("<div id='title'>HTTP Bootloader</div>");
	$("#main").append("<meter id='progress' value='0' min='0' max='10'></meter>");

	$("#input").keyup(function() {
		$("#input").val($("#input").val().toUpperCase());
	})

	$("#input").bind('DOMSubtreeModified', function() {
		var height = $("#input").css("height");
		height = parseInt(height.replace("px", "")) + 165;
		console.log(height);
		$("#main").css("height", height + "px");
	})

	$("#input_button").click(function() {
		var code = $("#input").val();
		var parsed_code = "";
		var i = 0;
		var j = 0;
		var parsed_code_len = 0;
		for (i = 0; i < code.length; i++) {
			if (j > 8) {
				parsed_code = parsed_code + code[i];
				parsed_code_len++;
				if (parsed_code_len == 32 || code[i] == '\n') {
					if (code[i] == '\n') {
						parsed_code = parsed_code.substring(0, parsed_code.length - 3);
						parsed_code_len -= 3;
						j = 0;
						continue;
					} else {
						parsed_code_len = 0;
					}
				}
			}
			j++;
		}

		parsed_code = parsed_code.substring(0, parsed_code.length - 2);

		if (checkCode(parsed_code) == 0) {

			var op_codes_len = Math.ceil(parsed_code.length / 32);
			var op_code = "";

			total_opcodes = op_codes_len;

			for (var i = parsed_code.length; i <= op_codes_len*32; i++) {
				parsed_code = parsed_code + "F";
			}

			for (var i = 0; i < op_codes_len; i++) {
				op_code = "";
				for (j = 0; j < 32; j++) {
					op_code = op_code + parsed_code[i*32 + j];
				}
				op_codes.push(op_code);
			}

			upload_started = 1;
			$("#progress").css("opacity", "1");
			$("#progress").attr("max", total_opcodes);
			$("#output").text("Ikelinejama...");
			// sendStart();
			sendCode(op_codes[0]);
		} else {
			$("#output").text("Blogas kodas");
		}
		$("#input").val("");
	});

	$("#load_example").click(function() {
		$("#input").val(example_blinker);
	});

});