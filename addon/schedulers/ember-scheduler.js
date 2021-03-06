import Ember from "ember";
import Rx from "rxjs/Rx";

var Scheduler = Rx.Scheduler;
var SingleAssignmentDisposable = Rx.SingleAssignmentDisposabledisposable;

function scheduleNow(state, action) {
	var scheduler = this;
	var disposable = new SingleAssignmentDisposable();
	scheduleEmberAction(disposable, this._queue, this._target, state, action, scheduler);
	return disposable;
}

function scheduleFuture(state, dueTime, action) {
	var dt = Scheduler.normalize(dueTime);
	var disposable = new SingleAssignmentDisposable();

	Ember.run.later(this, function() {
		scheduleEmberAction(disposable, this._queue, this._target, state, action, this);
	}, dt);

	return disposable;
}

function scheduleEmberAction(disposable, queue, target, state, action, scheduler) {
	Ember.run.join(this, function() {
		Ember.run.schedule(queue, target, function() {
			if(!disposable.isDisposed) {
				disposable.setDisposable(action(scheduler, state));
			}
		});
	});
}

/**
	Creates an Rx Scheduler that uses a specified Ember Run Loop Queue.
	@method emberScheduler
	@param queue {String} the name of the ember queue to create the Rx Scheduler for
	@param target {Ember.Object} the object to use as the context of the Ember run schedule
	@return {Rx.Scheduler}
*/
export default function emberScheduler(queue, target) {
	var scheduler = new Scheduler();
  scheduler.now = Date.now;
  scheduler.schedule = scheduleNow;
  scheduler._scheduleFuture = scheduleFuture;
	scheduler._target = target;
	scheduler._queue = queue;
	return scheduler;
}
