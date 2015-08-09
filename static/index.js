var socket = io.connect(),
    lastCode;

socket.on('code', function (data) {
    if(lastCode == data) return;
    var el = document.getElementById('qrcode');
    el.innerHTML = '';
    lastCode = data;
    new QRCode(el, {
    	text: data,
    	width: 240,
    	height: 240,
    	correctLevel : QRCode.CorrectLevel.L
    });
});

socket.on('success', function () {
    alert('p0wned');
});
