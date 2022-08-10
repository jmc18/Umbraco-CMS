import { expect } from '@open-wc/testing';

import { UmbNotificationHandler, UmbNotificationService } from '.';

describe('UCPNotificationService', () => {
	let notificationService: UmbNotificationService;

	beforeEach(async () => {
		notificationService = new UmbNotificationService();
	});

	describe('Public API', () => {
		describe('properties', () => {
			it('has a dialog property', () => {
				expect(notificationService).to.have.property('notifications');
			});
		});

		describe('methods', () => {
			it('has a peek method', () => {
				expect(notificationService).to.have.property('peek').that.is.a('function');
			});

			it('has a stay method', () => {
				expect(notificationService).to.have.property('stay').that.is.a('function');
			});
		});
	});

	describe('peek', () => {
		let peekNotificationHandler: UmbNotificationHandler | undefined = undefined;

		beforeEach(async () => {
			const peekOptions = {
				data: { headline: 'Peek notification headline', message: 'Peek notification message' },
			};

			peekNotificationHandler = notificationService.peek('positive', peekOptions);
		});

		it('it sets notification color', () => {
			expect(peekNotificationHandler?.color).to.equal('positive');
		});

		it('should set peek data on the notification element', () => {
			const data = peekNotificationHandler?.element.data;
			expect(data.headline).to.equal('Peek notification headline');
			expect(data.message).to.equal('Peek notification message');
		});

		it('it sets duration to 6000 ms', () => {
			expect(peekNotificationHandler?.duration).to.equal(6000);
		});
	});

	describe('stay', () => {
		let stayNotificationHandler: UmbNotificationHandler | undefined = undefined;

		beforeEach(async () => {
			const stayOptions = {
				data: { headline: 'Stay notification headline', message: 'Stay notification message' },
			};

			stayNotificationHandler = notificationService.stay('danger', stayOptions);
		});

		it('it sets notification color', () => {
			expect(stayNotificationHandler?.color).to.equal('danger');
		});

		it('should set stay data on the notification element', () => {
			const data = stayNotificationHandler?.element.data;
			expect(data.headline).to.equal('Stay notification headline');
			expect(data.message).to.equal('Stay notification message');
		});

		it('it sets the duration to null', () => {
			expect(stayNotificationHandler?.duration).to.equal(null);
		});
	});
});
