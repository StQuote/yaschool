describe("formUtils", function() {

	describe("#fio()", function() {
		let n = formUtils.fio;
		it('should success if there is 3 words(possible with dash character) with cyrrylic chars', function () {
			expect(n("   Дубинин    Витаутас     Богуславович    ")).to.equal(true);
			expect(n("   Дубинин    Витаутас-Вальтер   \n  Богуславович    ")).to.equal(true);
			expect(n("   Dubinin    Vitautas-Valter     Boguslavovich    ")).to.equal(true);
		});

		it('should fail when the value is not presented', function() {
			expect(n()).to.equal(false);
			expect(n("")).to.equal(false);
			expect(n(null)).to.equal(false);
		});

		it('should fail when value is not equal 3 words', function () {
			expect(n("Дубинин Витаутас Богуславович Дубинин")).to.equal(false);
			expect(n("Дубинин Витаутас  ")).to.equal(false);
		});

		it('should fail when value contains non word chars except(dash)', function () {
			expect(n("   Дубинин#    Витаутас!-Вальтер     Богуславович@    ")).to.equal(false);
		});
	});


	describe("#email()", function() {
		let e = formUtils.email;
		
		const validDomains = [
			'ya.ru',
			'yandex.ru',
			'yandex.ua',
			'yandex.by',
			'yandex.kz',
			'yandex.com'
		];
		
		validDomains.forEach( domain => {
			it('should succcess when value is correct email address with \'' + domain + '\' domain', function () {
				expect(e("user1@" + domain)).to.equal(true);
			})
		});

		it('should apply only yandex domains', function() {
			expect(e("user1@gmail.com")).to.equal(false);
			expect(e("user1@mail.ru")).to.equal(false);
			expect(e("user1@bk.ru")).to.equal(false);
		});

		it('should fail when the value is not presented', function() {
			expect(e()).to.equal(false);
			expect(e("")).to.equal(false);
			expect(e(null)).to.equal(false);
		});

		it('should fail when the value is not correct email', function() {
			expect(e("abc.def.com")).to.equal(false);
			expect(e("abc@.def.com")).to.equal(false);
			expect(e("@def.com")).to.equal(false);
			expect(e("abs@def.r")).to.equal(false);
			expect(e(".abs@def.r")).to.equal(false);
			expect(e("abs()*@def.r")).to.equal(false);
			expect(e("ab..s@def.r")).to.equal(false);
		});
	});

	describe('#phone()', function() {
		let p = formUtils.phone;


		it('should fail when the value is not presented', function() {
			expect(p()).to.equal(false);
			expect(p("")).to.equal(false);
			expect(p(null)).to.equal(false);
		});

		it('should fail when the value have not correct format', function() {
			expect(p("+6(999)999-99-99")).to.equal(false);
			expect(p("+7(999)999-99-9")).to.equal(false);
			expect(p("+7(999)999-99-a9")).to.equal(false);
			expect(p("+7(999)999-9999")).to.equal(false);
			expect(p("+7(999)9999999")).to.equal(false);
			expect(p("+79999999999")).to.equal(false);
			expect(p("799999999ab")).to.equal(false);
			expect(p("+7(123)456-78-90")).to.equal(false);
			expect(p("+7(222)444-55-66")).to.equal(false);
		});

		it('should success when the value have correct format and sum', function() {
			expect(p("+7(111)222-33-11")).to.equal(true);
		});
	});

	describe('#request()', function() {

		it('should make request with passed formdata', function(done) {
			const xhr = sinon.useFakeXMLHttpRequest();
			const requests = [];
			xhr.onCreate = function( req ) {
				requests.push(req);
			}
			const testData = {
				myfield2: "myfieldvalue",
				myfield3: "myfieldvalue3"
			};
			let fd = new FormData();

			Object.keys(testData).forEach(k => {
				fd.append(k, testData[k]);
			});

			formUtils.request("POST", '/base/myaction', fd, () => {
				done();
			});
			try {
				expect(requests).to.have.lengthOf(1);
				let req = requests[0];
				Object.keys(testData).forEach(k => {
					expect(req.requestBody.get(k)).to.be.equal(testData[k]);
				});
				req.respond(200,
							{'Content-Type': 'application/json'},
							JSON.stringify(
								{
									status:'success'
								}
							));

			}
			catch (e) {
				done(e);
			}
		});
	});
});
