const formUtils = {

	_namemask: /^[a-zа-яё-]+$/gi,
	fio : function (name) {
		if (name) {
			let words = name.replace(/(\s){2,}/g, ' ').trim().split(/\s/);
			if (words.length == 3) {
				return words.every( (v) => v.search(formUtils._namemask) == 0 );
			}
		}
		return false;
	},

	_emailmask : /^\w+([\.-]?\w+)*@((ya.ru)|(yandex.(ru|ua|by|kz|com)))$/,
	email: function (email) {
		if (email) {
			return email.search(formUtils._emailmask) == 0;
		}
		return false;
	},

	_phonemask : /^(\+7)(\(\d{3}\))\d{3}-\d{2}-\d{2}$/,
	phone: function (phone) {
		if (phone) {
			if (phone.search(formUtils._phonemask) == 0) {
				let sum = 0;
				let length = phone.length;
				for (let i = 0; i < length; i++) {
					let c = phone.charAt(i);
					if (c >= '0' && c <= '9') {
						sum += c - '0';
					}
				}
				return sum <= 30;
			}
		}
		return false;
	},

	request: function(method, action, fd, callback) {
		let xhr = new XMLHttpRequest();
		
		function loadend() {
			if (this.status == 200) {
				callback( JSON.parse( this.responseText ) );
			}
		}

		xhr.addEventListener('loadend', loadend, false);
		xhr.open(method || "get", action, true);
		xhr.send(fd);
	}

};

const MyForm = {

	_errorFields: [],

	validate: function() {
		return {
			errorFields: MyForm._errorFields,
			isValid: MyForm._isValid
		}
	},

	getData: function() {
		return {
			fio: document.querySelector('#myForm input[name="fio"]').value,
			email: document.querySelector('#myForm input[name="email"]').value,
			phone: document.querySelector('#myForm input[name="phone"]').value
		}
	},

	setData: function(obj) {
		document.querySelector('#myForm input[name="fio"]').value = obj.fio || '';
		document.querySelector('#myForm input[name="email"]').value = obj.email || '';
		document.querySelector('#myForm input[name="phone"]').value = obj.phone || '';
	},

	submit: function(e) {
		if (e) {
			e.preventDefault();
		}
		let d = MyForm.getData();

		// clear prev test results
		MyForm._errorFields.length = 0;
		MyForm._isValid = true;

		['fio', 'email', 'phone'].forEach((field) => {
			let test = formUtils[field];
			let value = d[field];
			let selector = '#myForm input[name="' + field + '"]';
			let el = document.querySelector(selector);
			if ( test(value) ) {
				el.classList.remove('error');
			}
			else {
				el.classList.add('error');
				MyForm._isValid = false;
				MyForm._errorFields.push(field);
			}
		});

		if (MyForm._isValid) {
			document.querySelector('#myForm button#submitButton').disabled = true;
			
			let form = document.querySelector('#myForm');
			let fd = new FormData(form);
			formUtils.request(form.method, form.action, fd, (result) => {
				let el = document.querySelector('#resultContainer');
				el.classList.remove('success', 'error', 'progress');
				el.innerText = '';

				if (result.status === "progress") {
					el.classList.add('progress');
					setTimeout(MyForm.submit, result.timeout);
				}
				else {
					if (result.status === "success") {
						el.innerText = 'Success';
						el.classList.add('success');
					}
					else if (result.status === "error") {
						el.innerText = result.reason;
						el.classList.add('error');
					}
					document.querySelector('#myForm button#submitButton').disabled = false;
				}
				
			});
		}

		return false;
	}
}
