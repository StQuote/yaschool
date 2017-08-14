const formSelector = 'form#myForm';
const fioInputSelector = formSelector + ' input[name="fio"]';
const emailInputSelector = formSelector + ' input[name="email"]';
const phoneInputSelector = formSelector + ' input[name="phone"]';
const buttonSelector = formSelector + ' button#submitButton';
const resultContainerSelector = 'div#resultContainer';

describe('HTML markup', function() {
	before(function() {
		let dp = new DOMParser();
		document.body.innerHTML = dp.parseFromString(__html__['index.html'], 'text/html').body.innerHTML;
	});

	it('should contain \'resultContainer\' div', function() {
		expect(document.querySelector(resultContainerSelector)).to.exist;
	});

	describe('Form#myForm', function() {

		it('should contain form tag with \'myForm\' id', function() {
			expect(document.querySelector(formSelector)).to.exist;
		});

		it('should contain \'fio\' input', function() {
			expect(document.querySelector(fioInputSelector)).to.exist;
		});

		it('should contain \'email\' input', function() {
			expect(document.querySelector(emailInputSelector)).to.exist;
		});

		it('should contain \'phone\' input', function() {
			expect(document.querySelector(phoneInputSelector)).to.exist;
		});

		it('should contain \'submitButton\' button', function() {
			expect(document.querySelector(buttonSelector)).to.exist;
		});

	});

});

describe('MyForm', function() {
	const correctEmail = "user1@ya.ru";
	const correctPhone = "+7(111)111-22-33";
	const correctName = "   Дубинин    Витаутас     Богуславович    ";
	const incorrectEmail = "user1@gmail.com";
	const incorrectPhone = "+7(999)999-22-33";
	const incorrectName = "   @Дубинин    Витаутас     Богуславович    ";

	it('should be MyForm object in global scope', function () {
		expect(MyForm).to.exist;
	});
	
	it('#setData() should set form values', function() {
		MyForm.setData({
			fio: correctName,
			email:correctEmail,
			phone:correctPhone
		});
		
		expect(document.querySelector(fioInputSelector).value).to.equal(correctName);
		expect(document.querySelector(emailInputSelector).value).to.equal(correctEmail);
		expect(document.querySelector(phoneInputSelector).value).to.equal(correctPhone);
	});

	it('#getData() should return object with form data, where each field is input element name', function() {
		let data = MyForm.getData();

		expect(data.fio).to.exist;
		expect(data.email).to.exist;
		expect(data.phone).to.exist;

		expect(data.fio).to.equal(document.querySelector(fioInputSelector).value);
		expect(data.email).to.equal(document.querySelector(emailInputSelector).value);
		expect(data.phone).to.equal(document.querySelector(phoneInputSelector).value);
	});

	describe('Validation fail case', function() {

		beforeEach(function() {
			MyForm.setData({
				fio: incorrectName,
				email: incorrectEmail,
				phone: incorrectPhone
			});
		});

		it('#submit() should not make request', function() {
			let spy = sinon.spy(formUtils, 'request');
			MyForm.submit();
			expect(spy.callCount).to.equal(0);
			spy.restore();
		});

		it('#submit() should add \'error\' class to inputs', function() {
			MyForm.submit();
			expect(document.querySelector(fioInputSelector).classList.contains("error")).to.equal(true);
			expect(document.querySelector(emailInputSelector).classList.contains("error")).to.equal(true);
			expect(document.querySelector(phoneInputSelector).classList.contains("error")).to.equal(true);
		});

		it('#submit() should remove \'error\' class from inputs when data is correct', function() {

			document.querySelector(formSelector).action = '/base/success.json';
			MyForm.submit();

			MyForm.setData({
				fio: correctName,
				email: correctEmail,
				phone: correctPhone
			});

			MyForm.submit();
			
			expect(document.querySelector(fioInputSelector).classList.contains("error")).to.equal(false);
			expect(document.querySelector(emailInputSelector).classList.contains("error")).to.equal(false);
			expect(document.querySelector(phoneInputSelector).classList.contains("error")).to.equal(false);

		});

		it('#validate() should return object with input names and failed status of validation', function() {
			MyForm.submit();
			let v = MyForm.validate();
			expect(v).to.exist;
			expect(v).to.have.a.property('isValid').that.false;
			expect(v.errorFields).to.be.an('array').that.includes('fio', 'phone', 'email');
			expect(v.errorFields).to.have.lengthOf(3);
		});
	});

	describe('Validation success case', function() {
		const successMessage = { status:"success" };
		const errorMessage = { status:"error", reason:"Because I'm said" };

		beforeEach(function() {
			MyForm.setData({
				fio: correctName,
				email: correctEmail,
				phone: correctPhone
			});
			document.querySelector(formSelector).method = "get";
			document.querySelector(formSelector).action = "/base/success.json";
		});

		it('#submit() should make ajax request if data successfully validated', function() {
			let spy = sinon.stub(formUtils, 'request');
			spy.callsArgWith(3, successMessage);
			MyForm.submit();
			expect(spy.calledOnce).to.be.true;
			formUtils.request.restore();
		});

		it('#submit() should disable button if data successfully validated', function() {
			let xhr = sinon.useFakeXMLHttpRequest();
			let req;
			xhr.onCreate = function(r) {
				req = r;
			}
			let el = document.querySelector(buttonSelector);
			MyForm.submit();
			expect(el.disabled).to.be.true;
			req.respond(200, {'Content-Type':'application/json'}, JSON.stringify(successMessage));
			xhr.restore();
			xhr.onCreate = null;
		});
		
		it('\'submitButton\' should call MyForm#submit() method on user click', function(done) {
			let stub = sinon.stub(MyForm, 'submit').callsFake(function()  {
				stub.restore();
				done();
			});
			let evt = new MouseEvent('click', {bubbles:true,cancelable:true,view:window});
			document.querySelector(buttonSelector).dispatchEvent(evt);
		});

		describe('#result container', function() {
			let server, form;

			it('should have class \'success\' and text \'Success\' on success respond', function() {
				sinon.stub(formUtils, 'request').callsArgWith(3, successMessage);
				MyForm.submit();
				
				let el = document.querySelector(resultContainerSelector);
				expect(el.innerText).to.equal('Success');
				expect(el.classList.contains('success')).to.be.true;
				formUtils.request.restore();
			});
			
			it('on error response should have class \'error\' and text from reason respond field', function() {
				sinon.stub(formUtils, 'request').callsArgWith(3, errorMessage);
				MyForm.submit();
				
				let el = document.querySelector(resultContainerSelector);
				expect(el.innerText).to.equal(errorMessage.reason);
				expect(el.classList.contains('error')).to.be.true;
				formUtils.request.restore();
			});

			it('on progress respones should have class \'progress\' and request should be repeated with timeout', function(done) {
				let t = Date.now();
				let response = {
					status: 'progress',
					timeout: 1000
				};
				let stub = sinon.stub(formUtils, 'request');
				let el = document.querySelector(resultContainerSelector);
				stub.callsFake(function(uri, method, fd, cb) {
					if (stub.callCount == 1) {
						cb(response);
						try {
							expect(el.classList.contains('progress')).to.be.true;
						}
						catch (e) {
							done(e);
							stub.restore();
						}
					}
					else {
						cb(successMessage);
						try {
							let dt = Date.now() - t;
							expect(dt > 950 && dt < 1050).to.be.true;
							done();
						}
						catch(e) {
							done(e);
						}
						finally {
							stub.restore();
						}
					}
				});
				MyForm.submit();
			});
		});
	});

});
